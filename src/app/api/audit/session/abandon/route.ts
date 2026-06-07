// src/app/api/audit/session/abandon/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";

/**
 * POST /api/audit/session/abandon
 * Mark a session as abandoned
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const session = await audit.session.markAbandoned(sessionId);

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("[AUDIT] Session abandonment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark session as abandoned" },
      { status: 500 }
    );
  }
}
