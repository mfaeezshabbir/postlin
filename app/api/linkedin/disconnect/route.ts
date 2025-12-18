import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/linkedin/disconnect
 * Disconnect LinkedIn account from user profile
 * This removes LinkedIn OAuth data but keeps the user account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update user to disconnect LinkedIn
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        linkedInConnected: false,
        linkedInOauthData: null,
        // Keep linkedInId for reference but clear tokens
        accessToken: null,
        refreshToken: null,
      },
      select: {
        id: true,
        linkedInConnected: true,
      },
    });

    log.info('LinkedIn disconnected', { userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'LinkedIn account disconnected successfully',
      linkedInConnected: user.linkedInConnected,
    });
  } catch (error) {
    log.error('Error in POST /api/linkedin/disconnect:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect LinkedIn account' },
      { status: 500 }
    );
  }
}
