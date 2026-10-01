import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/next-auth.config";
import { generateAuthRequestId, authDebug, logSession } from "@/lib/auth-debug";

export const dynamic = "force-dynamic";

/**
 * Auth Bridge Endpoint - READ ONLY
 *
 * CRITICAL: This endpoint MUST NOT create or restore sessions.
 * It is a READ-ONLY diagnostic endpoint that returns the current NextAuth session status.
 *
 * If NextAuth says unauthenticated, this endpoint MUST return unauthenticated.
 * NO SESSION RESURRECTION ALLOWED.
 *
 * This endpoint is kept for backward compatibility but should not be called
 * by the client AuthProvider anymore (the bridge call was removed).
 */
export async function POST(req: NextRequest) {
  const requestId = generateAuthRequestId();
  const { pathname } = new URL(req.url);

  authDebug("BRIDGE_START", {
    requestId,
    method: "POST",
    path: pathname,
    userAgent: req.headers.get("user-agent"),
    referer: req.headers.get("referer"),
    origin: req.headers.get("origin"),
  });

  try {
    const session = await auth();

    authDebug("BRIDGE_SESSION_CHECK", {
      requestId,
      ...logSession(session),
    });

    // CRITICAL: READ ONLY - Never create or restore session
    // If NextAuth says unauthenticated, return unauthenticated
    if (session?.user) {
      authDebug("BRIDGE_DECISION", {
        requestId,
        decision: "ALLOW",
        reason: "Session already exists, read-only bridge",
      });
    } else {
      authDebug("BRIDGE_DECISION", {
        requestId,
        decision: "NO_SESSION",
        reason: "NextAuth says unauthenticated - NOT resurrecting",
      });
      console.log("[BRIDGE] Returning unauthenticated - will NOT restore session");
    }

    const response = NextResponse.json({
      success: true,
      authenticated: !!session,
      user: session?.user || null,
    });

    authDebug("BRIDGE_COMPLETE", { requestId });
    return response;
  } catch (error) {
    authDebug("AUTH_ERROR", {
      requestId,
      endpoint: "/api/auth/bridge",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to bridge session",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const requestId = generateAuthRequestId();
  const { pathname } = new URL(req.url);

  authDebug("BRIDGE_START", {
    requestId,
    method: "GET",
    path: pathname,
    userAgent: req.headers.get("user-agent"),
    referer: req.headers.get("referer"),
    origin: req.headers.get("origin"),
  });

  try {
    const session = await auth();

    authDebug("BRIDGE_SESSION_CHECK", {
      requestId,
      ...logSession(session),
    });

    // CRITICAL: READ ONLY - Never create or restore session
    if (!session?.user) {
      console.log("[BRIDGE GET] Returning unauthenticated - will NOT restore session");
    }

    return NextResponse.json({
      success: true,
      authenticated: !!session,
      user: session?.user || null,
    });
  } catch (error) {
    authDebug("AUTH_ERROR", {
      requestId,
      endpoint: "/api/auth/bridge",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get session",
      },
      { status: 500 }
    );
  }
}
