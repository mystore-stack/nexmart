// Unified session: NextAuth JWT + legacy nexmart_auth cookie
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import type { AuthSession, JwtPayload } from "@/types";
import { AUTH_COOKIE, verifyAccessToken } from "./auth";
import { authOptions } from "./next-auth.config";
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
}): AuthSession {
  return {
    userId: (token.userId as string) ?? (token.sub as string),
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
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return jwtToSession(await verifyAccessToken(authHeader.slice(7)));
  }
  const cookieToken = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookieToken) return jwtToSession(await verifyAccessToken(cookieToken));
  return null;
}

async function legacyFromCookies(): Promise<AuthSession | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  const cookieToken = cookieStore.get(AUTH_COOKIE)?.value;
  if (cookieToken) return jwtToSession(await verifyAccessToken(cookieToken));
  return null;
}

export async function getSessionFromRequest(req: NextRequest): Promise<AuthSession | null> {
  const naToken = await getToken({
    req: req as Parameters<typeof getToken>[0]["req"],
    secret: sessionSecret(),
    secureCookie: process.env.NODE_ENV === "production",
  });
  if (naToken?.sub || naToken?.userId) return tokenToPayload(naToken);
  return legacyFromRequest(req);
}

export async function getSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const u = session.user as { id?: string; email?: string | null; role?: string };
    return {
      userId: u.id ?? "",
      email: u.email ?? "",
      role: normalizeRole(u.role),
    };
  }

  return legacyFromCookies();
}

export async function requireSession(): Promise<AuthSession> {
  const user = await getSession();
  if (!user?.userId) throw new Error("Unauthorized");
  return user;
}

export async function requireSessionFromRequest(req: NextRequest): Promise<AuthSession> {
  const user = await getSessionFromRequest(req);
  if (!user?.userId) throw new Error("Unauthorized");
  return user;
}

export async function requireAdminSession(req?: NextRequest): Promise<AuthSession> {
  const user = req ? await requireSessionFromRequest(req) : await requireSession();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}
