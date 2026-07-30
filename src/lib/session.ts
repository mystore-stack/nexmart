// Unified session: NextAuth JWT + legacy nexmart_auth cookie
import { getToken } from "next-auth/jwt";
import { auth } from "./next-auth.config";
import { NextRequest } from "next/server";
import type { AuthSession, JwtPayload } from "@/types";
import { AUTH_COOKIE, verifyAccessToken } from "./auth";
import { getNextAuthSecret } from "./env";

const sessionSecret = () => getNextAuthSecret();

function normalizeRole(role?: string): AuthSession["role"] {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return role;
  return "USER";
}

function tokenToPayload(token: {
  userId?: string;
  sub?: string;
  email?: string | null;
  role?: string;
}): AuthSession | null {
  // CRITICAL FIX: Never fall back to token.sub (OAuth provider ID)
  // Only use token.userId which is guaranteed to be a database user ID
  if (!token.userId) {
    console.error("[SESSION] tokenToPayload: token.userId is missing, cannot create valid session");
    return null;
  }
  return {
    userId: token.userId as string,
    email: (token.email as string) ?? "",
    role: normalizeRole(token.role as string),
  };
}

function jwtToSession(payload: JwtPayload | null): AuthSession | null {
  if (!payload?.userId) return null;
  return {
    userId: payload.userId,
    email: payload.email,
    role: normalizeRole(payload.role),
  };
}

async function legacyFromRequest(req: NextRequest): Promise<AuthSession | null> {
  console.log("[SESSION] Checking legacy auth from request");
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    console.log("[SESSION] Found Bearer token in authorization header");
    try {
      const payload = await verifyAccessToken(authHeader.slice(7));
      const session = jwtToSession(payload);
      
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
  const cookieToken = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookieToken) {
    console.log("[SESSION] Found auth cookie");
    try {
      const payload = await verifyAccessToken(cookieToken);
      const session = jwtToSession(payload);
      
      // PRODUCTION PROTECTION: Verify user exists in database
      if (session?.userId) {
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true },
        });
        
        if (!user) {
          console.error("[SESSION] Legacy auth cookie valid but user does not exist in database:", session.userId);
          return null;
        }
        
        console.log("[SESSION] User verified for legacy auth cookie:", session.userId);
      }
      
      return session;
    } catch (error) {
      console.error("[SESSION] Cookie token verification failed:", error);
      return null;
    }
  }
  console.log("[SESSION] No auth token found in request");
  return null;
}

async function legacyFromCookies(): Promise<AuthSession | null> {
  console.log("[SESSION] Checking legacy auth from cookies");
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  const cookieToken = cookieStore.get(AUTH_COOKIE)?.value;
  if (cookieToken) {
    console.log("[SESSION] Found auth cookie");
    try {
      const payload = await verifyAccessToken(cookieToken);
      const session = jwtToSession(payload);
      
      // PRODUCTION PROTECTION: Verify user exists in database
      if (session?.userId) {
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true },
        });
        
        if (!user) {
          console.error("[SESSION] Legacy auth cookie valid but user does not exist in database:", session.userId);
          return null;
        }
        
        console.log("[SESSION] User verified for legacy auth cookie:", session.userId);
      }
      
      return session;
    } catch (error) {
      console.error("[SESSION] Cookie token verification failed:", error);
      return null;
    }
  }
  console.log("[SESSION] No auth cookie found");
  return null;
}

export async function getSessionFromRequest(req: NextRequest): Promise<AuthSession | null> {
  console.log("[SESSION] getSessionFromRequest called");
  const naToken = await getToken({
    req: req as Parameters<typeof getToken>[0]["req"],
    secret: sessionSecret(),
    secureCookie: process.env.NODE_ENV === "production",
  });
  if (naToken?.userId) {
    console.log("[SESSION] NextAuth token found:", { userId: naToken.userId });
    const payload = tokenToPayload(naToken);
    if (!payload) {
      console.error("[SESSION] tokenToPayload returned null, rejecting session");
      return null;
    }
    return payload;
  }
  console.log("[SESSION] No NextAuth token, falling back to legacy auth");
  return legacyFromRequest(req);
}

export async function getSession(): Promise<AuthSession | null> {
  console.log("[SESSION] getSession called");
  const session = await auth();
  if (session?.user) {
    const u = session.user as { id?: string; email?: string | null; role?: string };
    // CRITICAL FIX: Reject session if userId is missing
    if (!u.id) {
      console.error("[SESSION] NextAuth session has no userId, rejecting session");
      return null;
    }
    console.log("[SESSION] NextAuth session found:", { userId: u.id, email: u.email, role: u.role });
    return {
      userId: u.id,
      email: u.email ?? "",
      role: normalizeRole(u.role),
    };
  }

  console.log("[SESSION] No NextAuth session, falling back to legacy auth");
  return legacyFromCookies();
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
