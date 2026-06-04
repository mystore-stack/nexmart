// src/lib/redis.ts
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const createRedisClient = () => {
  const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
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
  ]);
}

export default redis;
