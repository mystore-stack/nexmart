// src/app/api/audit/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit/server";

/**
 * POST /api/audit/session
 * Create a new audit session
 * 
 * Public endpoint - can be called from client SDK for anonymous users
 * 
 * ALWAYS returns structured JSON:
 * Success: { sessionId: string, success: true }
 * Failure: { success: false, error: string, code: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, organizationId, userAgent, ipAddress, referrer, metadata } = body;

    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Organization ID required",
          code: "MISSING_ORGANIZATION_ID",
        },
        { status: 400 }
      );
    }

    const auditSession = await audit.session.create({
      userId,
      organizationId,
      userAgent,
      ipAddress,
      referrer,
      metadata,
    });

    if (!auditSession) {
      console.error("[AUDIT] Session creation returned null");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create session",
          code: "SESSION_NULL",
        },
        { status: 500 }
      );
    }

    console.log("[AUDIT API] session created:", { sessionId: auditSession.id });

    return NextResponse.json(
      { sessionId: auditSession.id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AUDIT] Session creation error:", error);

    // Check for database connection errors
    if (error && typeof error === 'object' && 'kind' in error && error.kind === 'Closed') {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection error",
          code: "DATABASE_CONNECTION_ERROR",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create session",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audit/session
 * Get audit sessions with filters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const sessions = await prisma.auditSession.findMany({
      where: {
        organizationId,
        ...(userId && { userId }),
      },
      orderBy: { startTime: "desc" },
      take: limit,
      include: {
        events: {
          orderBy: { createdAt: "asc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error("[AUDIT] Session query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to query sessions" },
      { status: 500 }
    );
  }
}
