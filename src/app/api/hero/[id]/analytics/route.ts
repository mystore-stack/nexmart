import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const analyticsSchema = z.object({
  type: z.enum(["impression", "primaryClick", "secondaryClick"]),
  deviceType: z.enum(["mobile", "desktop", "tablet"]).optional(),
  country: z.string().optional(),
  referrer: z.string().optional(),
  landingPage: z.string().optional(),
  sessionId: z.string().optional(),
});

// POST track analytics for hero banner
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[ANALYTICS] Request received");
    const { id } = await params;
    console.log("[ANALYTICS] Params:", params);
    console.log("[ANALYTICS] Banner ID:", id);
    
    const body = await req.json();
    console.log("[ANALYTICS] Request body:", body);
    
    const { type, deviceType, country, referrer, landingPage, sessionId } = analyticsSchema.parse(body);

    const banner = await prisma.heroBanner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Hero banner not found" },
        { status: 404 }
      );
    }

    let updateData = {};
    if (type === "impression") {
      updateData = { impressions: { increment: 1 } };
    } else if (type === "primaryClick") {
      updateData = { primaryButtonClicks: { increment: 1 } };
    } else if (type === "secondaryClick") {
      updateData = { secondaryButtonClicks: { increment: 1 } };
    }

    // Update banner counters
    await prisma.heroBanner.update({
      where: { id },
      data: updateData,
    });

    // Create detailed analytics record
    await prisma.heroBannerAnalytics.create({
      data: {
        bannerId: id,
        eventType: type,
        deviceType,
        country,
        referrer,
        landingPage,
        sessionId,
        userAgent: req.headers.get("user-agent") || undefined,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[HERO ANALYTICS ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to track analytics" },
      { status: 500 }
    );
  }
}
