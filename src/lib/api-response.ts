// src/lib/api-response.ts
// Unified API response system with strict typing and guaranteed responses
import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ─── Response Types ───────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: string[];
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Response Helpers ───────────────────────────────────────────────

/**
 * Success response helper
 * @param data - The data to return
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with { success: true, data }
 */
export function ok<T>(data: T, status: number = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data } as ApiSuccess<T>, { status });
}

/**
 * Created response helper (201)
 * @param data - The created resource
 * @returns NextResponse with { success: true, data } and status 201
 */
export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return ok(data, 201);
}

/**
 * No content response helper (204)
 * @returns NextResponse with null body and status 204
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Error response helper
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param details - Optional error details array
 * @param code - Optional error code for client handling
 * @returns NextResponse with { success: false, error }
 */
export function fail(
  message: string,
  status: number = 400,
  details?: string[],
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
      ...(code && { code }),
    } as ApiError,
    { status }
  );
}

/**
 * Bad request response (400)
 */
export function badRequest(message: string = "Bad request", details?: string[]): NextResponse<ApiError> {
  return fail(message, 400, details);
}

/**
 * Unauthorized response (401)
 */
export function unauthorized(message: string = "Unauthorized"): NextResponse<ApiError> {
  return fail(message, 401, undefined, "UNAUTHORIZED");
}

/**
 * Forbidden response (403)
 */
export function forbidden(message: string = "Forbidden"): NextResponse<ApiError> {
  return fail(message, 403, undefined, "FORBIDDEN");
}

/**
 * Not found response (404)
 */
export function notFound(message: string = "Resource not found"): NextResponse<ApiError> {
  return fail(message, 404, undefined, "NOT_FOUND");
}

/**
 * Conflict response (409)
 */
export function conflict(message: string = "Resource conflict"): NextResponse<ApiError> {
  return fail(message, 409, undefined, "CONFLICT");
}

/**
 * Unprocessable entity response (422) - for validation errors
 */
export function validationError(message: string, details: string[]): NextResponse<ApiError> {
  return fail(message, 422, details, "VALIDATION_ERROR");
}

/**
 * Too many requests response (429)
 */
export function tooManyRequests(message: string = "Too many requests"): NextResponse<ApiError> {
  return fail(message, 429, undefined, "RATE_LIMIT_EXCEEDED");
}

/**
 * Internal server error response (500)
 */
export function serverError(message: string = "Internal server error"): NextResponse<ApiError> {
  return fail(message, 500, undefined, "INTERNAL_ERROR");
}

/**
 * Service unavailable response (503)
 */
export function serviceUnavailable(message: string = "Service unavailable"): NextResponse<ApiError> {
  return fail(message, 503, undefined, "SERVICE_UNAVAILABLE");
}

// ─── Zod Error Handler ─────────────────────────────────────────────

/**
 * Convert ZodError to validation error response
 * @param err - ZodError instance
 * @returns NextResponse with validation error details
 */
export function handleZodError(err: ZodError): NextResponse<ApiError> {
  const details = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
  return validationError("Validation failed", details);
}

// ─── Error Classification ───────────────────────────────────────────

/**
 * Error classification for proper HTTP status mapping
 */
export enum ErrorType {
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  RATE_LIMIT = "RATE_LIMIT",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

/**
 * Classify an error into ErrorType
 * @param err - Error to classify
 * @returns ErrorType enum
 */
export function classifyError(err: unknown): ErrorType {
  if (err instanceof ZodError) return ErrorType.VALIDATION;
  
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    
    // Authentication errors
    if (message.includes("unauthorized") || message.includes("not authenticated")) {
      return ErrorType.AUTHENTICATION;
    }
    
    // Authorization errors
    if (message.includes("forbidden") || message.includes("permission") || message.includes("insufficient")) {
      return ErrorType.AUTHORIZATION;
    }
    
    // Not found errors
    if (message.includes("not found") || message.includes("no ")) {
      return ErrorType.NOT_FOUND;
    }
    
    // Conflict errors
    if (message.includes("already exists") || message.includes("duplicate") || message.includes("conflict")) {
      return ErrorType.CONFLICT;
    }
    
    // Rate limit errors
    if (message.includes("rate limit") || message.includes("too many")) {
      return ErrorType.RATE_LIMIT;
    }
  }
  
  return ErrorType.UNKNOWN;
}

// ─── Error to Response Mapping ───────────────────────────────────────

/**
 * Map any error to appropriate API response
 * This is the central error-to-response converter
 * @param err - Error to convert
 * @returns NextResponse with appropriate status and error message
 */
export function errorToResponse(err: unknown): NextResponse<ApiError> {
  console.error("[API Error]", err);
  
  // Log full error in development
  if (process.env.NODE_ENV === "development" && err instanceof Error) {
    console.error("[API Error Stack]", err.stack);
  }
  
  // Zod validation errors
  if (err instanceof ZodError) {
    return handleZodError(err);
  }
  
  // Custom AuthError with statusCode
  if (err instanceof Error && "statusCode" in err) {
    const statusCode = (err as any).statusCode as number;
    return fail(err.message, statusCode, undefined, classifyError(err));
  }
  
  // Generic Error instances
  if (err instanceof Error) {
    const errorType = classifyError(err);
    
    switch (errorType) {
      case ErrorType.AUTHENTICATION:
        return unauthorized(err.message);
      case ErrorType.AUTHORIZATION:
        return forbidden(err.message);
      case ErrorType.NOT_FOUND:
        return notFound(err.message);
      case ErrorType.CONFLICT:
        return conflict(err.message);
      case ErrorType.RATE_LIMIT:
        return tooManyRequests(err.message);
      case ErrorType.VALIDATION:
        return badRequest(err.message);
      default:
        return serverError(process.env.NODE_ENV === "development" ? err.message : undefined);
    }
  }
  
  // Unknown error types (string, number, object, etc.)
  const errorMessage = typeof err === "string" ? err : "An unexpected error occurred";
  return serverError(errorMessage);
}

// ─── Pagination Helpers ─────────────────────────────────────────────

/**
 * Extract pagination parameters from URL search params
 * @param searchParams - URLSearchParams from request
 * @returns Pagination parameters (page, limit, skip)
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24")));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build pagination metadata for API responses
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata object
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
