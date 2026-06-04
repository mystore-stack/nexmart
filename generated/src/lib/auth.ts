// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { JwtPayload, User } from "@/types";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-min-32-chars-x"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret-min-32-chars-x"
);

export const AUTH_COOKIE = "nexmart_auth";
export const REFRESH_COOKIE = "nexmart_refresh";

// ─── Token generation ────────────────────────────────────────

export async function generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "15m")
    .sign(ACCESS_SECRET);
}

export async function generateRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || "7d")
    .sign(REFRESH_SECRET);
}

export async function generateTokenPair(user: Pick<User, "id" | "email" | "role">) {
  const payload = { userId: user.id, email: user.email, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload),
  ]);
  return { accessToken, refreshToken };
}

// ─── Token verification ──────────────────────────────────────

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

// ─── Cookie management ───────────────────────────────────────

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set(AUTH_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

// ─── Request auth helpers ────────────────────────────────────

export async function getAuthFromRequest(req: NextRequest): Promise<JwtPayload | null> {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return verifyAccessToken(authHeader.slice(7));
  }

  // Fall back to cookie
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (token) {
    return verifyAccessToken(token);
  }

  return null;
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<JwtPayload> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<JwtPayload> {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}
