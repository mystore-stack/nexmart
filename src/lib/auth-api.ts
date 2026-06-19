// src/lib/auth-api.ts
// Authentication helpers that throw proper errors for withApi wrapper
import { auth } from "@/lib/next-auth.config";
import { getOrganizationIdForUser } from "@/lib/tenant";

// ─── Auth Error Class ───────────────────────────────────────────────

/**
 * Custom authentication error with HTTP status code
 * Thrown by auth helpers and caught by withApi wrapper
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = "AUTH_ERROR",
    public action?: "FORCE_SIGN_OUT" | "REAUTHENTICATE"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// ─── Session Types ─────────────────────────────────────────────────

export interface ServerAuthSession {
  userId: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  organizationId: string;
}

// ─── Session Retrieval ─────────────────────────────────────────────

/**
 * Get current session from NextAuth
 * Returns null if not authenticated
 */
export async function getSession(): Promise<ServerAuthSession | null> {
  console.log("[AUTH] Getting session from NextAuth");

  const session = await auth();

  console.log("[AUTH] NextAuth session retrieved:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    email: session?.user?.email,
    role: (session?.user as any)?.role,
  });

  if (!session?.user) {
    console.log("[AUTH] No NextAuth session found");
    return null;
  }

  const userId = session.user.id;
  if (!userId) {
    console.error("[AUTH] Session has no userId");
    return null;
  }

  // PRODUCTION PROTECTION: Verify user exists in database
  // This prevents sessions with invalid userIds from passing through
  const { prisma } = await import("@/lib/prisma");
  console.log("[AUTH] Verifying user exists in database:", userId);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error("[AUTH] Session exists but user does not exist in database:", userId);
    // Return null instead of throwing - let the caller handle it
    return null;
  }

  console.log("[AUTH] User verified in database:", {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Resolve organizationId for multi-tenant security with defensive error handling
  let organizationId: string;
  try {
    organizationId = await getOrganizationIdForUser({ userId });
    console.log("[AUTH] OrganizationId resolved:", organizationId);
  } catch (orgError) {
    console.error("[AUTH] Organization resolution failed:", orgError);
    // Return null instead of throwing - let the caller handle missing organization
    return null;
  }

  const authSession: ServerAuthSession = {
    userId,
    email: session.user.email ?? "",
    role: ((session.user as any).role as "USER" | "ADMIN" | "SUPER_ADMIN") || "USER",
    organizationId,
  };

  console.log("[AUTH] Session retrieved:", {
    userId: authSession.userId,
    email: authSession.email,
    role: authSession.role,
    organizationId: authSession.organizationId,
  });

  return authSession;
}

// ─── Internal Auth Helpers (for withApi) ───────────────────────────

/**
 * Internal require auth - throws AuthError if not authenticated
 * Used by withApi wrapper
 */
export async function requireAuthInternal(): Promise<ServerAuthSession> {
  console.log("[AUTH] requireAuthInternal called");

  const session = await getSession();

  if (!session) {
    console.error("[AUTH] requireAuthInternal failed - no session");
    throw new AuthError(
      "Unauthorized: No active session found",
      401,
      "UNAUTHORIZED"
    );
  }

  // PRODUCTION PROTECTION: Verify user exists in database
  // This prevents sessions with invalid userIds from passing through
  const { prisma } = await import("@/lib/prisma");
  console.log("[AUTH] Verifying user exists in database:", session.userId);
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error("[AUTH] requireAuthInternal failed - user does not exist in database:", session.userId);
    throw new AuthError(
      "Authenticated session exists but user record is missing from database. Please re-authenticate.",
      401,
      "USER_NOT_FOUND",
      "FORCE_SIGN_OUT"
    );
  }

  console.log("[AUTH] User verified in database:", {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  console.log("[AUTH] requireAuthInternal succeeded:", {
    userId: session.userId,
    email: session.email,
    role: session.role,
    organizationId: session.organizationId,
  });

  return session;
}

/**
 * Internal require admin - throws AuthError if not admin
 * Used by withApi wrapper
 */
export async function requireAdminInternal(
  session: ServerAuthSession
): Promise<ServerAuthSession> {
  console.log("[AUTH] requireAdminInternal called");

  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    console.error("[AUTH] requireAdminInternal failed - insufficient role:", session.role);
    throw new AuthError(
      "Forbidden: ADMIN or SUPER_ADMIN role required",
      403,
      "FORBIDDEN"
    );
  }

  console.log("[ADMIN] Admin access granted:", {
    userId: session.userId,
    email: session.email,
    role: session.role,
    organizationId: session.organizationId,
  });

  return session;
}

/**
 * Internal require super admin - throws AuthError if not super admin
 * Used by withApi wrapper
 */
export async function requireSuperAdminInternal(
  session: ServerAuthSession
): Promise<ServerAuthSession> {
  console.log("[AUTH] requireSuperAdminInternal called");

  if (session.role !== "SUPER_ADMIN") {
    console.error("[AUTH] requireSuperAdminInternal failed - insufficient role:", session.role);
    throw new AuthError(
      "Forbidden: SUPER_ADMIN role required",
      403,
      "FORBIDDEN"
    );
  }

  console.log("[ADMIN] Super admin access granted:", {
    userId: session.userId,
    email: session.email,
    role: session.role,
    organizationId: session.organizationId,
  });

  return session;
}

// ─── Public Auth Helpers (for direct use in routes) ────────────────

/**
 * Require authentication - throws if not authenticated
 * Use this in API routes when NOT using withApi wrapper
 * 
 * @example
 * ```ts
 * import { requireAuth } from "@/lib/auth-api";
 * 
 * export async function GET(req: NextRequest) {
 *   const session = await requireAuth();
 *   // session is guaranteed to be authenticated
 * }
 * ```
 */
export async function requireAuth(): Promise<ServerAuthSession> {
  return requireAuthInternal();
}

/**
 * Require admin authentication - throws if not admin
 * Use this in API routes when NOT using withApi wrapper
 * 
 * @example
 * ```ts
 * import { requireAdmin } from "@/lib/auth-api";
 * 
 * export async function GET(req: NextRequest) {
 *   const session = await requireAdmin();
 *   // session is guaranteed to be admin or super admin
 * }
 * ```
 */
export async function requireAdmin(): Promise<ServerAuthSession> {
  const session = await requireAuthInternal();
  return requireAdminInternal(session);
}

/**
 * Require super admin authentication - throws if not super admin
 * Use this in API routes when NOT using withApi wrapper
 * 
 * @example
 * ```ts
 * import { requireSuperAdmin } from "@/lib/auth-api";
 * 
 * export async function GET(req: NextRequest) {
 *   const session = await requireSuperAdmin();
 *   // session is guaranteed to be super admin
 * }
 * ```
 */
export async function requireSuperAdmin(): Promise<ServerAuthSession> {
  const session = await requireAuthInternal();
  return requireSuperAdminInternal(session);
}

// ─── Re-export for backward compatibility ───────────────────────────

/**
 * Re-export ServerAuthSession as AuthSession for compatibility
 */
export type AuthSession = ServerAuthSession;
