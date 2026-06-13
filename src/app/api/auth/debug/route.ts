// GET /api/auth/debug - Authentication diagnostics endpoint
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getNextAuthSecret } from "@/lib/env";
import redis from "@/lib/redis";

const SESSION_COOKIE = "nexmart_session_id";
const SESSION_PREFIX = "session:";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookiesFound: { name: string; value: string }[] = [];
  
  // Get all cookies
  req.cookies.getAll().forEach(cookie => {
    cookiesFound.push({ name: cookie.name, value: cookie.value.substring(0, 20) + "..." });
  });

  // Check for NextAuth session
  let nextAuthSession = null;
  try {
    nextAuthSession = await getToken({
      req: req as Parameters<typeof getToken>[0]["req"],
      secret: getNextAuthSecret(),
      secureCookie: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("[DEBUG] NextAuth token error:", error);
  }

  // Check for custom Redis session cookie
  const sessionCookie = req.cookies.get(SESSION_COOKIE);
  const sessionId = sessionCookie?.value || null;

  // Check Redis for session
  let redisSessionExists = false;
  let redisSessionData = null;
  if (sessionId) {
    try {
      const sessionKey = `${SESSION_PREFIX}${sessionId}`;
      const session = await redis.get(sessionKey);
      redisSessionExists = !!session;
      if (session) {
        redisSessionData = JSON.parse(session);
      }
    } catch (error) {
      console.error("[DEBUG] Redis error:", error);
    }
  }

  return NextResponse.json({
    cookiesFound,
    sessionCookiePresent: !!sessionCookie,
    sessionCookieName: SESSION_COOKIE,
    sessionId,
    redisSessionExists,
    redisSessionData: redisSessionData ? {
      userId: redisSessionData.userId,
      email: redisSessionData.email,
      role: redisSessionData.role,
      organizationId: redisSessionData.organizationId,
      expiresAt: new Date(redisSessionData.expiresAt).toISOString(),
    } : null,
    nextAuthSession: nextAuthSession ? {
      userId: nextAuthSession.userId || nextAuthSession.sub,
      email: nextAuthSession.email,
      role: nextAuthSession.role,
    } : null,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === "production",
    },
  });
}
