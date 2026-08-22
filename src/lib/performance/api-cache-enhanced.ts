// src/lib/performance/api-cache-enhanced.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { PerformanceMonitor } from '@/lib/monitoring/performance';

const CACHE_TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 3600,     // 1 hour
  VERY_LONG: 86400, // 24 hours
};

/**
 * Enhanced API caching decorator with performance monitoring
 */
export function withCache(ttl: number = CACHE_TTL.MEDIUM) {
  return async (req: NextRequest, handler: Function) => {
    const cacheKey = generateCacheKey(req);
    const start = Date.now();

    try {
      // Try to get from cache
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        await PerformanceMonitor.trackCacheHit(cacheKey, true);
        return NextResponse.json(JSON.parse(cached), {
          headers: { 
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
          },
        });
      }

      await PerformanceMonitor.trackCacheHit(cacheKey, false);

      // Execute handler
      const response = await handler(req);
      
      // Cache the response
      await redis.setex(cacheKey, ttl, JSON.stringify(response));

      const duration = Date.now() - start;
      await PerformanceMonitor.trackApiCall(req.url, duration);

      return NextResponse.json(response, {
        headers: { 
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
        },
      });
    } catch (error) {
      console.error('[API Cache] Error:', error);
      // Fail open - execute handler without cache
      const response = await handler(req);
      return NextResponse.json(response);
    }
  };
}

/**
 * Generate consistent cache key from request
 */
function generateCacheKey(req: NextRequest): string {
  const url = new URL(req.url);
  const path = url.pathname;
  const searchParams = url.searchParams.toString();
  
  // Include user context if authenticated
  const userId = req.headers.get('x-user-id');
  const organizationId = req.headers.get('x-organization-id');
  
  const parts = [
    'api',
    organizationId || 'public',
    userId || 'anonymous',
    path,
    searchParams,
  ];
  
  return parts.filter(Boolean).join(':');
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCachePattern(pattern: string) {
  const keys = await redis.keys(`*${pattern}*`);
  
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`[Cache Invalidation] Cleared ${keys.length} keys matching: ${pattern}`);
  }
}

/**
 * Cache warming for frequently accessed data
 */
export async function warmCache(keys: string[]) {
  for (const key of keys) {
    const cached = await redis.get(key);
    if (!cached) {
      // Trigger data fetch and cache
      console.log(`[Cache Warming] Warming: ${key}`);
    }
  }
}
