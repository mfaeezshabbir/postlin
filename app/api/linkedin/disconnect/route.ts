import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/linkedin/disconnect
 * Disconnect LinkedIn account from current user
 */
export async function POST() {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Remove LinkedIn connection
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        linkedInId: null,
        linkedInConnected: false,
        accessToken: null,
        refreshToken: null,
      },
    });

    log.info('LinkedIn disconnected for user', { email: session.user.email });

    return NextResponse.json({
      success: true,
      message: 'LinkedIn account disconnected successfully',
    });
  } catch (error) {
    log.error('Error disconnecting LinkedIn:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect LinkedIn' },
      { status: 500 }
    );
  }
}
