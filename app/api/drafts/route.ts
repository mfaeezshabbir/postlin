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
    log.info('📥 POST /api/drafts - Received draft creation request');
    
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      log.warn('⚠️ Unauthorized draft creation attempt');
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

    log.info(`✅ Found user: ${user.id}`);

    const body = await request.json();
    const { content, imageUrl, imagePrompt, hashtags, isAIGenerated } = body;

    log.info('📝 Draft data received:', {
      contentLength: content?.length || 0,
      hasImageUrl: !!imageUrl,
      hasImagePrompt: !!imagePrompt,
      hashtagsCount: hashtags?.length || 0,
      isAIGenerated: isAIGenerated || false,
    });

    if (!content || content.trim().length === 0) {
      log.warn('⚠️ Draft creation failed: Content is required');
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create draft
    log.info('💾 Creating draft in database...');
    const draft = await prisma.post.create({
      data: {
        userId: user.id,
        draftText: content,
        status: 'DRAFT',
        imageUrl: imageUrl || null,
        imagePrompt: imagePrompt || null, // Store the image prompt
        hashtags: hashtags || [],
        isAIGenerated: isAIGenerated || false,
      },
    });

    log.info(`✅ Draft created: ${draft.id} for user: ${user.email}${imageUrl ? ' (with image)' : ''}${imagePrompt ? ' (with image prompt)' : ''}`);

    return NextResponse.json({
      success: true,
      draft,
    }, { status: 201 });
  } catch (error) {
    log.error('❌ Error creating draft:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    log.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to create draft',
        details: errorMessage // Include error details for debugging
      },
      { status: 500 }
    );
  }
}
