// src/app/api/audit/session/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/audit/session/complete
 * Mark a session as complete
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, conversionValue } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const session = await audit.session.complete(sessionId, conversionValue);

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("[AUDIT] Session completion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete session" },
      { status: 500 }
    );
  }
}
