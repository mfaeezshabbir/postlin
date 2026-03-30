/**
 * Scheduled Post Publisher Worker
 * 
 * This worker runs every minute to check for posts that need to be published.
 * When a post's scheduledAt time has passed, it automatically publishes it to LinkedIn.
 */

import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/** Maximum number of publish attempts before a post is marked FAILED */
export const MAX_RETRY_COUNT = 3;

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
   * Helper: fetch with simple retry for transient errors (network ETIMEDOUT, 5xx)
   */
  private async fetchWithRetry(
    url: string,
    options?: RequestInit,
    attempts = 3,
    backoffMs = 500
  ): Promise<Response> {
    let lastErr: any = null;
    for (let i = 1; i <= attempts; i++) {
      try {
        const resp = await fetch(url, options);
        // Treat 5xx as retryable
        if (resp.status >= 500 && resp.status < 600) {
          lastErr = new Error(`Server error ${resp.status}`);
          // small backoff before next attempt
          if (i < attempts) await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
        return resp;
      } catch (err) {
        lastErr = err;
        log.warn(`⚠️ fetch attempt ${i} for ${url} failed: ${err}`);
        if (i < attempts) {
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
        throw lastErr;
      }
    }
    throw lastErr;
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
  /**
   * Trigger an immediate reschedule
   * Call this when a new post is scheduled to update the timer immediately
   */
  async reschedule() {
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

    // Run scheduling loop immediately and wait for it to settle
    await this.scheduleNextCheck();
  }

  /**
   * Schedule the next check based on when the next post is due
   */
  private async scheduleNextCheck() {
    try {
      if (!this.isRunning) return;

      const now = new Date();

      // First, publish any posts that are already due
      const publishedCount = await this.checkAndPublishScheduledPosts();

      // If we published any posts, immediately check again for more due posts
      if (publishedCount > 0) {
        log.info('🔄 Published posts, checking immediately for more...');
        // Run immediately to catch any additional due posts
        setImmediate(() => this.scheduleNextCheck());
        return;
      }

      // Find the next scheduled post (strictly in the future)
      const nextPost = await prisma.post.findFirst({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            gt: now,
          },
        },
        orderBy: {
          scheduledAt: 'asc',
        },
      });

      // If there's a next post, decide whether to publish now or set an exact timer
      if (nextPost && nextPost.scheduledAt) {
        const timeUntilPost = nextPost.scheduledAt.getTime() - now.getTime();

        // If it's basically time now (<= 1 second), publish immediately
        if (timeUntilPost <= 1000) {
          log.info('⚡ Next post is due now, publishing immediately...');
          await this.checkAndPublishScheduledPosts();
          setImmediate(() => this.scheduleNextCheck());
          return;
        }

        // Schedule exact timer for the future post (no extra buffer)
        const delay = timeUntilPost;
        log.info(`⏰ Next post scheduled at ${nextPost.scheduledAt.toISOString()} (in ${Math.round(delay)}ms)`);
        this.timeoutId = setTimeout(() => this.scheduleNextCheck(), delay);
      } else {
        // No upcoming posts — check again in 1 minute
        log.info('📭 No upcoming posts. Checking again in 1 minute.');
        this.timeoutId = setTimeout(() => this.scheduleNextCheck(), 60 * 1000);
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
   * Check for posts that need to be published and publish them.
   * Uses an atomic claim (SCHEDULED → PUBLISHING) to prevent duplicate processing
   * in multi-instance deployments.
   * @returns The number of posts that were successfully published
   */
  private async checkAndPublishScheduledPosts(): Promise<number> {
    try {
      const now = new Date();
      
      log.info(`⏰ Checking for scheduled posts to publish... (current time: ${now.toISOString()})`);

      // Find IDs of all posts that are scheduled and past their scheduled time
      const duePosts = await prisma.post.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            lte: now,
          },
        },
        select: { id: true },
      });

      if (duePosts.length === 0) {
        log.info('📭 No posts to publish at this time');
        return 0;
      }

      log.info(`📬 Found ${duePosts.length} post(s) to process`);

      let publishedCount = 0;
      for (const { id } of duePosts) {
        // Atomic claim: only succeeds if no other worker has already claimed this post
        const claimed = await prisma.post.updateMany({
          where: { id, status: 'SCHEDULED' },
          data: { status: 'PUBLISHING' },
        });

        if (claimed.count === 0) {
          log.info(`⚠️ Post ${id} already claimed by another worker, skipping`);
          continue;
        }

        // Fetch the full post (including user) after a successful claim
        const post = await prisma.post.findUnique({
          where: { id },
          include: { user: true },
        });

        if (!post) {
          log.warn(`⚠️ Post ${id} not found after claim, skipping`);
          continue;
        }

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
      log.info(`📤 Publishing post ${post.id} (prior attempts: ${post.retryCount}/${MAX_RETRY_COUNT}) scheduled for ${post.scheduledAt}`);
      log.info(`👤 User: ${post.user.email}, Has access token: ${!!post.user.accessToken}`);

      // Check if user has LinkedIn access token
      if (!post.user.accessToken) {
        log.error(`❌ User ${post.user.email} has no LinkedIn access token`);
        await this.handlePublishFailure(post, 'No LinkedIn access token');
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
      await this.handlePublishFailure(post, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Handle a failed publish attempt: increment retryCount, persist lastError, and
   * either revert to SCHEDULED (for retry) or mark as FAILED when max retries exceeded.
   */
  private async handlePublishFailure(post: any, errorMessage: string): Promise<void> {
    const newRetryCount = post.retryCount + 1;
    const exceeded = newRetryCount >= MAX_RETRY_COUNT;

    if (exceeded) {
      log.error(`❌ Post ${post.id} exceeded max retries (${MAX_RETRY_COUNT}), marking as FAILED. Last error: ${errorMessage}`);
    } else {
      log.warn(`⚠️ Post ${post.id} failed (attempt ${newRetryCount}/${MAX_RETRY_COUNT}), reverting to SCHEDULED for retry. Error: ${errorMessage}`);
    }

    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: exceeded ? 'FAILED' : 'SCHEDULED',
        retryCount: newRetryCount,
        lastError: errorMessage,
      },
    });
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
      // Get LinkedIn Person URN from userinfo endpoint (with retries on transient failures)
      const userProfileResponse = await this.fetchWithRetry(
        'https://api.linkedin.com/v2/userinfo',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        },
        3,
        1000
      );

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

      // Prepare post payload according to LinkedIn Share API.
      // Start with no media; only set IMAGE when upload succeeds.
      const postPayload: any = {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // If there's an image, attempt upload. Only switch to IMAGE if upload returns an assetId.
      if (imageUrl) {
        const imageUploadResult = await this.uploadImageToLinkedIn(
          accessToken,
          personId,
          imageUrl
        );

        if (imageUploadResult.success && imageUploadResult.assetId) {
          postPayload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
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
          // Keep shareMediaCategory as NONE to avoid sending empty media
          log.warn('⚠️ Image upload failed or timed out; publishing without image');
        }
      }

      // Publish post to LinkedIn (retry on transient failures)
      const publishResponse = await this.fetchWithRetry(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify(postPayload),
        },
        2,
        500
      );

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
      
  // Step 1: Register upload (with retries on transient failures)
  // Use fetchWithRetry for registration (3 attempts)
  let registerResponse: Response | null = null;
      try {
        registerResponse = await this.fetchWithRetry(
          'https://api.linkedin.com/v2/assets?action=registerUpload',
          {
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
          },
          3,
          700
        );
      } catch (err) {
        log.error('❌ registerUpload failed after retries:', err);
        throw err;
      }

      if (!registerResponse) {
        throw new Error('Failed to register image upload: no response');
      }

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text().catch(() => '');
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
      const imageResponse = await this.fetchWithRetry(imageUrl, undefined, 2, 300);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      log.info(`✅ Image downloaded (${imageBuffer.byteLength} bytes)`);

      // Step 3: Upload image binary to LinkedIn
      log.info('📤 Step 3: Uploading image binary to LinkedIn...');
      const uploadResponse = await this.fetchWithRetry(
        uploadUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/octet-stream',
          },
          body: imageBuffer,
        },
        2,
        500
      );

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
