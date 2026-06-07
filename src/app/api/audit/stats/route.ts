// src/app/api/audit/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/audit/stats
 * Get audit statistics
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const organizationId = await getOrganizationIdForUser(authUser);

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
    return NextResponse.json(
      { success: false, error: "Failed to query stats" },
      { status: 500 }
    );
  }
}
