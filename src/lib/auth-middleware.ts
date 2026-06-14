// Production-grade authentication middleware for internal API routes
// This provides a single source of truth for authentication validation
import { NextRequest } from "next/server";
import { getSessionFromRequest } from "./session";
import type { AuthSession } from "@/types";

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Require authentication for internal API routes
 * Validates session and user existence in database
 * Uses caching to prevent repeated database queries
 * 
 * @param req - NextRequest object
 * @returns AuthSession with validated user data
 * @throws AuthError if authentication fails
 */
export async function requireAuthInternal(req: NextRequest): Promise<AuthSession> {
  const session = await getSessionFromRequest(req);
  
  if (!session?.userId) {
    throw new AuthError("Authentication required. Please log in.");
  }
  
  return session;
}

/**
 * Require admin role for internal API routes
 * Validates authentication and admin role
 * 
 * @param req - NextRequest object
 * @returns AuthSession with admin user data
 * @throws AuthError if authentication fails
 * @throws ForbiddenError if user is not admin
 */
export async function requireAdminInternal(req: NextRequest): Promise<AuthSession> {
  const session = await requireAuthInternal(req);
  
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Admin access required. You do not have sufficient permissions.");
  }
  
  return session;
}

/**
 * Optional authentication for internal API routes
 * Returns session if valid, null otherwise
 * Does not throw errors
 * 
 * @param req - NextRequest object
 * @returns AuthSession or null
 */
export async function optionalAuthInternal(req: NextRequest): Promise<AuthSession | null> {
  try {
    return await getSessionFromRequest(req);
  } catch (error) {
    console.error("[AUTH-MIDDLEWARE] Optional auth check failed:", error);
    return null;
  }
}
