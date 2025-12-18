import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/modules/auth";
import { log } from "@/lib/logger";
import { randomBytes } from "crypto";

/**
 * GET /api/linkedin/connect
 * Initiate LinkedIn OAuth connection flow for account linking
 * This handles LinkedIn OAuth manually since NextAuth doesn't support adding
 * a second provider to an already authenticated session
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate secure random state for CSRF protection
    const state = randomBytes(32).toString("hex");

    // Get the callback URL from query params or default to settings page
    const searchParams = request.nextUrl.searchParams;
    const callbackUrl =
      searchParams.get("callbackUrl") || "/dashboard/settings";

    // Build LinkedIn OAuth URL
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/linkedin/callback`;

    const linkedInAuthUrl = new URL(
      "https://www.linkedin.com/oauth/v2/authorization"
    );
    linkedInAuthUrl.searchParams.append("response_type", "code");
    linkedInAuthUrl.searchParams.append("client_id", clientId || "");
    linkedInAuthUrl.searchParams.append("redirect_uri", redirectUri);
    linkedInAuthUrl.searchParams.append("state", state);
    linkedInAuthUrl.searchParams.append(
      "scope",
      "openid profile email w_member_social"
    );

    log.info("LinkedIn connect initiated", { userId: session.user.email });

    // Create response with redirect
    const response = NextResponse.redirect(linkedInAuthUrl.toString());

    // Store state and callback URL in secure HTTP-only cookies
    response.cookies.set("linkedin_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    response.cookies.set("linkedin_callback_url", callbackUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    log.error("Error in GET /api/linkedin/connect:", error);
    return NextResponse.json(
      { error: "Failed to initiate LinkedIn connection" },
      { status: 500 }
    );
  }
}
