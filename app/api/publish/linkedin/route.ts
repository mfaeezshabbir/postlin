import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/publish/linkedin
 * Publish a draft to LinkedIn
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

    if (!user.linkedInId) {
      return NextResponse.json(
        { error: 'LinkedIn account not connected' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { draftId } = body;

    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    // Get the draft
    const draft = await prisma.post.findFirst({
      where: {
        id: draftId,
        userId: user.id,
        status: 'DRAFT',
      },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found or already published' },
        { status: 404 }
      );
    }

    // Get LinkedIn access token from session
    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'LinkedIn access token not found. Please log out and log in again to grant posting permissions.',
          details: 'Access token missing from session'
        },
        { status: 401 }
      );
    }

    log.info('Publishing to LinkedIn', { 
      userId: user.id, 
      linkedInId: user.linkedInId,
      draftId 
    });

    // Prepare the request body according to LinkedIn Share API
    const requestBody = {
      author: `urn:li:person:${user.linkedInId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: draft.draftText,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    log.info('LinkedIn request body:', JSON.stringify(requestBody, null, 2));

    // Publish to LinkedIn using UGC Posts API
    const linkedInResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await linkedInResponse.text();
    log.info('LinkedIn API response:', { 
      status: linkedInResponse.status,
      statusText: linkedInResponse.statusText,
      headers: Object.fromEntries(linkedInResponse.headers.entries()),
      body: responseText.substring(0, 500) // Log first 500 chars
    });

    if (!linkedInResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      log.error('LinkedIn API error:', {
        status: linkedInResponse.status,
        error: errorData
      });
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to publish to LinkedIn';
      let errorDetails = errorData.message || errorData.error || 'Unknown error';

      if (linkedInResponse.status === 401) {
        errorMessage = 'LinkedIn authentication failed';
        errorDetails = 'Please log out and log in again to reconnect your LinkedIn account.';
      } else if (linkedInResponse.status === 403) {
        errorMessage = 'Permission denied';
        errorDetails = 'Please ensure you have granted posting permissions (w_member_social scope) to the app.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          statusCode: linkedInResponse.status,
          rawError: errorData
        },
        { status: linkedInResponse.status }
      );
    }

    // Get the post ID from the response header (X-RestLi-Id)
    const linkedInPostId = linkedInResponse.headers.get('X-RestLi-Id') || 
                           linkedInResponse.headers.get('x-restli-id');

    if (!linkedInPostId) {
      log.warn('LinkedIn post created but no post ID in response header');
    }

    // Update draft status in database
    const updatedPost = await prisma.post.update({
      where: { id: draftId },
      data: {
        status: 'PUBLISHED',
        linkedInPostId: linkedInPostId || 'unknown',
        publishedAt: new Date(),
        finalText: draft.draftText, // Save the published text
      },
    });

    log.info(`Post published to LinkedIn successfully`, { 
      linkedInPostId, 
      postId: updatedPost.id,
      userId: user.id 
    });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      linkedInPostId,
      message: 'Successfully published to LinkedIn!',
    });
  } catch (error) {
    log.error('Error publishing to LinkedIn:', error);
    
    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    log.error('Full error details:', { errorMessage, errorStack });
    
    return NextResponse.json(
      { 
        error: 'Failed to publish post',
        details: errorMessage,
        message: 'An unexpected error occurred while publishing to LinkedIn. Please try again.',
      },
      { status: 500 }
    );
  }
}
