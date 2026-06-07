// src/app/api/audit/replay/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/audit/replay
 * Create a new replay
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const organizationId = await getOrganizationIdForUser(authUser);

    const body = await req.json();
    const { sessionId, name, description, events, cartStates, replayData } = body;

    if (!sessionId || !name) {
      return NextResponse.json(
        { success: false, error: "Session ID and name required" },
        { status: 400 }
      );
    }

    const replay = await audit.replay.create({
      sessionId,
      userId: authUser.userId,
      organizationId,
      name,
      description,
      events,
      cartStates,
      replayData,
    });

    return NextResponse.json({ success: true, replay }, { status: 201 });
  } catch (error) {
    console.error("[AUDIT] Replay creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create replay" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audit/replay
 * Get replays with filters
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const organizationId = await getOrganizationIdForUser(authUser);

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
      { success: false, error: "Session ID or replay ID required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[AUDIT] Replay query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to query replays" },
      { status: 500 }
    );
  }
}
