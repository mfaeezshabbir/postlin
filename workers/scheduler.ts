/**
 * Scheduled Post Publisher Worker
 * 
 * This worker runs every minute to check for posts that need to be published.
 * When a post's scheduledAt time has passed, it automatically publishes it to LinkedIn.
 */

import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

export class ScheduledPostWorker {
  private timeoutId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Start the worker with dynamic scheduling
   * Instead of polling every minute, we calculate when the next post should be published
   * and set a timer for that exact moment.
   */
  start() {
    if (this.isRunning) {
      log.warn('⚠️ Scheduler worker already running');
      return;
    }

    log.info('🚀 Starting scheduled post worker with dynamic scheduling...');
    this.isRunning = true;

    // Start the scheduling loop
    this.scheduleNextCheck();

    log.info('✅ Scheduled post worker started (dynamic scheduling)');
  }

  /**
   * Stop the worker
   */
  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isRunning = false;
    log.info('🛑 Scheduled post worker stopped');
  }

  /**
   * Trigger an immediate reschedule
   * Call this when a new post is scheduled to update the timer immediately
   */
  reschedule() {
    if (!this.isRunning) {
      log.warn('⚠️ Cannot reschedule - worker is not running');
      return;
    }

    log.info('🔄 Rescheduling worker due to new post...');
    
    // Cancel current timer
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Reschedule immediately
    this.scheduleNextCheck();
  }

  /**
   * Schedule the next check based on when the next post is due
   */
  private async scheduleNextCheck() {
    try {
      if (!this.isRunning) return;

      const now = new Date();

      // First, check and publish any posts that are already due
      const publishedCount = await this.checkAndPublishScheduledPosts();

      // If we published any posts, immediately check again for more due posts
      if (publishedCount > 0) {
        log.info('🔄 Published posts, checking immediately for more...');
        // Use setImmediate to avoid stack overflow, but run immediately
        setImmediate(() => this.scheduleNextCheck());
        return;
      }

      // Find the next scheduled post (future posts only)
      const nextPost = await prisma.post.findFirst({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            gt: now, // Greater than current time (future posts only)
          },
        },
        orderBy: {
          scheduledAt: 'asc', // Get the earliest one
        },
      });

      // If there's a next post, schedule a timer for it
      if (nextPost && nextPost.scheduledAt) {
        const timeUntilPost = nextPost.scheduledAt.getTime() - now.getTime();
        
        // Add a small buffer (1 second) to ensure we don't miss it
        const delay = Math.max(1000, timeUntilPost + 1000);

        log.info(`⏰ Next post scheduled for ${nextPost.scheduledAt.toISOString()}`);
        log.info(`⏳ Will check again in ${Math.round(delay / 1000)} seconds`);

        this.timeoutId = setTimeout(() => {
          this.scheduleNextCheck();
        }, delay);
      } else {
        // No upcoming posts, check again in 5 minutes
        log.info('📭 No upcoming scheduled posts. Will check again in 5 minutes.');
        
        this.timeoutId = setTimeout(() => {
          this.scheduleNextCheck();
        }, 5 * 60 * 1000); // 5 minutes
      }
    } catch (error) {
      log.error('❌ Error scheduling next check:', error);
      
      // On error, retry in 1 minute
      this.timeoutId = setTimeout(() => {
        this.scheduleNextCheck();
      }, 60 * 1000);
    }
  }

  /**
   * Check for posts that need to be published and publish them
   * @returns The number of posts that were published
   */
  private async checkAndPublishScheduledPosts(): Promise<number> {
    try {
      const now = new Date();
      
      log.info(`⏰ Checking for scheduled posts to publish... (current time: ${now.toISOString()})`);

      // Find all posts that are scheduled and past their scheduled time
      const postsToPublish = await prisma.post.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            lte: now, // Less than or equal to current time
          },
        },
        include: {
          user: true, // Include user for LinkedIn access token
        },
      });

      if (postsToPublish.length === 0) {
        log.info('📭 No posts to publish at this time');
        return 0;
      }

      log.info(`📬 Found ${postsToPublish.length} post(s) to publish`);

      // Publish each post
      let publishedCount = 0;
      for (const post of postsToPublish) {
        const success = await this.publishPost(post);
        if (success) {
          publishedCount++;
        }
      }

      log.info(`✅ Finished processing scheduled posts (${publishedCount} published)`);
      return publishedCount;
    } catch (error) {
      log.error('❌ Error checking scheduled posts:', error);
      return 0;
    }
  }

  /**
   * Publish a single post to LinkedIn
   * @returns true if published successfully, false otherwise
   */
  private async publishPost(post: any): Promise<boolean> {
    try {
      log.info(`📤 Publishing post ${post.id} scheduled for ${post.scheduledAt}`);
      log.info(`👤 User: ${post.user.email}, Has access token: ${!!post.user.accessToken}`);

      // Check if user has LinkedIn access token
      if (!post.user.accessToken) {
        log.error(`❌ User ${post.user.email} has no LinkedIn access token`);
        
        // Update post status to failed
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'DRAFT', // Revert to draft
          },
        });
        
        return false;
      }

      // Publish to LinkedIn
      const response = await this.publishToLinkedIn(
        post.user.accessToken,
        post.draftText,
        post.imageUrl
      );

      if (response.success) {
        // Update post status to PUBLISHED
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            linkedInPostId: response.linkedInPostId || 'unknown',
            finalText: post.draftText, // Save the published text
          },
        });

        log.info(`✅ Successfully published post ${post.id} to LinkedIn`, {
          linkedInPostId: response.linkedInPostId
        });
        return true;
      } else {
        throw new Error(response.error || 'Failed to publish to LinkedIn');
      }
    } catch (error) {
      log.error(`❌ Error publishing post ${post.id}:`, error);

      // Update post with error (revert to draft for now)
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'DRAFT', // Revert to draft so user can retry
        },
      });
      
      return false;
    }
  }

  /**
   * Publish content to LinkedIn API
   */
  private async publishToLinkedIn(
    accessToken: string,
    text: string,
    imageUrl?: string | null
  ): Promise<{ success: boolean; error?: string; linkedInPostId?: string }> {
    try {
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
        throw new Error(`Failed to fetch LinkedIn user profile: ${userProfileResponse.status}`);
      }

      const userProfile = await userProfileResponse.json();
      log.info('LinkedIn user profile:', userProfile);
      
      // The 'sub' field contains the Person URN (e.g., "8675309" part of "urn:li:person:8675309")
      const personId = userProfile.sub;
      
      if (!personId) {
        throw new Error('LinkedIn Person ID (sub) not found in user profile');
      }

      // Prepare post payload according to LinkedIn Share API
      const postPayload: any = {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text,
            },
            shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // If there's an image, upload it first
      if (imageUrl) {
        const imageUploadResult = await this.uploadImageToLinkedIn(
          accessToken,
          personId,
          imageUrl
        );

        if (imageUploadResult.success && imageUploadResult.assetId) {
          postPayload.specificContent['com.linkedin.ugc.ShareContent'].media = [
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
        } else {
          log.warn(`⚠️ Image upload failed, posting without image`);
        }
      }

      // Publish post to LinkedIn
      const publishResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(postPayload),
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `LinkedIn API error: ${publishResponse.status}`);
      }

      // Get the LinkedIn post ID from response header
      const linkedInPostId = publishResponse.headers.get('X-RestLi-Id') || 
                             publishResponse.headers.get('x-restli-id');

      if (!linkedInPostId) {
        log.warn('⚠️ LinkedIn post created but no post ID in response header');
      }

      return { 
        success: true, 
        linkedInPostId: linkedInPostId || undefined 
      };
    } catch (error) {
      log.error('❌ LinkedIn API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload image to LinkedIn
   */
  private async uploadImageToLinkedIn(
    accessToken: string,
    linkedInUserId: string,
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
            owner: `urn:li:person:${linkedInUserId}`,
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
      log.info('📦 Upload URL and Asset:', {
        hasUploadUrl: !!registerData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl,
        asset: registerData.value?.asset
      });

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
}

// Export singleton instance
export const scheduledPostWorker = new ScheduledPostWorker();
