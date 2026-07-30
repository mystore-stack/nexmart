// src/lib/auth-server.ts
// DEPRECATED: This file is deprecated. Use auth-api.ts instead.
// This file is kept for backward compatibility only.
// All new code should import from @/lib/auth-api

import { 
  getSession as getSessionFromAuthApi,
  requireAuth as requireAuthFromAuthApi,
  requireAdmin as requireAdminFromAuthApi,
  requireSuperAdmin as requireSuperAdminFromAuthApi,
  type ServerAuthSession,
  AuthError
} from "./auth-api";

// Re-export for backward compatibility
export { ServerAuthSession, AuthError };

/**
 * @deprecated Use getSession from @/lib/auth-api instead
 */
export async function getSession(): Promise<ServerAuthSession | null> {
  console.warn("[DEPRECATED] auth-server.getSession is deprecated. Use auth-api.getSession instead");
  return getSessionFromAuthApi();
}

/**
 * @deprecated Use requireAuth from @/lib/auth-api instead
 */
export async function requireAuth(): Promise<ServerAuthSession> {
  console.warn("[DEPRECATED] auth-server.requireAuth is deprecated. Use auth-api.requireAuth instead");
  return requireAuthFromAuthApi();
}

/**
 * @deprecated Use requireAdmin from @/lib/auth-api instead
 */
export async function requireAdmin(): Promise<ServerAuthSession> {
  console.warn("[DEPRECATED] auth-server.requireAdmin is deprecated. Use auth-api.requireAdmin instead");
  return requireAdminFromAuthApi();
}

/**
 * @deprecated Use requireSuperAdmin from @/lib/auth-api instead
 */
export async function requireSuperAdmin(): Promise<ServerAuthSession> {
  console.warn("[DEPRECATED] auth-server.requireSuperAdmin is deprecated. Use auth-api.requireSuperAdmin instead");
  return requireSuperAdminFromAuthApi();
}
