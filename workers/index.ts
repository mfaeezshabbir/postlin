// Workers entrypoint: define queue names and worker stubs
export const QUEUES = {
  DRAFT_GENERATION: 'draft-generation',
  NOTIFICATIONS: 'notifications',
  ENGAGEMENT_POLLING: 'engagement-polling',
} as const;

export async function startWorkers() {
  // Wire BullMQ workers here; this file provides a single start point.
  // Keep as a stub to implement specific job processors later.
  console.log('Starting workers... (stub)');
}
