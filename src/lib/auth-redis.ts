// src/lib/auth-redis.ts
// DEPRECATED: This file is now a compatibility shim.
// All authentication now uses NextAuth v5 via auth-server.ts
// Redis is retained only for caching, rate limiting, and non-auth purposes.
//
// Migration: Replace imports from @/lib/auth-redis with @/lib/auth-server
//
// This file will be removed in a future version.

import type { ServerAuthSession as AuthSession } from "./auth-server";
import { requireAuth as _requireAuth } from "./auth-server";

// Re-export from auth-server for backward compatibility
export {
  getSession,
  requireAdmin,
  requireSuperAdmin,
  type ServerAuthSession as AuthSession,
} from "./auth-server";

// Legacy function signatures for compatibility
// These now use NextAuth instead of Redis
export async function requireAuthFromRequest(): Promise<AuthSession> {
  return _requireAuth();
}

export async function createSession(): Promise<never> {
  throw new Error(
    "DEPRECATED: createSession is no longer supported. " +
    "Use NextAuth for authentication. Login via /api/auth/signin or NextAuth credentials provider."
  );
}

export async function deleteSession(): Promise<void> {
  // NextAuth handles session deletion via /api/auth/signout
  console.log("[AUTH] deleteSession called - use NextAuth signout instead");
}

export async function deleteSessionFromRequest(): Promise<void> {
  // NextAuth handles session deletion via /api/auth/signout
  console.log("[AUTH] deleteSessionFromRequest called - use NextAuth signout instead");
}

export async function rotateSession(): Promise<null> {
  // NextAuth handles session rotation automatically
  console.log("[AUTH] rotateSession called - NextAuth handles this automatically");
  return null;
}

export async function deleteUserSessions(): Promise<void> {
  // NextAuth does not support multi-device session management
  console.log("[AUTH] deleteUserSessions called - not supported with NextAuth");
}

export async function getUserSessions(): Promise<never[]> {
  // NextAuth does not expose session list
  console.log("[AUTH] getUserSessions called - not supported with NextAuth");
  return [];
}

// Keep session-manager for non-auth Redis usage (caching, rate limiting, etc.)
export { SessionManager } from "./session-manager";
export type { SessionData } from "./session-manager";

// Deprecated constants
export const SESSION_COOKIE = "nexmart_session_id"; // No longer used
