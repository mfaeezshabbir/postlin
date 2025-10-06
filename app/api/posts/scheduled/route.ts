import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * GET /api/posts/scheduled
 * Get all scheduled posts for the authenticated user
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

    // Fetch scheduled posts
    const scheduledPosts = await prisma.post.findMany({
      where: {
        userId: user.id,
        status: 'SCHEDULED',
      },
      orderBy: {
        scheduledAt: 'asc', // Sort by scheduled time (earliest first)
      },
    });

    log.info(`📅 Retrieved ${scheduledPosts.length} scheduled posts for user: ${user.email}`);

    return NextResponse.json({
      success: true,
      posts: scheduledPosts,
      total: scheduledPosts.length,
    });
  } catch (error) {
    log.error('Error fetching scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    );
  }
}
