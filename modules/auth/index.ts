import { NextAuthOptions } from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../lib/prisma";
import { log } from "../../lib/logger";

export function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
          },
        },
      }),
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
          const email = user.email as string | undefined;
          const provider = account?.provider;

          log.info("signIn callback", {
            provider,
            email,
            userId: user.id,
          });

          if (!email) {
            log.error("No email provided by OAuth provider");
            return false;
          }

          // Handle Google OAuth
          if (provider === "google") {
            const googleId = account?.providerAccountId;
            
            // Try to find existing user by googleId or email
            let dbUser = await prisma.user
              .findFirst({
                where: {
                  OR: [
                    { googleId: googleId },
                    { email: email },
                  ],
                },
              })
              .catch(() => null);

            if (dbUser) {
              // Update user with Google ID if not set
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
              log.info("Google user updated", { userId: dbUser.id });
            } else {
              // Create new user with Google auth
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
                log.info("Google user created", { userId: newUser.id });
              }
            }
            return true;
          }

          // Handle LinkedIn OAuth (existing logic)
          if (provider === "linkedin") {
            const linkedInId =
              (profile as any)?.sub ||
              (profile as any)?.id ||
              account?.providerAccountId;
            const accessToken = account?.access_token;
            const refreshToken = account?.refresh_token;

            // Try to find existing user by linkedInId or email
            let dbUser = null as any;
            if (linkedInId) {
              dbUser = await prisma.user
                .findUnique({ where: { linkedInId } as any })
                .catch(() => null);
            }
            if (!dbUser && email) {
              dbUser = await prisma.user
                .findUnique({ where: { email } })
                .catch(() => null);
            }

            if (dbUser) {
              // Update profile fields
              const updateData: any = {};
              if (user.name) updateData.name = user.name;
              if (email) updateData.email = email;
              if ((user as any).image) updateData.image = (user as any).image;
              if (linkedInId) updateData.linkedInId = linkedInId as string;
              // Store access token and refresh token in database
              if (accessToken) updateData.accessToken = accessToken;
              if (refreshToken) updateData.refreshToken = refreshToken;
              // Mark LinkedIn as connected
              updateData.linkedInConnected = true;
              // Store OAuth data in JSON field
              if (accessToken || refreshToken) {
                updateData.linkedInOauthData = {
                  accessToken,
                  refreshToken,
                  connectedAt: new Date().toISOString(),
                };
              }

              if (Object.keys(updateData).length > 0) {
                await prisma.user
                  .update({ where: { id: dbUser.id }, data: updateData })
                  .catch((e: any) => {
                    log.error("update user failed", e);
                  });
              }
              log.info("LinkedIn user updated", {
                userId: dbUser.id,
                hasToken: !!accessToken,
              });
            } else {
              // Create new user with LinkedIn
              const createData: any = {};
              if (user.name) createData.name = user.name;
              if ((user as any).image) createData.image = (user as any).image;
              if (email) createData.email = email;
              if (linkedInId) createData.linkedInId = linkedInId as string;
              if (accessToken) createData.accessToken = accessToken;
              if (refreshToken) createData.refreshToken = refreshToken;
              createData.linkedInConnected = true;
              if (accessToken || refreshToken) {
                createData.linkedInOauthData = {
                  accessToken,
                  refreshToken,
                  connectedAt: new Date().toISOString(),
                };
              }

              const newUser = await prisma.user
                .create({ data: createData })
                .catch((e: any) => {
                  log.error("create user failed", e);
                  return null;
                });
              if (newUser) {
                log.info("LinkedIn user created", {
                  userId: newUser.id,
                  hasToken: !!accessToken,
                });
              }
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
            linkedInId: dbUser.linkedInId || null,
            image: dbUser.image || (session.user ? (session.user as any).image : undefined),
          } as any;
          // Add access token to session
          (session as any).accessToken = token.accessToken;
          return session;
        } catch (e) {
          log.error("session callback error", e);
          return session;
        }
      },
      // After sign in redirect to appropriate page
      async redirect({ url, baseUrl }) {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url;
        
        // Default redirect for all sign-ins
        return `${baseUrl}/dashboard/drafts`;
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
