import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { eventType, sessionId, userId, ipAddress, userAgent, metadata } = body;

    // Validate event type
    const validEventTypes = ["IMPRESSION", "CLICK", "ADD_TO_CART", "PURCHASE", "VIEW_DETAILS"];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { success: false, error: "Invalid event type" },
        { status: 400 }
      );
    }

    // Get client IP
    const ip = ipAddress || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const ua = userAgent || req.headers.get("user-agent") || "unknown";

    await (prisma as any).superDealAnalytics.create({
      data: {
        superDealId: id,
        eventType,
        sessionId,
        userId,
        ipAddress: ip,
        userAgent: ua,
        metadata,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TRACK_SUPER_DEAL_EVENT]", error);
    return NextResponse.json(
      { success: false, error: "Failed to track event" },
      { status: 500 }
    );
  }
}
