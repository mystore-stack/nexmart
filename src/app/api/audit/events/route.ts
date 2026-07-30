// src/app/api/audit/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { requireAuth, AuthError } from "@/lib/auth-api";
import type { AuditEventType } from "@/lib/audit/types";

/**
 * POST /api/audit/events
 * Log a single audit event
 * 
 * ALWAYS returns structured JSON:
 * Success: { success: true, event }
 * Failure: { success: false, error: string, code: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;

    const body = await req.json();
    const { eventType, sessionId, orderId, cartSnapshot, metadata, ipAddress, userAgent } = body;

    const event = await audit.event({
      sessionId,
      eventType: eventType as AuditEventType,
      userId: session.userId,
      organizationId,
      orderId,
      cartSnapshot,
      metadata,
      ipAddress,
      userAgent,
    });

    console.log("[AUDIT API] event logged:", { eventType, sessionId });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("[AUDIT] Event logging error:", error);

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
      { success: false, error: "Failed to log event", code: "EVENT_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audit/events
 * Query audit events with filters
 * 
 * ALWAYS returns structured JSON:
 * Success: { success: true, events }
 * Failure: { success: false, error: string, code: string }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const eventType = searchParams.get("eventType");
    const orderId = searchParams.get("orderId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const events = await audit.queryEvents({
      organizationId,
      sessionId: sessionId || undefined,
      eventType: eventType as AuditEventType || undefined,
      orderId: orderId || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("[AUDIT] Event query error:", error);

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
      { success: false, error: "Failed to query events", code: "QUERY_ERROR" },
      { status: 500 }
    );
  }
}
