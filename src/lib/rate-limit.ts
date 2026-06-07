// src/lib/rate-limit.ts
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitCount, RATE_LIMIT_KEYS } from "@/lib/redis";

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  limit: number;
  window: number; // in seconds
  keyPrefix?: string;
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // API endpoints
  API: { limit: 100, window: 60 }, // 100 requests per minute
  AUTH: { limit: 5, window: 60 }, // 5 auth requests per minute
  CHECKOUT: { limit: 10, window: 60 }, // 10 checkout attempts per minute
  
  // User-specific
  USER: { limit: 200, window: 60 }, // 200 requests per minute per user
  IP: { limit: 50, window: 60 }, // 50 requests per minute per IP
  
  // Specific endpoints
  SEARCH: { limit: 30, window: 60 }, // 30 searches per minute
  PRODUCTS: { limit: 60, window: 60 }, // 60 product requests per minute
} as const;

/**
 * Rate limit middleware for API routes
 * Returns true if rate limit is exceeded, false otherwise
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<{ limited: boolean; remaining: number; reset: number }> {
  const userId = req.headers.get("x-user-id");
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  // Use user ID if available, otherwise use IP
  const key = userId
    ? RATE_LIMIT_KEYS.user(userId)
    : RATE_LIMIT_KEYS.ip(ip);
  
  const prefix = config.keyPrefix || "api";
  const rateLimitKey = `${prefix}:${key}`;
  
  const limited = await checkRateLimit(rateLimitKey, config.limit, config.window);
  const remaining = Math.max(0, config.limit - (await getRateLimitCount(rateLimitKey)));
  const reset = Math.floor(Date.now() / 1000) + config.window;
  
  return { limited, remaining, reset };
}

/**
 * Rate limit middleware that returns NextResponse if limited
 */
export async function withRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const { limited, remaining, reset } = await rateLimit(req, config);
  
  if (limited) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests",
        code: "RATE_LIMIT_EXCEEDED",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": config.limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": config.window.toString(),
        },
      }
    );
  }
  
  // Add rate limit headers to response
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", config.limit.toString());
  headers.set("X-RateLimit-Remaining", remaining.toString());
  headers.set("X-RateLimit-Reset", reset.toString());
  
  return null; // Not limited, continue with request
}

/**
 * Rate limit by user ID
 */
export async function rateLimitByUserId(
  userId: string,
  config: RateLimitConfig
): Promise<{ limited: boolean; remaining: number }> {
  const key = RATE_LIMIT_KEYS.user(userId);
  const limited = await checkRateLimit(key, config.limit, config.window);
  const remaining = Math.max(0, config.limit - (await getRateLimitCount(key)));
  
  return { limited, remaining };
}

/**
 * Rate limit by IP address
 */
export async function rateLimitByIP(
  ip: string,
  config: RateLimitConfig
): Promise<{ limited: boolean; remaining: number }> {
  const key = RATE_LIMIT_KEYS.ip(ip);
  const limited = await checkRateLimit(key, config.limit, config.window);
  const remaining = Math.max(0, config.limit - (await getRateLimitCount(key)));
  
  return { limited, remaining };
}

/**
 * Rate limit by API endpoint
 */
export async function rateLimitByEndpoint(
  endpoint: string,
  config: RateLimitConfig
): Promise<{ limited: boolean; remaining: number }> {
  const key = RATE_LIMIT_KEYS.api(endpoint);
  const limited = await checkRateLimit(key, config.limit, config.window);
  const remaining = Math.max(0, config.limit - (await getRateLimitCount(key)));
  
  return { limited, remaining };
}

/**
 * Decorator for API route handlers with rate limiting
 */
export function withRateLimitHandler(config: RateLimitConfig) {
  return function (
    handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
      const rateLimitResponse = await withRateLimit(req, config);
      
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
      
      return handler(req, ...args);
    };
  };
}
