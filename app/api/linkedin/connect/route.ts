import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';

/**
 * GET /api/linkedin/connect
 * Initiate LinkedIn OAuth connection for logged-in user
 * This redirects to NextAuth's LinkedIn provider
 */
export async function GET() {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in with Google first' },
        { status: 401 }
      );
    }

    // Redirect to NextAuth LinkedIn provider
    // The signIn callback in auth config will handle linking to existing user
    return NextResponse.redirect(
      new URL('/api/auth/signin/linkedin', process.env.NEXTAUTH_URL || 'http://localhost:3000')
    );
  } catch (error) {
    console.error('Error initiating LinkedIn connection:', error);
    return NextResponse.json(
      { error: 'Failed to connect LinkedIn' },
      { status: 500 }
    );
  }
}
