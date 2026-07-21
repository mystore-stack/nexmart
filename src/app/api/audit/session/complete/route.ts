// src/app/api/audit/session/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/audit/session/complete
 * Mark a session as complete
 * 
 * ALWAYS returns structured JSON:
 * Success: { success: true, session }
 * Failure: { success: false, error: string, code: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, conversionValue } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required", code: "MISSING_SESSION_ID" },
        { status: 400 }
      );
    }

    const session = await audit.session.complete(sessionId, conversionValue);

    console.log("[AUDIT API] session completed:", { sessionId, conversionValue });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("[AUDIT] Session completion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete session", code: "COMPLETE_ERROR" },
      { status: 500 }
    );
  }
}
