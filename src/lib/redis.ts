// src/lib/redis.ts
import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.argv.some((arg) => /next(\.exe)?$/i.test(arg) && process.argv.some((arg) => /build/i.test(arg)));

const hasUpstashConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const disableRedisFlag =
  process.env.DISABLE_REDIS === "true" ||
  !hasUpstashConfig ||
  isBuild;

// Disabled Redis client for fallback scenarios
const disabledRedis = {
  get: async () => null,
  set: async () => "OK",
  del: async () => 0,
  incr: async () => 1,
  expire: async () => 1,
} as unknown as Redis;

const createRedisClient = () => {
  if (disableRedisFlag) {
    return disabledRedis;
  }

  try {
    const upstashRedis = Redis.fromEnv();
    return upstashRedis;
  } catch (error) {
    console.error("Failed to initialize Upstash Redis:", error);
    console.error("Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set");
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
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } catch {
    // Silently fail cache writes
  }
}

export async function deleteCache(pattern: string): Promise<void> {
  try {
    // Upstash doesn't support KEYS command for performance reasons
    // Delete specific keys instead of pattern matching
    // This is a no-op for Upstash - use explicit key deletion
    console.warn("deleteCache with pattern not supported in Upstash, use explicit key deletion");
  } catch {
    // Silently fail
  }
}

export async function invalidateProductCache(productId: string): Promise<void> {
  try {
    // Delete specific product cache
    await redis.del(CACHE_KEYS.product(productId));
    // Note: Pattern-based cache invalidation not supported in Upstash
    // Consider using a cache versioning strategy instead
  } catch {
    // Silently fail
  }
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
    const result = await redis.set(key, "1", { ex: ttl, nx: true });
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
// NOTE: Upstash REST API doesn't support pub/sub
// For real-time features, consider using:
// - Server-Sent Events (SSE)
// - WebSockets
// - Upstash Queues (for async processing)
// - Webhooks

export const PUBSUB_CHANNELS = {
  orders: "channel:orders",
  analytics: "channel:analytics",
  inventory: "channel:inventory",
  revenue: "channel:revenue",
  notifications: "channel:notifications",
};

/**
 * Publish an event to a Redis channel
 * NOTE: Not supported in Upstash REST API - this is a no-op
 */
export async function publishEvent(
  channel: string,
  event: Record<string, any>
): Promise<void> {
  // Pub/sub not supported in Upstash REST API
  // Consider using Upstash Queues or alternative real-time solutions
  console.warn("publishEvent not supported in Upstash REST API");
}

/**
 * Subscribe to a Redis channel
 * NOTE: Not supported in Upstash REST API - this returns a no-op
 */
export function subscribeToChannel(
  channel: string,
  callback: (message: any) => void
): () => void {
  // Pub/sub not supported in Upstash REST API
  // Consider using Server-Sent Events or WebSockets
  console.warn("subscribeToChannel not supported in Upstash REST API");
  return () => {};
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
    // Upstash Redis incr only accepts one argument
    // For incrementing by more than 1, we need to call it multiple times
    let result = 0;
    for (let i = 0; i < amount; i++) {
      result = await redis.incr(key);
    }
    return result;
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
    await redis.set(key, value.toString(), { ex: ttl });
  } catch {
    // Silently fail
  }
}

export default redis;
