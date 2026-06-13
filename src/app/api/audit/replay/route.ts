// src/app/api/audit/replay/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { requireAuth, AuthError } from "@/lib/auth-api";

/**
 * POST /api/audit/replay
 * Create a new replay
 * 
 * ALWAYS returns structured JSON:
 * Success: { success: true, replay }
 * Failure: { success: false, error: string, code: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;

    const body = await req.json();
    const { sessionId, name, description, events, cartStates, replayData } = body;

    if (!sessionId || !name) {
      return NextResponse.json(
        { success: false, error: "Session ID and name required", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    const replay = await audit.replay.create({
      sessionId,
      userId: session.userId,
      organizationId,
      name,
      description,
      events,
      cartStates,
      replayData,
    });

    if (!replay) {
      return NextResponse.json(
        { success: false, error: "Failed to create replay", code: "REPLAY_NULL" },
        { status: 500 }
      );
    }

    console.log("[AUDIT API] replay created:", { sessionId, replayId: replay.id });

    return NextResponse.json({ success: true, replay }, { status: 201 });
  } catch (error) {
    console.error("[AUDIT] Replay creation error:", error);

    // Handle AuthError specifically
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.statusCode === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create replay", code: "CREATE_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audit/replay
 * Get replays with filters
 * 
 * ALWAYS returns structured JSON:
 * Success: { success: true, replay/replays }
 * Failure: { success: false, error: string, code: string }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const replayId = searchParams.get("id");

    if (replayId) {
      const replay = await audit.replay.get(replayId);
      return NextResponse.json({ success: true, replay });
    }

    if (sessionId) {
      const replays = await audit.replay.listBySession(sessionId);
      return NextResponse.json({ success: true, replays });
    }

    return NextResponse.json(
      { success: false, error: "Session ID or replay ID required", code: "MISSING_ID" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[AUDIT] Replay query error:", error);

    // Handle AuthError specifically
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.statusCode === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to query replays", code: "QUERY_ERROR" },
      { status: 500 }
    );
  }
}
