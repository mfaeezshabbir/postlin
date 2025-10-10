import { getServerSession } from 'next-auth/next';
import getAuthOptions from '../modules/auth';

export async function getCurrentUser() {
  try {
    const session = await getServerSession(getAuthOptions());
    if (!session) return null;
    return session.user as { id: string; name?: string; email?: string; linkedInId?: string | null };
  } catch (err) {
    // If called outside of a request context (static generation), getServerSession
    // may throw. Fail gracefully and return null so server components can render.
    return null;
  }
}

export default getCurrentUser;
