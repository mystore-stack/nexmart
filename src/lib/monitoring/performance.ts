// src/lib/monitoring/performance.ts
import { redis } from '@/lib/redis';

export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  /**
   * Track API call performance
   */
  static async trackApiCall(endpoint: string, duration: number) {
    const key = `api:${endpoint}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key)!.push(duration);
    
    // Keep only last 100 measurements
    if (this.metrics.get(key)!.length > 100) {
      this.metrics.get(key)!.shift();
    }

    // Store in Redis for monitoring
    await redis.lpush(`perf:${key}`, duration);
    await redis.ltrim(`perf:${key}`, 0, 999);
    await redis.expire(`perf:${key}`, 3600);

    console.log(`[Performance] ${endpoint}: ${duration}ms`);
  }

  /**
   * Track database query performance
   */
  static async trackDatabaseQuery(query: string, duration: number) {
    const key = `db:${query.substring(0, 50)}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key)!.push(duration);
    
    if (this.metrics.get(key)!.length > 100) {
      this.metrics.get(key)!.shift();
    }

    await redis.lpush(`perf:${key}`, duration);
    await redis.ltrim(`perf:${key}`, 0, 999);
    await redis.expire(`perf:${key}`, 3600);

    if (duration > 100) {
      console.warn(`[Slow Query] ${query}: ${duration}ms`);
    }
  }

  /**
   * Track cache hit/miss
   */
  static async trackCacheHit(key: string, hit: boolean) {
    const hitKey = hit ? 'cache:hits' : 'cache:misses';
    await redis.incr(hitKey);
    await redis.expire(hitKey, 3600);

    console.log(`[Cache] ${key}: ${hit ? 'HIT' : 'MISS'}`);
  }

  /**
   * Get performance metrics for an endpoint
   */
  static async getMetrics(endpoint: string) {
    const key = `api:${endpoint}`;
    const measurements = this.metrics.get(key) || [];
    
    if (measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);

    return {
      count: measurements.length,
      avg: sum / measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    const hits = parseInt((await redis.get('cache:hits')) || '0');
    const misses = parseInt((await redis.get('cache:misses')) || '0');
    const total = hits + misses;

    return {
      hits,
      misses,
      total,
      hitRate: total > 0 ? (hits / total) * 100 : 0,
    };
  }

  /**
   * Clear metrics
   */
  static clearMetrics() {
    this.metrics.clear();
  }
}
