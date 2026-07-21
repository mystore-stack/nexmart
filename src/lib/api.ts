// src/lib/api.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth-api";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized(message = "Unauthorized") {
  return error(message, 401);
}

export function forbidden(message = "Forbidden") {
  return error(message, 403);
}

export function notFound(message = "Not found") {
  return error(message, 404);
}

export function serverError(message = "Internal server error") {
  return error(message, 500);
}

export function validationError(err: ZodError) {
  const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
  return NextResponse.json(
    { success: false, error: "Validation failed", details: messages },
    { status: 422 }
  );
}

export function handleApiError(err: unknown) {
  console.error("[API Error]:", err);

  if (err instanceof ZodError) return validationError(err);

  if (err instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: err.message, code: err.code, action: err.action },
      { status: err.statusCode }
    );
  }

  if (err instanceof Error) {
    if (err.message === "Unauthorized") return unauthorized();
    if (err.message === "Forbidden") return forbidden();
    if (err.message === "Not found") return notFound();
  }

  return serverError();
}

// ─── Rate limiting ───────────────────────────────────────────

import redis from "./redis";

export async function rateLimit(
  identifier: string,
  max: number = 100,
  windowMs: number = 15 * 60 * 1000
): Promise<{ success: boolean; remaining: number }> {
  const key = `rl:${identifier}`;
  const window = Math.floor(windowMs / 1000);

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, window);
    }

    const remaining = Math.max(0, max - current);
    return { success: current <= max, remaining };
  } catch {
    // If Redis is down, allow through
    return { success: true, remaining: max };
  }
}

// ─── Pagination helper ───────────────────────────────────────

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24")));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

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
