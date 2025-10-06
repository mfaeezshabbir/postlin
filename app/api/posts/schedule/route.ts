import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/posts/schedule
 * Schedule a draft to be published at a specific time
 */
export async function POST(request: NextRequest) {
  try {
    log.info('📅 POST /api/posts/schedule - Received schedule request');
    
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      log.warn('⚠️ Unauthorized schedule attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    log.info(`🔐 Authenticated user: ${session.user.email}`);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      log.error(`❌ User not found in database: ${session.user.email}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { postId, scheduledAt } = body;

    log.info('📝 Schedule data received:', {
      postId,
      scheduledAt,
    });

    if (!postId || !scheduledAt) {
      log.warn('⚠️ Schedule failed: Missing postId or scheduledAt');
      return NextResponse.json(
        { error: 'Post ID and scheduled time are required' },
        { status: 400 }
      );
    }

    // Validate scheduledAt is a future date
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    
    if (scheduledDate <= now) {
      log.warn('⚠️ Schedule failed: Scheduled time must be in the future');
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Get the post and verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      log.error(`❌ Post not found: ${postId}`);
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.userId !== user.id) {
      log.warn(`⚠️ Unauthorized: User ${user.id} tried to schedule post ${postId} owned by ${post.userId}`);
      return NextResponse.json(
        { error: 'Unauthorized to schedule this post' },
        { status: 403 }
      );
    }

    // Update post status to SCHEDULED
    log.info('💾 Updating post to SCHEDULED status...');
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'SCHEDULED',
        scheduledAt: scheduledDate,
      },
    });

    log.info(`✅ Post scheduled: ${updatedPost.id} for ${scheduledDate.toISOString()}`);

    // Trigger worker to reschedule immediately
    try {
      const { scheduledPostWorker } = await import('@/workers/scheduler');
      if (scheduledPostWorker?.reschedule) {
        await scheduledPostWorker.reschedule();
        log.info('🔄 Worker rescheduled for new post');
      }
    } catch (error) {
      log.warn('⚠️ Could not reschedule worker (may not be running):', error);
      // This is not a critical error, so we don't fail the request
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: `Post scheduled for ${scheduledDate.toLocaleString()}`,
    }, { status: 200 });
  } catch (error) {
    log.error('❌ Error scheduling post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    log.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to schedule post',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/schedule
 * Cancel a scheduled post (revert to DRAFT)
 */
export async function DELETE(request: NextRequest) {
  try {
    log.info('🗑️ DELETE /api/posts/schedule - Received cancel schedule request');
    
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Get the post and verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this scheduled post' },
        { status: 403 }
      );
    }

    // Update post status back to DRAFT and clear scheduledAt
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'DRAFT',
        scheduledAt: null,
      },
    });

    log.info(`✅ Scheduled post cancelled: ${updatedPost.id}`);

    // Trigger worker to reschedule since we removed a scheduled post
    try {
      const { scheduledPostWorker } = await import('@/workers/scheduler');
      if (scheduledPostWorker?.reschedule) {
        await scheduledPostWorker.reschedule();
        log.info('🔄 Worker rescheduled after cancellation');
      }
    } catch (error) {
      log.warn('⚠️ Could not reschedule worker (may not be running):', error);
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Scheduled post cancelled',
    }, { status: 200 });
  } catch (error) {
    log.error('❌ Error cancelling scheduled post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to cancel scheduled post',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
