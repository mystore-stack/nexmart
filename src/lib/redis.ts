// src/lib/redis.ts
import IORedis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: IORedis | undefined;
};

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.argv.some((arg) => /next(\.exe)?$/i.test(arg) && process.argv.some((arg) => /build/i.test(arg)));

const disableRedisFlag =
  process.env.DISABLE_REDIS === "true" ||
  !process.env.REDIS_URL ||
  isBuild;

// Disabled Redis client for fallback scenarios
const disabledRedis = {
  get: async () => null,
  set: async () => "OK",
  del: async () => 0,
  incr: async () => 1,
  expire: async () => 1,
  setex: async () => "OK",
  keys: async () => [],
  publish: async () => 0,
  subscribe: async () => {},
  unsubscribe: async () => {},
  quit: async () => {},
  duplicate: () => disabledRedis as any,
  on: () => disabledRedis,
} as unknown as IORedis;

const createRedisClient = () => {
  if (disableRedisFlag) {
    return disabledRedis;
  }

  if (!process.env.REDIS_URL) {
    console.error("REDIS_URL is not set");
    return disabledRedis;
  }

  try {
    const client = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
    return client;
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
    return disabledRedis;
  }
};

export const redis = globalForRedis.redis ?? createRedisClient();
export const isRedisEnabled = !disableRedisFlag;

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ─── Cache helpers ──────────────────────────────────────────

export const CACHE_TTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 3600,         // 1 hour
  DAY: 86400,         // 24 hours
  WEEK: 604800,       // 7 days
} as const;

export const CACHE_KEYS = {
  product: (id: string) => `product:${id}`,
  productSlug: (slug: string) => `product:slug:${slug}`,
  products: (query: string) => `products:${query}`,
  category: (id: string) => `category:${id}`,
  categories: () => "categories:all",
  featured: () => "products:featured",
  trending: () => "products:trending",
  cart: (userId: string) => `cart:${userId}`,
  wishlist: (userId: string) => `wishlist:${userId}`,
  user: (id: string) => `user:${id}`,
  search: (q: string) => `search:${q}`,
  analytics: (key: string) => `analytics:${key}`,
};

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (data === null || data === undefined) return null;
    return JSON.parse(data as string) as T;
  } catch {
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Silently fail cache writes
  }
}

export async function deleteCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Silently fail
  }
}

export async function invalidateProductCache(productId: string): Promise<void> {
  await Promise.all([
    deleteCache(CACHE_KEYS.product(productId)),
    deleteCache("products:*"),
    deleteCache("products:featured"),
    deleteCache("products:trending"),
    deleteCache(`${CACHE_KEYS.featured()}:home:*`),
  ]);
}

// ─── Distributed Locks (Anti-duplicate orders) ──────────────────

export const LOCK_KEYS = {
  order: (idempotencyKey: string) => `lock:order:${idempotencyKey}`,
  inventory: (productId: string) => `lock:inventory:${productId}`,
  cart: (userId: string) => `lock:cart:${userId}`,
};

/**
 * Acquire a distributed lock using Redis SET NX EX
 * Returns true if lock acquired, false otherwise
 */
export async function acquireLock(
  key: string,
  ttl: number = 30
): Promise<boolean> {
  try {
    const result = await redis.set(key, "1", "EX", ttl, "NX");
    return result === "OK";
  } catch {
    return false;
  }
}

/**
 * Release a distributed lock
 */
export async function releaseLock(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // Silently fail
  }
}

/**
 * Execute a function with a distributed lock
 * Returns null if lock cannot be acquired
 */
export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 30
): Promise<T | null> {
  const acquired = await acquireLock(key, ttl);
  if (!acquired) return null;

  try {
    return await fn();
  } finally {
    await releaseLock(key);
  }
}

// ─── Redis Pub/Sub (Real-time events) ───────────────────────────

export const PUBSUB_CHANNELS = {
  orders: "channel:orders",
  analytics: "channel:analytics",
  inventory: "channel:inventory",
  revenue: "channel:revenue",
  notifications: "channel:notifications",
};

/**
 * Publish an event to a Redis channel
 */
export async function publishEvent(
  channel: string,
  event: Record<string, any>
): Promise<void> {
  try {
    await redis.publish(channel, JSON.stringify(event));
  } catch {
    // Silently fail pub/sub errors
  }
}

/**
 * Subscribe to a Redis channel
 * Returns a function to unsubscribe
 */
export function subscribeToChannel(
  channel: string,
  callback: (message: any) => void
): () => void {
  const subscriber = redis.duplicate();

  subscriber.subscribe(channel, (err) => {
    if (err && process.env.NODE_ENV !== "production") {
      console.error(`Redis subscribe error for ${channel}:`, err);
    }
  });

  subscriber.on("message", (receivedChannel, message) => {
    if (receivedChannel === channel) {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (err) {
        console.error(`Failed to parse message from ${channel}:`, err);
      }
    }
  });

  // Return unsubscribe function
  return () => {
    subscriber.unsubscribe(channel);
    subscriber.quit();
  };
}

// ─── Rate Limiting ───────────────────────────────────────────────

export const RATE_LIMIT_KEYS = {
  user: (userId: string) => `rate:user:${userId}`,
  ip: (ip: string) => `rate:ip:${ip}`,
  api: (endpoint: string) => `rate:api:${endpoint}`,
};

/**
 * Check and increment rate limit
 * Returns true if limit exceeded, false otherwise
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  window: number = 60
): Promise<boolean> {
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, window);
    }
    return current > limit;
  } catch {
    return false; // Fail open on Redis errors
  }
}

/**
 * Get current rate limit count
 */
export async function getRateLimitCount(key: string): Promise<number> {
  try {
    const count = await redis.get(key);
    if (count === null || count === undefined) return 0;
    return parseInt(count as string, 10);
  } catch {
    return 0;
  }
}

// ─── Analytics & Counters ───────────────────────────────────────

export const ANALYTICS_KEYS = {
  dailyRevenue: (date: string) => `analytics:revenue:daily:${date}`,
  dailyOrders: (date: string) => `analytics:orders:daily:${date}`,
  productViews: (productId: string) => `analytics:views:product:${productId}`,
  conversionRate: (date: string) => `analytics:conversion:daily:${date}`,
};

/**
 * Increment a counter
 */
export async function incrementCounter(key: string, amount: number = 1): Promise<number> {
  try {
    return await redis.incrby(key, amount);
  } catch {
    return 0;
  }
}

/**
 * Get a counter value
 */
export async function getCounter(key: string): Promise<number> {
  try {
    const value = await redis.get(key);
    if (value === null || value === undefined) return 0;
    return parseInt(value as string, 10);
  } catch {
    return 0;
  }
}

/**
 * Set counter with expiration
 */
export async function setCounterWithExpiry(
  key: string,
  value: number,
  ttl: number
): Promise<void> {
  try {
    await redis.setex(key, ttl, value.toString());
  } catch {
    // Silently fail
  }
}

export default redis;
