import { Redis } from 'ioredis';

// Redis client singleton
let redisClient: Redis | null = null;

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  staleWhileRevalidate?: number; // Serve stale while revalidating
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

export class PerformanceService {
  /**
   * Get Redis client instance
   */
  private static getRedisClient(): Redis {
    if (!redisClient) {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    }
    return redisClient;
  }

  /**
   * Cache data with Redis
   */
  static async cache<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const redis = this.getRedisClient();
    const { ttl = 3600, tags = [] } = options;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    };

    await redis.setex(key, ttl, JSON.stringify(entry));

    // Add to tag sets for invalidation
    for (const tag of tags) {
      await redis.sadd(`tag:${tag}`, key);
    }
  }

  /**
   * Get cached data from Redis
   */
  static async getCached<T>(key: string): Promise<T | null> {
    const redis = this.getRedisClient();
    const cached = await redis.get(key);

    if (!cached) return null;

    try {
      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if expired
      const age = (Date.now() - entry.timestamp) / 1000;
      if (age > entry.ttl) {
        await redis.del(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Error parsing cached data:', error);
      return null;
    }
  }

  /**
   * Invalidate cache by key
   */
  static async invalidateCache(key: string): Promise<void> {
    const redis = this.getRedisClient();
    await redis.del(key);
  }

  /**
   * Invalidate cache by tag
   */
  static async invalidateByTag(tag: string): Promise<void> {
    const redis = this.getRedisClient();
    const keys = await redis.smembers(`tag:${tag}`);

    if (keys.length > 0) {
      await redis.del(...keys);
      await redis.del(`tag:${tag}`);
    }
  }

  /**
   * Invalidate multiple tags
   */
  static async invalidateTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.invalidateByTag(tag);
    }
  }

  /**
   * Get or cache pattern (cache-aside)
   */
  static async getOrCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.getCached<T>(key);

    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.cache(key, data, options);

    return data;
  }

  /**
   * Cache with stale-while-revalidate
   */
  static async getOrCacheSWR<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<{ data: T; isStale: boolean }> {
    const cached = await this.getCached<T>(key);

    if (cached !== null) {
      const entry = await this.getRedisClient().get(key);
      if (entry) {
        const parsed: CacheEntry<T> = JSON.parse(entry);
        const age = (Date.now() - parsed.timestamp) / 1000;
        const isStale = age > parsed.ttl * 0.8; // Consider stale at 80% of TTL

        // Revalidate in background if stale
        if (isStale) {
          fetcher().then(data => this.cache(key, data, options)).catch(() => {});
        }

        return { data: cached, isStale };
      }
    }

    const data = await fetcher();
    await this.cache(key, data, options);

    return { data, isStale: false };
  }

  /**
   * Generate cache key with parameters
   */
  static generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join(':');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Clear all cache (use with caution)
   */
  static async clearAllCache(): Promise<void> {
    const redis = this.getRedisClient();
    await redis.flushdb();
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    const redis = this.getRedisClient();
    const info = await redis.info('stats');
    const memoryInfo = await redis.info('memory');

    const totalKeys = await redis.dbsize();
    const memoryUsage = memoryInfo.match(/used_memory_human:([^\r\n]+)/)?.[1] || '0B';
    
    // Calculate hit rate from info
    const keyspaceHits = info.match(/keyspace_hits:(\d+)/)?.[1] || '0';
    const keyspaceMisses = info.match(/keyspace_misses:(\d+)/)?.[1] || '0';
    const hits = parseInt(keyspaceHits);
    const misses = parseInt(keyspaceMisses);
    const hitRate = hits + misses > 0 ? hits / (hits + misses) : 0;

    return {
      totalKeys,
      memoryUsage,
      hitRate,
    };
  }

  /**
   * Warm up cache with pre-defined keys
   */
  static async warmUpCache(keys: string[]): Promise<void> {
    const redis = this.getRedisClient();
    
    for (const key of keys) {
      const exists = await redis.exists(key);
      if (!exists) {
        // Trigger cache warmup by calling the appropriate fetcher
        // This would be implemented based on specific use cases
      }
    }
  }

  /**
   * Cache invalidation webhook handler
   */
  static async handleInvalidationWebhook(body: {
    type: 'key' | 'tag' | 'pattern';
    target: string;
  }): Promise<void> {
    const { type, target } = body;

    switch (type) {
      case 'key':
        await this.invalidateCache(target);
        break;
      case 'tag':
        await this.invalidateByTag(target);
        break;
      case 'pattern':
        const redis = this.getRedisClient();
        const keys = await redis.keys(target);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        break;
    }
  }

  /**
   * Generate ISR revalidation token
   */
  static generateRevalidationToken(): string {
    return `revalidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate revalidation token
   */
  static async validateRevalidationToken(token: string): Promise<boolean> {
    const redis = this.getRedisClient();
    const exists = await redis.exists(`revalidate:${token}`);
    return exists === 1;
  }

  /**
   * Store revalidation token
   */
  static async storeRevalidationToken(token: string, ttl: number = 300): Promise<void> {
    const redis = this.getRedisClient();
    await redis.setex(`revalidate:${token}`, ttl, '1');
  }

  /**
   * Incremental Static Regeneration helper
   */
  static async revalidatePath(path: string): Promise<void> {
    const redis = this.getRedisClient();
    const pattern = this.generateCacheKey('page', { path });
    await this.invalidateCache(pattern);
  }

  /**
   * Batch cache operations
   */
  static async batchCache<T>(
    operations: Array<{
      key: string;
      data: T;
      options?: CacheOptions;
    }>
  ): Promise<void> {
    const redis = this.getRedisClient();
    const pipeline = redis.pipeline();

    for (const op of operations) {
      const { key, data, options = {} } = op;
      const { ttl = 3600, tags = [] } = options;

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        tags,
      };

      pipeline.setex(key, ttl, JSON.stringify(entry));

      for (const tag of tags) {
        pipeline.sadd(`tag:${tag}`, key);
      }
    }

    await pipeline.exec();
  }

  /**
   * Health check for Redis
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const redis = this.getRedisClient();
      await redis.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  static async closeConnection(): Promise<void> {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }
  }
}

/**
 * ISR Configuration for Next.js pages
 */
export const ISR_CONFIG = {
  // Homepage
  homepage: {
    revalidate: 300, // 5 minutes
    tags: ['homepage', 'products', 'categories'],
  },
  // Product pages
  product: {
    revalidate: 3600, // 1 hour
    tags: ['product', 'products'],
  },
  // Category pages
  category: {
    revalidate: 1800, // 30 minutes
    tags: ['category', 'categories', 'products'],
  },
  // Search results
  search: {
    revalidate: 600, // 10 minutes
    tags: ['search', 'products'],
  },
  // API routes
  api: {
    revalidate: 60, // 1 minute
    tags: ['api'],
  },
};

/**
 * Streaming configuration for Suspense boundaries
 */
export const STREAMING_CONFIG = {
  enabled: true,
  timeout: 5000, // 5 seconds
  fallback: {
    hero: true,
    products: true,
    categories: true,
    recommendations: true,
  },
};

/**
 * Cache tags for invalidation
 */
export const CACHE_TAGS = {
  HOMEPAGE: 'homepage',
  PRODUCTS: 'products',
  PRODUCT: (id: string) => `product:${id}`,
  CATEGORIES: 'categories',
  CATEGORY: (slug: string) => `category:${slug}`,
  CAMPAIGNS: 'campaigns',
  CAMPAIGN: (id: string) => `campaign:${id}`,
  USER: (id: string) => `user:${id}`,
  SEARCH: 'search',
  RECOMMENDATIONS: 'recommendations',
  ANALYTICS: 'analytics',
  MENU: 'menu',
  CMS: 'cms',
};
