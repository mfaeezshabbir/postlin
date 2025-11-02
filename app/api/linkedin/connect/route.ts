import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import { log } from '@/lib/logger';

/**
 * GET /api/linkedin/connect
 * Initiate LinkedIn OAuth connection flow
 * This redirects users to LinkedIn OAuth with appropriate scopes
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

    // Build LinkedIn OAuth URL
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`;
    // Use a simple random state for CSRF protection
    const state = Buffer.from(Math.random().toString()).toString('base64');

    const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    linkedInAuthUrl.searchParams.append('response_type', 'code');
    linkedInAuthUrl.searchParams.append('client_id', clientId || '');
    linkedInAuthUrl.searchParams.append('redirect_uri', redirectUri);
    linkedInAuthUrl.searchParams.append('state', state);
    linkedInAuthUrl.searchParams.append('scope', 'openid profile email w_member_social');

    log.info('LinkedIn connect initiated', { userId: session.user.email });

    // Redirect to LinkedIn OAuth
    return NextResponse.redirect(linkedInAuthUrl.toString());
  } catch (error) {
    log.error('Error in GET /api/linkedin/connect:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn connection' },
      { status: 500 }
    );
  }
}
