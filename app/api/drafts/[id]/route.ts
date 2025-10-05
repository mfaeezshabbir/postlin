import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * GET /api/drafts/[id]
 * Fetch a specific draft
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const draft = await prisma.post.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (error) {
    log.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/drafts/[id]
 * Update a draft
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if draft exists and belongs to user
    const existingDraft = await prisma.post.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, imageUrl, imagePrompt, hashtags, isAIGenerated } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      draftText: content,
    };

    // Only update fields if they are provided
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }
    if (imagePrompt !== undefined) {
      updateData.imagePrompt = imagePrompt; // Store or update the image prompt
    }
    if (hashtags !== undefined) {
      updateData.hashtags = hashtags;
    }
    if (isAIGenerated !== undefined) {
      updateData.isAIGenerated = isAIGenerated;
    }

    // Update draft
    const updatedDraft = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
    });

    log.info(`Draft updated: ${params.id}${imageUrl ? ' (with image)' : ''}${imagePrompt ? ' (with image prompt)' : ''}`);

    return NextResponse.json({
      success: true,
      draft: updatedDraft,
    });
  } catch (error) {
    log.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/drafts/[id]
 * Delete a draft
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if draft exists and belongs to user
    const existingDraft = await prisma.post.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    // Delete draft
    await prisma.post.delete({
      where: { id: params.id },
    });

    log.info(`Draft deleted: ${params.id}`);

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    log.error('Error deleting draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
