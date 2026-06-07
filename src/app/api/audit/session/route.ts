// src/app/api/audit/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/audit/session
 * Create a new audit session
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const organizationId = await getOrganizationIdForUser(authUser);

    const body = await req.json();
    const { userId, userAgent, ipAddress, referrer, metadata } = body;

    const session = await audit.session.create({
      userId: userId || authUser.userId,
      organizationId,
      userAgent,
      ipAddress,
      referrer,
      metadata,
    });

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error("[AUDIT] Session creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
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
    const authUser = await requireAuth();
    const organizationId = await getOrganizationIdForUser(authUser);

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
