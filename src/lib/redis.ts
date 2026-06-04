// src/lib/redis.ts
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.argv.some((arg) => /next(\.exe)?$/i.test(arg) && process.argv.some((arg) => /build/i.test(arg)));
/** Strip accidental `redis-cli -u` prefix from REDIS_URL */
function normalizeRedisUrl(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  const match = trimmed.match(/(rediss?:\/\/[^\s"']+)/i);
  if (match) return match[1];
  if (trimmed.startsWith("redis://") || trimmed.startsWith("rediss://")) return trimmed;
  return undefined;
}

const redisUrl = normalizeRedisUrl(process.env.REDIS_URL);
const hasValidRedisUrl = Boolean(redisUrl);
const disableRedisFlag =
  process.env.DISABLE_REDIS === "true" ||
  process.env.REDIS_URL?.includes("redis-cli") ||
  !hasValidRedisUrl ||
  isBuild;

const disabledRedis = {
  get: async () => null,
  setex: async () => "OK",
  keys: async () => [],
  del: async () => 0,
  incr: async () => 1,
  expire: async () => 1,
  on: () => disabledRedis,
} as unknown as Redis;

const createRedisClient = () => {
  if (disableRedisFlag) {
    return disabledRedis;
  }

  const client = new Redis(redisUrl || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 1000);
    },
  });

  client.on("error", (err) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Redis error:", err.message);
    }
  });

  return client;
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
    return data ? (JSON.parse(data) as T) : null;
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

export default redis;
