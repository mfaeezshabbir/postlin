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
      }),
    ],
    session: { strategy: 'jwt' },
    callbacks: {
      // Ensure a Prisma-backed user record exists on sign in
      async signIn({ user, account, profile }) {
        try {
          const linkedInId = (profile as any)?.id || account?.providerAccountId;
          const email = user.email as string | undefined;

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
              await prisma.user.update({ where: { id: dbUser.id }, data: updateData }).catch(() => null);
            }
          } else {
            // Create new user
            const createData: any = {};
            if (user.name) createData.name = user.name;
            if (email) createData.email = email;
            if (linkedInId) createData.linkedInId = linkedInId as string;
            await prisma.user.create({ data: createData }).catch((e) => {
              log.error('create user failed', e);
            });
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
      // After sign in redirect to /dashboard
      async redirect() {
        return '/dashboard';
      },
    },
  };
}

export default getAuthOptions;
