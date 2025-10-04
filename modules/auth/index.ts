import { NextAuthOptions } from 'next-auth';
import LinkedInProvider from 'next-auth/providers/linkedin';
import prisma from '../../lib/prisma';
import { log } from '../../lib/logger';

export function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      LinkedInProvider({
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        wellKnown: 'https://www.linkedin.com/oauth/.well-known/openid-configuration',
        authorization: {
          params: {
            scope: 'openid profile email',
          },
        },
        checks: ['state'],
        client: {
          token_endpoint_auth_method: 'client_secret_post',
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
    session: { strategy: 'jwt' },
    callbacks: {
      // Ensure a Prisma-backed user record exists on sign in
      async signIn({ user, account, profile }) {
        try {
          // For LinkedIn OIDC, the user ID is in 'sub' field
          const linkedInId = (profile as any)?.sub || (profile as any)?.id || account?.providerAccountId;
          const email = user.email as string | undefined;

          log.info('signIn callback', { linkedInId, email, userId: user.id });

          if (!email) {
            log.error('No email provided by LinkedIn');
            return false;
          }

          // Try to find existing user by linkedInId or email
          let dbUser = null as any;
          if (linkedInId) {
            dbUser = await prisma.user.findUnique({ where: { linkedInId } as any }).catch(() => null);
          }
          if (!dbUser && email) {
            dbUser = await prisma.user.findUnique({ where: { email } }).catch(() => null);
          }

          if (dbUser) {
            // Update profile fields (only include fields that are defined)
            const updateData: any = {};
            if (user.name) updateData.name = user.name;
            if (email) updateData.email = email;
            if (linkedInId) updateData.linkedInId = linkedInId as string;
            if (Object.keys(updateData).length > 0) {
              await prisma.user.update({ where: { id: dbUser.id }, data: updateData }).catch((e) => {
                log.error('update user failed', e);
              });
            }
            log.info('User updated', { userId: dbUser.id });
          } else {
            // Create new user
            const createData: any = {};
            if (user.name) createData.name = user.name;
            if (email) createData.email = email;
            if (linkedInId) createData.linkedInId = linkedInId as string;
            const newUser = await prisma.user.create({ data: createData }).catch((e) => {
              log.error('create user failed', e);
              return null;
            });
            if (newUser) {
              log.info('User created', { userId: newUser.id });
            }
          }

          return true;
        } catch (err) {
          log.error('signIn callback error', err);
          return false;
        }
      },
      // Attach database id and linkedInId to the session object
      async session({ session }) {
        try {
          const email = session.user && session.user.email ? session.user.email : null;
          if (!email) return session;
          const dbUser = await prisma.user.findUnique({ where: { email } }).catch(() => null);
          if (!dbUser) return session;
          session.user = {
            id: dbUser.id,
            name: dbUser.name || (session.user ? session.user.name : undefined),
            email: dbUser.email || (session.user ? session.user.email : undefined),
            linkedInId: dbUser.linkedInId || null,
          } as any;
          return session;
        } catch (e) {
          log.error('session callback error', e);
          return session;
        }
      },
      // After sign in redirect to /dashboard/drafts
      async redirect({ url, baseUrl }) {
        // Allows relative callback URLs
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url;
        return `${baseUrl}/dashboard/drafts`;
      },
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
    debug: process.env.NODE_ENV === 'development',
  };
}

export default getAuthOptions;
