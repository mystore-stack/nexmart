// src/app/api/audit/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { requireAuth, AuthError } from "@/lib/auth-api";

/**
 * GET /api/audit/stats
 * Get audit statistics
 * 
 * ALWAYS returns structured JSON:
 * Success: { success: true, stats }
 * Failure: { success: false, error: string, code: string }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const stats = await audit.getSessionStats(
      organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("[AUDIT] Stats query error:", error);

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
      { success: false, error: "Failed to query stats", code: "QUERY_ERROR" },
      { status: 500 }
    );
  }
}
