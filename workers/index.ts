import { scheduledPostWorker } from './scheduler';

// Workers entrypoint: define queue names and worker stubs
export const QUEUES = {
  DRAFT_GENERATION: 'draft-generation',
  NOTIFICATIONS: 'notifications',
  ENGAGEMENT_POLLING: 'engagement-polling',
  SCHEDULED_POSTS: 'scheduled-posts',
} as const;

let workersStarted = false;

export async function startWorkers() {
  if (workersStarted) {
    console.log('⚠️  Workers already started, skipping...');
    return;
  }

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('🚀 Starting Background Workers');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  
  // Start the scheduled post worker
  scheduledPostWorker.start();
  
  workersStarted = true;
  
  console.log('');
  console.log('✅ All background workers started successfully');
  console.log('📅 Scheduled posts will be published automatically');
  console.log('');
}

export async function stopWorkers() {
  if (!workersStarted) {
    return;
  }

  console.log('');
  console.log('🛑 Stopping background workers...');
  
  // Stop the scheduled post worker
  scheduledPostWorker.stop();
  
  workersStarted = false;
  
  console.log('✅ All background workers stopped');
  console.log('');
}
