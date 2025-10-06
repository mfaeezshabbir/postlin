// Lightweight in-memory Redis fallback for local dev when REDIS_URL is not provided.
// If you install `ioredis` or `redis`, you can switch to the real client.

type RedisLike = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<number>;
};

const map = new Map<string, string>();

const inMemoryRedis: RedisLike = {
  async get(_key: string) {
    return map.has(_key) ? map.get(_key)! : null;
  },
  async set(_key: string, _value: string) {
    map.set(_key, _value);
  },
  async del(_key: string) {
    return map.delete(_key) ? 1 : 0;
  },
};

let client: RedisLike | null = null;

export function getRedisClient(): RedisLike {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      // Try to load ioredis dynamically if available
       
      const IORedis = require('ioredis');
      const real = new IORedis(url);
      client = {
        get: (k: string) => real.get(k),
        set: (k: string, v: string) => real.set(k, v),
        del: (k: string) => real.del(k),
      } as RedisLike;
      return client;
    } catch (_e) {
      // fall through to in-memory
      console.warn('ioredis not installed, using in-memory redis fallback');
    }
  }
  client = inMemoryRedis;
  return client;
}
