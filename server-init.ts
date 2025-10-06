/**
 * Server Initialization
 * 
 * This file runs once when the Next.js server starts.
 * It initializes background workers and other server-side services.
 */

import { startWorkers } from './workers';

let initialized = false;

export function initializeServer() {
  // Prevent multiple initializations (Next.js can reload in dev mode)
  if (initialized) {
    console.log('⚠️  Server already initialized, skipping...');
    return;
  }

  console.log('🚀 Initializing server...');
  
  // Start background workers
  startWorkers();
  
  initialized = true;
  console.log('✅ Server initialized successfully');
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  const shutdownHandler = async () => {
    console.log('\n🛑 Shutting down server...');
    
    const { stopWorkers } = await import('./workers');
    await stopWorkers();
    
    console.log('✅ Server shutdown complete');
    process.exit(0);
  };

  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);
}
