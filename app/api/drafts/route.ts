import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * GET /api/drafts
 * Fetch all drafts for the authenticated user
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

    // Fetch drafts
    const drafts = await prisma.post.findMany({
      where: {
        userId: user.id,
        status: 'DRAFT',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats (for now, all drafts are counted as manual since we don't have isAIGenerated field yet)
    const stats = {
      total: drafts.length,
      aiGenerated: 0, // Will be tracked when we add AI generation metadata
      manual: drafts.length,
    };

    return NextResponse.json({
      success: true,
      drafts,
      stats,
    });
  } catch (error) {
    log.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drafts
 * Create a new draft
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

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create draft
    const draft = await prisma.post.create({
      data: {
        userId: user.id,
        draftText: content,
        status: 'DRAFT',
      },
    });

    log.info(`Draft created: ${draft.id} for user: ${user.email}`);

    return NextResponse.json({
      success: true,
      draft,
    }, { status: 201 });
  } catch (error) {
    log.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}
