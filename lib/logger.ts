// Simple logger wrapper
export const log = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  debug: (...args: any[]) => {
    if (process.env.DEBUG) console.debug('[DEBUG]', ...args);
  },
};

export default log;
