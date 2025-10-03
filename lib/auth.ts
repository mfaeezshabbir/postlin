import { getServerSession } from 'next-auth/next';
import getAuthOptions from '../modules/auth';

export async function getCurrentUser() {
  const session = await getServerSession(getAuthOptions());
  if (!session) return null;
  return session.user as { id: string; name?: string; email?: string; linkedInId?: string | null };
}

export default getCurrentUser;
