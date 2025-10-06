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

    // Get LinkedIn Person URN from userinfo endpoint
    const userProfileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userProfileResponse.ok) {
      const errorText = await userProfileResponse.text();
      log.error('Failed to fetch LinkedIn user profile:', {
        status: userProfileResponse.status,
        error: errorText
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch LinkedIn user profile',
          details: `Status: ${userProfileResponse.status}`,
        },
        { status: userProfileResponse.status }
      );
    }

    const userProfile = await userProfileResponse.json();
    log.info('LinkedIn user profile:', userProfile);
    
    // The 'sub' field contains the Person URN (e.g., "8675309" part of "urn:li:person:8675309")
    const personId = userProfile.sub;
    
    if (!personId) {
      return NextResponse.json(
        { 
          error: 'LinkedIn Person ID not found',
          details: 'Unable to retrieve Person ID from LinkedIn profile',
        },
        { status: 500 }
      );
    }

    // Prepare the request body according to LinkedIn Share API
    const requestBody: any = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: draft.draftText,
          },
          shareMediaCategory: draft.imageUrl ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // If there's an image, upload it first
    if (draft.imageUrl) {
      log.info('📸 Post has an image, uploading to LinkedIn...');
      const imageUploadResult = await uploadImageToLinkedIn(
        accessToken,
        personId,
        draft.imageUrl
      );

      if (imageUploadResult.success && imageUploadResult.assetId) {
        requestBody.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            description: {
              text: 'Post image',
            },
            media: imageUploadResult.assetId,
            title: {
              text: 'Image',
            },
          },
        ];
        log.info('✅ Image uploaded and attached to post');
      } else {
        log.warn('⚠️ Image upload failed, posting without image');
      }
    }

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

/**
 * Upload image to LinkedIn
 */
async function uploadImageToLinkedIn(
  accessToken: string,
  personId: string,
  imageUrl: string
): Promise<{ success: boolean; assetId?: string }> {
  try {
    log.info('📸 Step 1: Registering image upload with LinkedIn...');
    
    // Step 1: Register upload
    const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${personId}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      log.error('❌ Failed to register image upload:', {
        status: registerResponse.status,
        error: errorText
      });
      throw new Error(`Failed to register image upload: ${registerResponse.status}`);
    }

    const registerData = await registerResponse.json();
    log.info('✅ Image registration successful');

    const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = registerData.value.asset;

    if (!uploadUrl || !asset) {
      throw new Error('Upload URL or asset ID not found in registration response');
    }

    // Step 2: Download image from our storage
    log.info('📥 Step 2: Downloading image from storage...');
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    log.info(`✅ Image downloaded (${imageBuffer.byteLength} bytes)`);

    // Step 3: Upload image binary to LinkedIn
    log.info('📤 Step 3: Uploading image binary to LinkedIn...');
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      log.error('❌ Failed to upload image to LinkedIn:', {
        status: uploadResponse.status,
        error: errorText
      });
      throw new Error(`Failed to upload image to LinkedIn: ${uploadResponse.status}`);
    }

    log.info('✅ Image uploaded successfully to LinkedIn');
    return { success: true, assetId: asset };
  } catch (error) {
    log.error('❌ Image upload error:', error);
    return { success: false };
  }
}
