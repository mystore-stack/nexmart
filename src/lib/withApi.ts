// src/lib/withApi.ts
// Global API wrapper that catches ALL errors automatically
import { NextRequest, NextResponse } from "next/server";
import { errorToResponse, ok, type ApiSuccess, type ApiError, type ApiResponse } from "./api-response";

// ─── Handler Types ─────────────────────────────────────────────────

/**
 * API handler context with request and optional session
 */
export interface ApiContext {
  req: NextRequest;
  params?: Record<string, string> | Promise<Record<string, string>>;
  session?: {
    userId: string;
    organizationId: string;
    role: string;
  };
}

/**
 * API handler function signature
 * Can return data (will be wrapped in ok()) or NextResponse directly
 */
export type ApiHandler<T = unknown> = (
  ctx: ApiContext
) => Promise<T | NextResponse<ApiResponse<T>>> | T | NextResponse<ApiResponse<T>>;

/**
 * API handler options
 */
export interface WithApiOptions {
  /**
   * Require authentication
   * If true, the handler will only run if user is authenticated
   */
  requireAuth?: boolean;

  /**
   * Require admin role
   * If true, the handler will only run if user is admin or super admin
   */
  requireAdmin?: boolean;

  /**
   * Require super admin role
   * If true, the handler will only run if user is super admin
   */
  requireSuperAdmin?: boolean;

  /**
   * Custom logging function
   * Override default error logging
   */
  logError?: (error: unknown, ctx: ApiContext) => void;

  /**
   * Enable request logging
   * Log incoming requests for debugging
   */
  logRequests?: boolean;
}

// ─── Default Options ───────────────────────────────────────────────

const DEFAULT_OPTIONS: WithApiOptions = {
  requireAuth: false,
  requireAdmin: false,
  requireSuperAdmin: false,
  logError: (error, ctx) => {
    console.error("[API Error]", {
      error,
      path: ctx.req.nextUrl.pathname,
      method: ctx.req.method,
    });
  },
  logRequests: false,
};

// ─── withApi Wrapper ────────────────────────────────────────────────

/**
 * Global API wrapper that catches ALL errors automatically
 * 
 * Features:
 * - Automatic error catching (sync, async, thrown)
 * - Guaranteed NextResponse return (never {} or undefined)
 * - Authentication/authorization checks
 * - Request/response logging
 * - Multi-tenant context preservation
 * 
 * @param handler - The API handler function
 * @param options - Configuration options
 * @returns Next.js route handler function
 * 
 * @example
 * ```ts
 * import { withApi } from "@/lib/withApi";
 * import { ok } from "@/lib/api-response";
 * 
 * export const GET = withApi(async ({ req }) => {
 *   const data = await someOperation();
 *   return ok(data);
 * });
 * ```
 */
export function withApi<T = unknown>(
  handler: ApiHandler<T>,
  options: WithApiOptions = {}
): (req: NextRequest, context?: { params?: Promise<Record<string, string>> }) => Promise<NextResponse> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return async (req: NextRequest, routeContext?: { params?: Promise<Record<string, string>> }) => {
    const resolvedParams = routeContext?.params ? await routeContext.params : undefined;
    const ctx: ApiContext = {
      req,
      params: resolvedParams,
    };

    // Log request if enabled
    if (opts.logRequests) {
      console.log("[API Request]", {
        method: req.method,
        path: req.nextUrl.pathname,
        search: req.nextUrl.search,
      });
    }

    try {
      // Authentication check
      if (opts.requireAuth || opts.requireAdmin || opts.requireSuperAdmin) {
        const { requireAuthInternal } = await import("./auth-api");
        const session = await requireAuthInternal();
        ctx.session = session;

        if (opts.requireAdmin) {
          const { requireAdminInternal } = await import("./auth-api");
          await requireAdminInternal(session);
        }

        if (opts.requireSuperAdmin) {
          const { requireSuperAdminInternal } = await import("./auth-api");
          await requireSuperAdminInternal(session);
        }
      }

      // Execute handler
      const result = await handler(ctx);

      // If handler already returned a NextResponse, return it directly
      if (result instanceof NextResponse) {
        return result;
      }

      // If handler returned data, wrap it in ok()
      return ok(result);
    } catch (error) {
      // Log error
      opts.logError?.(error, ctx);

      // Convert error to proper API response
      return errorToResponse(error);
    }
  };
}

// ─── Convenience Wrappers ─────────────────────────────────────────

/**
 * Wrapper for authenticated routes
 * Automatically requires user authentication
 */
export function withAuth<T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<WithApiOptions, "requireAuth">
) {
  return withApi(handler, { ...options, requireAuth: true });
}

/**
 * Wrapper for admin routes
 * Automatically requires admin or super admin role
 */
export function withAdmin<T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<WithApiOptions, "requireAuth" | "requireAdmin">
) {
  return withApi(handler, { ...options, requireAuth: true, requireAdmin: true });
}

/**
 * Wrapper for super admin routes
 * Automatically requires super admin role
 */
export function withSuperAdmin<T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<WithApiOptions, "requireAuth" | "requireAdmin" | "requireSuperAdmin">
) {
  return withApi(handler, {
    ...options,
    requireAuth: true,
    requireAdmin: true,
    requireSuperAdmin: true,
  });
}

// ─── Method-Specific Wrappers ───────────────────────────────────────

/**
 * Create a GET route handler with automatic error handling
 */
export function withApiGet<T = unknown>(
  handler: ApiHandler<T>,
  options?: WithApiOptions
) {
  return withApi(handler, options);
}

/**
 * Create a POST route handler with automatic error handling
 */
export function withApiPost<T = unknown>(
  handler: ApiHandler<T>,
  options?: WithApiOptions
) {
  return withApi(handler, options);
}

/**
 * Create a PUT route handler with automatic error handling
 */
export function withApiPut<T = unknown>(
  handler: ApiHandler<T>,
  options?: WithApiOptions
) {
  return withApi(handler, options);
}

/**
 * Create a PATCH route handler with automatic error handling
 */
export function withApiPatch<T = unknown>(
  handler: ApiHandler<T>,
  options?: WithApiOptions
) {
  return withApi(handler, options);
}

/**
 * Create a DELETE route handler with automatic error handling
 */
export function withApiDelete<T = unknown>(
  handler: ApiHandler<T>,
  options?: WithApiOptions
) {
  return withApi(handler, options);
}
