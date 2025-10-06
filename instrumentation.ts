/**
 * Next.js Instrumentation Hook
 * 
 * This file is called once when the Next.js server starts,
 * before any requests are handled.
 * 
 * Use this to initialize background workers and other server-side services.
 */

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('');
    console.log('🚀 Server starting...');
    
    // Import and initialize server
    const { initializeServer } = await import('./server-init');
    initializeServer();
    
    console.log('✅ Server ready');
    console.log('');
  }
}
