import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/modules/auth";
import { log } from "@/lib/logger";
import prisma from "@/lib/prisma";

/**
 * GET /api/linkedin/callback
 * Handle LinkedIn OAuth callback and link account
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url)
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");
    const error = searchParams.get("error");

    // Get stored state and callback URL from cookies
    const storedState = request.cookies.get("linkedin_oauth_state")?.value;
    const callbackUrl =
      request.cookies.get("linkedin_callback_url")?.value ||
      "/dashboard/settings";

    // Handle OAuth error
    if (error) {
      log.error("LinkedIn OAuth error", { error, userId: session.user.email });
      const response = NextResponse.redirect(
        new URL(`${callbackUrl}?error=linkedin_${error}`, request.url)
      );
      // Clear cookies
      response.cookies.delete("linkedin_oauth_state");
      response.cookies.delete("linkedin_callback_url");
      return response;
    }

    // Verify state to prevent CSRF
    if (!storedState || storedState !== returnedState) {
      log.error("LinkedIn OAuth state mismatch", {
        expected: storedState,
        received: returnedState,
        userId: session.user.email,
      });
      const response = NextResponse.redirect(
        new URL(`${callbackUrl}?error=state_mismatch`, request.url)
      );
      response.cookies.delete("linkedin_oauth_state");
      response.cookies.delete("linkedin_callback_url");
      return response;
    }

    if (!code) {
      log.error("No authorization code received from LinkedIn");
      const response = NextResponse.redirect(
        new URL(`${callbackUrl}?error=no_code`, request.url)
      );
      response.cookies.delete("linkedin_oauth_state");
      response.cookies.delete("linkedin_callback_url");
      return response;
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/linkedin/callback`,
          client_id: process.env.LINKEDIN_CLIENT_ID || "",
          client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      log.error("Failed to exchange code for token", { error: errorText });
      const response = NextResponse.redirect(
        new URL(`${callbackUrl}?error=token_exchange_failed`, request.url)
      );
      response.cookies.delete("linkedin_oauth_state");
      response.cookies.delete("linkedin_callback_url");
      return response;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Fetch LinkedIn user profile with timeout and fallback
    let linkedInId: string | undefined;
    let profileData: any;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      console.log("Fetching LinkedIn profile from v2/userinfo...");
      const profileResponse = await fetch(
        "https://api.linkedin.com/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (profileResponse.ok) {
        profileData = await profileResponse.json();
        linkedInId = profileData.sub;
      } else {
        console.warn(
          "Failed to fetch from userinfo, trying v2/me...",
          await profileResponse.text()
        );
        // Fallback to v2/me
        const meResponse = await fetch("https://api.linkedin.com/v2/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (meResponse.ok) {
          profileData = await meResponse.json();
          linkedInId = profileData.id;
        } else {
          throw new Error(
            `Failed to fetch profile: ${await meResponse.text()}`
          );
        }
      }
    } catch (profileError) {
      log.error("Error fetching LinkedIn profile:", profileError);

      // If we have the access token, we might still want to proceed even if profile fetch fails
      // using the email as a fallback or just proceeding without updating linkedInId if it's not strictly required
      // But for now, let's just log it and maybe try to infer or fallback

      // Critical: If we can't get the profile ID, we can't reliably link/update the user if logic depends on it.
      // However, we are authenticating the CURRENT user (logged in via session).
      // So we technically just need to save the token.

      // If we fail to get profile, we can still save the token!
      log.warn("Proceeding with token save despite profile fetch failure");
    }

    // If we didn't get linkedInId, we can't update that specific field, but we can save the token.
    // We already identified the user by session.user.email.

    const updateData: any = {
      linkedInConnected: true,
      accessToken: accessToken,
      refreshToken: refreshToken || undefined,
      linkedInOauthData: {
        accessToken,
        refreshToken,
        connectedAt: new Date().toISOString(),
      },
    };

    if (linkedInId) {
      updateData.linkedInId = linkedInId;
    }

    // Update user's database record with LinkedIn data
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    log.info("LinkedIn account linked successfully", {
      userId: session.user.email,
      linkedInId,
    });

    // Redirect back to the callback URL with success
    const response = NextResponse.redirect(
      new URL(`${callbackUrl}?success=linkedin_connected`, request.url)
    );

    // Clear OAuth cookies
    response.cookies.delete("linkedin_oauth_state");
    response.cookies.delete("linkedin_callback_url");

    return response;
  } catch (error) {
    log.error("Error in LinkedIn callback", error);
    const callbackUrl =
      request.cookies.get("linkedin_callback_url")?.value ||
      "/dashboard/settings";
    const response = NextResponse.redirect(
      new URL(`${callbackUrl}?error=server_error`, request.url)
    );
    response.cookies.delete("linkedin_oauth_state");
    response.cookies.delete("linkedin_callback_url");
    return response;
  }
}
