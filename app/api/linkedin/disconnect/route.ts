import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/linkedin/disconnect
 * Disconnect LinkedIn account from user profile
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Clear LinkedIn connection data (but keep the user record)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        linkedInConnected: false,
        linkedInOAuthData: null,
        // Note: We keep linkedInId for historical tracking
        // and to prevent creating duplicate users if they reconnect
      },
    });

    log.info('LinkedIn disconnected for user', { userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'LinkedIn account disconnected successfully',
    });
  } catch (error) {
    log.error('Error disconnecting LinkedIn:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect LinkedIn account' },
      { status: 500 }
    );
  }
}
