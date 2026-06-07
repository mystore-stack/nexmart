// src/app/api/audit/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/audit/alerts
 * Get audit alerts with filters
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const organizationId = await getOrganizationIdForUser(authUser);

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
    return NextResponse.json(
      { success: false, error: "Failed to query alerts" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/audit/alerts
 * Resolve an alert
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const body = await req.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: "Alert ID required" },
        { status: 400 }
      );
    }

    const alert = await prisma.auditAlert.update({
      where: { id: alertId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: authUser.userId,
      },
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error("[AUDIT] Alert resolution error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve alert" },
      { status: 500 }
    );
  }
}
