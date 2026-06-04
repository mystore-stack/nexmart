// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { AuthSession, JwtPayload, User } from "@/types";
import { getJwtRefreshSecret, getJwtSecret } from "@/lib/env";
import {
  getSession,
  getSessionFromRequest,
  requireSession,
  requireSessionFromRequest,
  requireAdminSession,
} from "./session";

const ACCESS_SECRET = new TextEncoder().encode(getJwtSecret());
const REFRESH_SECRET = new TextEncoder().encode(getJwtRefreshSecret());

export const AUTH_COOKIE = "nexmart_auth";
export const REFRESH_COOKIE = "nexmart_refresh";

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
  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(tokenPayload),
    generateRefreshToken(tokenPayload),
  ]);
  return { accessToken, refreshToken };
}

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

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set(AUTH_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAuthFromRequest(req: NextRequest): Promise<AuthSession | null> {
  return getSessionFromRequest(req);
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  return getSession();
}

export async function requireAuth(): Promise<AuthSession> {
  return requireSession();
}

export async function requireAuthFromRequest(req: NextRequest): Promise<AuthSession> {
  return requireSessionFromRequest(req);
}

export async function requireAdmin(): Promise<AuthSession> {
  return requireAdminSession();
}

export async function requireAdminFromRequest(req: NextRequest): Promise<AuthSession> {
  return requireAdminSession(req);
}
