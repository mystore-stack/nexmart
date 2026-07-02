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
  // PRODUCTION PROTECTION: Verify user exists in database before generating tokens
  const { prisma } = await import("@/lib/prisma");
  console.log("[AUTH] Verifying user exists before generating token pair:", user.id);
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, role: true },
  });

  if (!dbUser) {
    console.error("[AUTH] Cannot generate tokens - user does not exist in database:", user.id);
    throw new Error("User does not exist in database. Cannot generate authentication tokens.");
  }

  console.log("[AUTH] User verified, generating token pair:", {
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
  });

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(tokenPayload),
    generateRefreshToken(tokenPayload),
  ]);
  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  try {
    console.log("[AUTH] Verifying access token");
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    console.log("[AUTH] Access token verified successfully:", { userId: payload.userId, email: payload.email, role: payload.role });
    
    // PRODUCTION PROTECTION: Verify user exists in database
    if (payload.userId) {
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: { id: true },
      });
      
      if (!user) {
        console.error("[AUTH] Access token valid but user does not exist in database:", payload.userId);
        throw new Error("User does not exist in database. Access token is invalid.");
      }
      
      console.log("[AUTH] User verified for access token:", payload.userId);
    }
    
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.error("[AUTH] Access token verification failed:", error);
    throw new Error("Invalid or expired access token");
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  try {
    console.log("[AUTH] Verifying refresh token");
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    console.log("[AUTH] Refresh token verified successfully:", { userId: payload.userId });
    
    // PRODUCTION PROTECTION: Verify user exists in database
    if (payload.userId) {
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: { id: true },
      });
      
      if (!user) {
        console.error("[AUTH] Refresh token valid but user does not exist in database:", payload.userId);
        throw new Error("User does not exist in database. Refresh token is invalid.");
      }
      
      console.log("[AUTH] User verified for refresh token:", payload.userId);
    }
    
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.error("[AUTH] Refresh token verification failed:", error);
    throw new Error("Invalid or expired refresh token");
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
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

export async function clearAuthCookies() {
  const cookieStore = await cookies();
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
