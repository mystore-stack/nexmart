// src/lib/api-cache.ts
import { NextRequest, NextResponse } from "next/server";
import { getCache, setCache, deleteCache, CACHE_TTL, CACHE_KEYS } from "@/lib/redis";

/**
 * API Cache Configuration
 */
export interface CacheConfig {
  ttl?: number;
  keyPrefix?: string;
  varyBy?: Array<"userId" | "organizationId" | "query">;
}

/**
 * Default cache TTLs for different data types
 */
export const CACHE_TTLS = {
  PRODUCT: CACHE_TTL.MEDIUM, // 5 minutes
  PRODUCTS_LIST: CACHE_TTL.SHORT, // 1 minute
  CATEGORY: CACHE_TTL.LONG, // 1 hour
  USER: CACHE_TTL.MEDIUM, // 5 minutes
  ORDER: CACHE_TTL.SHORT, // 1 minute
  SEARCH: CACHE_TTL.SHORT, // 1 minute
  ANALYTICS: CACHE_TTL.SHORT, // 1 minute
} as const;

/**
 * Generate cache key for API request
 */
export function generateCacheKey(
  req: NextRequest,
  config: CacheConfig = {}
): string | null {
  const url = new URL(req.url);
  const path = url.pathname;
  const searchParams = url.searchParams.toString();
  
  const parts = [config.keyPrefix || "api", path];
  
  if (config.varyBy?.includes("query") && searchParams) {
    parts.push(searchParams);
  }
  
  if (config.varyBy?.includes("userId")) {
    const userId = req.headers.get("x-user-id");
    if (userId) parts.push(`user:${userId}`);
  }
  
  if (config.varyBy?.includes("organizationId")) {
    const orgId = req.headers.get("x-organization-id");
    if (orgId) parts.push(`org:${orgId}`);
  }
  
  return parts.join(":");
}

/**
 * Cache middleware for GET requests
 * Returns cached response if available, null otherwise
 */
export async function getCachedResponse(
  req: NextRequest,
  config: CacheConfig = {}
): Promise<NextResponse | null> {
  if (req.method !== "GET") return null;
  
  const cacheKey = generateCacheKey(req, config);
  if (!cacheKey) return null;
  
  try {
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      const response = NextResponse.json(cached.data, {
        status: cached.status,
        headers: {
          ...cached.headers,
          "X-Cache": "HIT",
          "X-Cache-Key": cacheKey,
        },
      });
      return response;
    }
  } catch (error) {
    console.error("[API_CACHE] Error getting cached response:", error);
  }
  
  return null;
}

/**
 * Cache API response
 */
export async function setCachedResponse(
  req: NextRequest,
  response: NextResponse,
  config: CacheConfig = {}
): Promise<void> {
  if (req.method !== "GET") return;
  
  const cacheKey = generateCacheKey(req, config);
  if (!cacheKey) return;
  
  try {
    const clonedResponse = response.clone();
    const data = await clonedResponse.json();
    
    await setCache(
      cacheKey,
      {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      },
      config.ttl || CACHE_TTL.MEDIUM
    );
  } catch (error) {
    console.error("[API_CACHE] Error setting cached response:", error);
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  await deleteCache(pattern);
}

/**
 * Invalidate product cache
 */
export async function invalidateProductCache(productId: string): Promise<void> {
  await Promise.all([
    deleteCache(CACHE_KEYS.product(productId)),
    deleteCache("products:*"),
    deleteCache("product:slug:*"),
  ]);
}

/**
 * Invalidate category cache
 */
export async function invalidateCategoryCache(categoryId: string): Promise<void> {
  await Promise.all([
    deleteCache(CACHE_KEYS.category(categoryId)),
    deleteCache("categories:*"),
  ]);
}

/**
 * Invalidate user cache
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await Promise.all([
    deleteCache(CACHE_KEYS.user(userId)),
    deleteCache(`user:${userId}:*`),
  ]);
}

/**
 * Decorator for API route handlers with caching
 */
export function withCache(config: CacheConfig = {}) {
  return function (
    handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
      // Try to get cached response
      const cached = await getCachedResponse(req, config);
      if (cached) return cached;
      
      // Execute handler
      const response = await handler(req, ...args);
      
      // Cache the response
      await setCachedResponse(req, response, config);
      
      // Add cache headers to response
      const newResponse = NextResponse.json(await response.clone().json(), {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          "X-Cache": "MISS",
        },
      });
      
      return newResponse;
    };
  };
}

/**
 * Cache helper for product data
 */
export async function cacheProduct(productId: string, data: any): Promise<void> {
  await setCache(CACHE_KEYS.product(productId), data, CACHE_TTLS.PRODUCT);
}

/**
 * Cache helper for product list
 */
export async function cacheProductList(query: string, data: any): Promise<void> {
  await setCache(CACHE_KEYS.products(query), data, CACHE_TTLS.PRODUCTS_LIST);
}

/**
 * Cache helper for category data
 */
export async function cacheCategory(categoryId: string, data: any): Promise<void> {
  await setCache(CACHE_KEYS.category(categoryId), data, CACHE_TTLS.CATEGORY);
}

/**
 * Cache helper for user data
 */
export async function cacheUser(userId: string, data: any): Promise<void> {
  await setCache(CACHE_KEYS.user(userId), data, CACHE_TTLS.USER);
}

/**
 * Get cached product
 */
export async function getCachedProduct(productId: string): Promise<any | null> {
  return await getCache(CACHE_KEYS.product(productId));
}

/**
 * Get cached product list
 */
export async function getCachedProductList(query: string): Promise<any | null> {
  return await getCache(CACHE_KEYS.products(query));
}

/**
 * Get cached category
 */
export async function getCachedCategory(categoryId: string): Promise<any | null> {
  return await getCache(CACHE_KEYS.category(categoryId));
}

/**
 * Get cached user
 */
export async function getCachedUser(userId: string): Promise<any | null> {
  return await getCache(CACHE_KEYS.user(userId));
}
