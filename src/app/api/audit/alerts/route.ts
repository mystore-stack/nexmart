// src/app/api/audit/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { requireAuth, AuthError } from "@/lib/auth-api";

/**
 * GET /api/audit/alerts
 * Get audit alerts with filters
 * 
 * ALWAYS returns structured JSON:
 * Success: { success: true, alerts }
 * Failure: { success: false, error: string, code: string }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;

    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get("resolved");
    const alertType = searchParams.get("alertType");
    const severity = searchParams.get("severity");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = { organizationId };
    if (resolved !== null) where.resolved = resolved === "true";
    if (alertType) where.alertType = alertType;
    if (severity) where.severity = severity;

    const alerts = await prisma.auditAlert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        session: true,
      },
    });

    return NextResponse.json({ success: true, alerts });
  } catch (error) {
    console.error("[AUDIT] Alert query error:", error);

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
      { success: false, error: "Failed to query alerts", code: "QUERY_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/audit/alerts
 * Resolve an alert
 * 
 * ALWAYS returns structured JSON:
 * Success: { success: true, alert }
 * Failure: { success: false, error: string, code: string }
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: "Alert ID required", code: "MISSING_ALERT_ID" },
        { status: 400 }
      );
    }

    const alert = await prisma.auditAlert.update({
      where: { id: alertId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: session.userId,
      },
    });

    console.log("[AUDIT API] alert resolved:", { alertId });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error("[AUDIT] Alert resolution error:", error);

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
      { success: false, error: "Failed to resolve alert", code: "RESOLVE_ERROR" },
      { status: 500 }
    );
  }
}
