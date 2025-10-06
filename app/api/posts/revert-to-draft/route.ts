import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/posts/revert-to-draft
 * Revert a published/scheduled post back to draft status
 * Clears the linkedInPostId so it gets a fresh ID when republished
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Get the post and verify ownership
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: user.id,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Revert post to draft status and clear LinkedIn-specific fields
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'DRAFT',
        linkedInPostId: null, // Clear the old LinkedIn post ID
        publishedAt: null,
        scheduledAt: null,
        finalText: null,
      },
    });

    log.info(`Post ${postId} reverted to draft (cleared linkedInPostId: ${post.linkedInPostId})`);

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Post reverted to draft. You can now edit and republish it.',
    });
  } catch (error) {
    log.error('Error reverting post to draft:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to revert post to draft',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
