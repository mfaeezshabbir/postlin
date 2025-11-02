import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';

/**
 * GET /api/linkedin/connect
 * Initiate LinkedIn OAuth connection (redirects to NextAuth)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Redirect to NextAuth LinkedIn sign-in
    // The callback URL will handle updating the user's LinkedIn connection status
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/onboarding?step=complete';
    const signInUrl = `/api/auth/signin/linkedin?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    return NextResponse.redirect(new URL(signInUrl, request.url));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn connection' },
      { status: 500 }
    );
  }
}
