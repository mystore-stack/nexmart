// src/app/api/audit/events/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit/server";
import type { AuditEventType } from "@/lib/audit/types";

/**
 * POST /api/audit/events/batch
 * Log multiple audit events in a batch
 * Optimized to prevent connection storms by using sequential processing with connection reuse
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, organizationId, userId, events: eventBatch } = body;

    if (!eventBatch || !Array.isArray(eventBatch)) {
      return NextResponse.json(
        { success: false, error: "Events array required" },
        { status: 400 }
      );
    }

    if (eventBatch.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        successful: 0,
        failed: 0,
      });
    }

    // Process events sequentially to reuse connection and prevent connection storms
    // Sequential processing is safer for serverless than parallel Promise.all
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const eventData of eventBatch) {
      try {
        await audit.event({
          sessionId,
          eventType: eventData.eventType as AuditEventType,
          userId,
          organizationId,
          orderId: eventData.orderId,
          cartSnapshot: eventData.cartSnapshot,
          metadata: eventData.metadata,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
        });
        successful++;
      } catch (error) {
        console.error("[AUDIT] Failed to log event:", error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: eventBatch.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error("[AUDIT] Batch event logging error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log batch events" },
      { status: 500 }
    );
  }
}
