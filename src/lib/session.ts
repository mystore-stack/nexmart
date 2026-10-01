// Unified session: NextAuth ONLY (single source of truth)
// Legacy Bearer token support for mobile apps only (via Authorization header)
import { getToken } from "next-auth/jwt";
import { auth } from "./next-auth.config";
import { NextRequest } from "next/server";
import type { AuthSession, JwtPayload } from "@/types";
import { verifyAccessToken } from "./auth";
import { getNextAuthSecret } from "./env";

const sessionSecret = () => getNextAuthSecret();

function normalizeRole(role?: string): AuthSession["role"] {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return role;
  return "USER";
}

async function tokenToPayload(token: {
  userId?: string;
  sub?: string;
  email?: string | null;
  role?: string;
}): Promise<AuthSession | null> {
  // CRITICAL FIX: Never fall back to token.sub (OAuth provider ID)
  // Only use token.userId which is guaranteed to be a database user ID
  if (!token.userId) {
    console.error("[SESSION] tokenToPayload: token.userId is missing, cannot create valid session");
    return null;
  }
  
  // Get organizationId for multi-tenant security
  let organizationId = "";
  try {
    const { getOrganizationIdForUser } = await import("./tenant");
    organizationId = await getOrganizationIdForUser({ userId: token.userId });
  } catch (error) {
    console.error("[SESSION] Failed to get organizationId in tokenToPayload:", error);
  }
  
  return {
    userId: token.userId as string,
    email: (token.email as string) ?? "",
    role: normalizeRole(token.role as string),
    organizationId,
  };
}

async function jwtToSession(payload: JwtPayload | null): Promise<AuthSession | null> {
  if (!payload?.userId) return null;
  
  // Get organizationId for multi-tenant security
  let organizationId = "";
  try {
    const { getOrganizationIdForUser } = await import("./tenant");
    organizationId = await getOrganizationIdForUser({ userId: payload.userId });
  } catch (error) {
    console.error("[SESSION] Failed to get organizationId:", error);
    // Continue without organizationId - will be handled by caller
  }
  
  return {
    userId: payload.userId,
    email: payload.email,
    role: normalizeRole(payload.role),
    organizationId,
  };
}

async function legacyFromRequest(req: NextRequest): Promise<AuthSession | null> {
  console.log("[SESSION] Checking legacy auth from request (Bearer token only)");
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    console.log("[SESSION] Found Bearer token in authorization header");
    try {
      const payload = await verifyAccessToken(authHeader.slice(7));
      const session = await jwtToSession(payload);

      // PRODUCTION PROTECTION: Verify user exists in database
      if (session?.userId) {
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true },
        });

        if (!user) {
          console.error("[SESSION] Legacy auth token valid but user does not exist in database:", session.userId);
          return null;
        }

        console.log("[SESSION] User verified for legacy auth:", session.userId);
      }

      return session;
    } catch (error) {
      console.error("[SESSION] Bearer token verification failed:", error);
      return null;
    }
  }
  console.log("[SESSION] No Bearer token found in request");
  return null;
}

export async function getSessionFromRequest(req: NextRequest): Promise<AuthSession | null> {
  console.log("[SESSION] getSessionFromRequest called");
  const naToken = await getToken({
    req: req as Parameters<typeof getToken>[0]["req"],
    secret: sessionSecret(),
    secureCookie: process.env.NODE_ENV === "production",
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  });
  if (naToken?.userId) {
    console.log("[SESSION] NextAuth token found:", { userId: naToken.userId });
    const payload = await tokenToPayload(naToken);
    if (!payload) {
      console.error("[SESSION] tokenToPayload returned null, rejecting session");
      return null;
    }
    return payload;
  }

  // Check for Bearer token (used by mobile apps)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    console.log("[SESSION] Found Bearer token in authorization header (mobile auth)");
    return legacyFromRequest(req);
  }

  console.log("[SESSION] No NextAuth token and no Bearer token, user is unauthenticated");
  return null;
}

export async function getSession(): Promise<AuthSession | null> {
  console.log("[SESSION] getSession called - NextAuth ONLY");
  const session = await auth();
  if (session?.user) {
    const u = session.user as { id?: string; email?: string | null; role?: string };
    // CRITICAL: Reject session if userId is missing
    if (!u.id) {
      console.error("[SESSION] NextAuth session has no userId, rejecting session");
      return null;
    }

    // Get organizationId for multi-tenant security
    let organizationId = "";
    try {
      const { getOrganizationIdForUser } = await import("./tenant");
      organizationId = await getOrganizationIdForUser({ userId: u.id });
    } catch (error) {
      console.error("[SESSION] Failed to get organizationId:", error);
    }

    console.log("[SESSION] NextAuth session found:", { userId: u.id, email: u.email, role: u.role, organizationId });
    return {
      userId: u.id,
      email: u.email ?? "",
      role: normalizeRole(u.role),
      organizationId,
    };
  }

  // NO FALLBACK - NextAuth is the ONLY source of truth
  // Legacy cookies are NOT checked here - they are only for mobile Bearer tokens
  console.log("[SESSION] No NextAuth session, user is unauthenticated");
  return null;
}

export async function requireSession(): Promise<AuthSession> {
  console.log("[SESSION] requireSession called");
  const user = await getSession();
  if (!user?.userId) {
    console.error("[SESSION] requireSession failed - no user found");
    throw new Error("Unauthorized: No active session found");
  }
  console.log("[SESSION] requireSession succeeded:", { userId: user.userId, email: user.email, role: user.role });
  return user;
}

export async function requireSessionFromRequest(req: NextRequest): Promise<AuthSession> {
  console.log("[SESSION] requireSessionFromRequest called");
  const user = await getSessionFromRequest(req);
  if (!user?.userId) {
    console.error("[SESSION] requireSessionFromRequest failed - no user found");
    throw new Error("Unauthorized: No active session found");
  }
  console.log("[SESSION] requireSessionFromRequest succeeded:", { userId: user.userId, email: user.email, role: user.role });
  return user;
}

export async function requireAdminSession(req?: NextRequest): Promise<AuthSession> {
  console.log("[SESSION] requireAdminSession called");
  const user = req ? await requireSessionFromRequest(req) : await requireSession();
  console.log("[SESSION] User authenticated:", { userId: user.userId, email: user.email, role: user.role });
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    console.error("[SESSION] Access denied - insufficient role:", user.role);
    throw new Error("Forbidden: Insufficient permissions. ADMIN or SUPER_ADMIN role required.");
  }
  console.log("[SESSION] Admin access granted");
  return user;
}
