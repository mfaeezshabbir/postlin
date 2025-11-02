import { NextAuthOptions } from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../lib/prisma";
import { log } from "../../lib/logger";

export function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      // Google as primary authentication provider
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      }),
      // LinkedIn as optional secondary provider for posting
      LinkedInProvider({
        clientId: process.env.LINKEDIN_CLIENT_ID || "",
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
        wellKnown:
          "https://www.linkedin.com/oauth/.well-known/openid-configuration",
        authorization: {
          params: {
            // Add w_member_social scope for posting to LinkedIn
            scope: "openid profile email w_member_social",
          },
        },
        checks: ["state"],
        client: {
          token_endpoint_auth_method: "client_secret_post",
        },
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          };
        },
      }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
      // Store access token in JWT
      async jwt({ token, account, profile }) {
        // Persist the OAuth access_token to the token right after signin
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
        }
        return token;
      },
      // Ensure a Prisma-backed user record exists on sign in
      async signIn({ user, account, profile }) {
        try {
          const provider = account?.provider;
          const email = user.email as string | undefined;
          const accessToken = account?.access_token;
          const refreshToken = account?.refresh_token;

          log.info("signIn callback", {
            provider,
            email,
            userId: user.id,
            hasAccessToken: !!accessToken,
          });

          if (!email) {
            log.error(`No email provided by ${provider}`);
            return false;
          }

          // Handle Google sign-in (primary authentication)
          if (provider === 'google') {
            const googleId = account?.providerAccountId || (profile as any)?.sub;
            
            // Try to find existing user by googleId or email
            let dbUser = await prisma.user
              .findFirst({
                where: {
                  OR: [
                    { googleId: googleId },
                    { email: email }
                  ]
                }
              })
              .catch(() => null);

            if (dbUser) {
              // Update existing user with Google ID if not set
              const updateData: any = {};
              if (user.name) updateData.name = user.name;
              if ((user as any).image) updateData.image = (user as any).image;
              if (googleId && !dbUser.googleId) updateData.googleId = googleId;

              if (Object.keys(updateData).length > 0) {
                await prisma.user
                  .update({ where: { id: dbUser.id }, data: updateData })
                  .catch((e: any) => {
                    log.error("update user failed", e);
                  });
              }
              log.info("User signed in with Google", { userId: dbUser.id });
            } else {
              // Create new user with Google
              const createData: any = {
                email: email,
                googleId: googleId,
              };
              if (user.name) createData.name = user.name;
              if ((user as any).image) createData.image = (user as any).image;

              const newUser = await prisma.user
                .create({ data: createData })
                .catch((e: any) => {
                  log.error("create user failed", e);
                  return null;
                });
              if (newUser) {
                log.info("New user created with Google", { userId: newUser.id });
              }
            }
            return true;
          }

          // Handle LinkedIn connection (optional, requires existing Google account)
          if (provider === 'linkedin') {
            const linkedInId =
              (profile as any)?.sub ||
              (profile as any)?.id ||
              account?.providerAccountId;

            // Find user by email (must already exist via Google sign-in)
            let dbUser = await prisma.user
              .findUnique({ where: { email } })
              .catch(() => null);

            if (dbUser) {
              // Update user with LinkedIn connection
              const updateData: any = {
                linkedInId: linkedInId as string,
                linkedInConnected: true,
                accessToken: accessToken,
                refreshToken: refreshToken,
              };

              await prisma.user
                .update({ where: { id: dbUser.id }, data: updateData })
                .catch((e: any) => {
                  log.error("update user with LinkedIn failed", e);
                });

              log.info("LinkedIn connected to user", {
                userId: dbUser.id,
                hasToken: !!accessToken,
              });
            } else {
              // If user doesn't exist, they need to sign in with Google first
              log.warn("LinkedIn sign-in attempt without Google account", { email });
              return false;
            }
            return true;
          }

          return true;
        } catch (err) {
          log.error("signIn callback error", err);
          return false;
        }
      },
      // Attach database id, linkedInId, and access token to the session object
      async session({ session, token }) {
        try {
          const email =
            session.user && session.user.email ? session.user.email : null;
          if (!email) return session;
          const dbUser = await prisma.user
            .findUnique({ where: { email } })
            .catch(() => null);
          if (!dbUser) return session;
          session.user = {
            id: dbUser.id,
            name: dbUser.name || (session.user ? session.user.name : undefined),
            email:
              dbUser.email || (session.user ? session.user.email : undefined),
            googleId: dbUser.googleId || null,
            linkedInId: dbUser.linkedInId || null,
            linkedInConnected: dbUser.linkedInConnected || false,
            hasGeminiKey: !!dbUser.geminiApiKey,
            image: dbUser.image || (session.user ? (session.user as any).image : undefined),
          } as any;
          // Add access token to session (for LinkedIn)
          (session as any).accessToken = token.accessToken;
          return session;
        } catch (e) {
          log.error("session callback error", e);
          return session;
        }
      },
      // After sign in redirect - new users go to onboarding
      async redirect({ url, baseUrl }) {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url;
        
        // Default redirect to onboarding (frontend will handle skipping if already completed)
        return `${baseUrl}/onboarding`;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    debug: process.env.NODE_ENV === "development",
  };
}

export default getAuthOptions;
