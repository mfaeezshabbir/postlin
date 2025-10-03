// Publisher service — LinkedIn publishing helper (stub)
import { log } from '../../lib/logger';

export async function publishToLinkedIn(userId: string, finalText: string) {
  // Call LinkedIn API to publish post; store linkedInPostId in Post model
  log.info('publishToLinkedIn', { userId, finalText });
  return { linkedInPostId: 'mock-post-id' };
}
