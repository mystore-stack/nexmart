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
    console.log("[ANALYTICS] Banner ID:", id);
    
    const body = await req.json();
    console.log("[ANALYTICS] Request body:", body);
    
    const { type, deviceType, country, referrer, landingPage, sessionId } = analyticsSchema.parse(body);

    const banner = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!banner) {
      console.log("[ANALYTICS] Hero slide not found:", id);
      return NextResponse.json(
        { success: false, error: "Hero slide not found" },
        { status: 404 }
      );
    }

    // Log analytics data (analytics tables not implemented yet)
    console.log("[ANALYTICS] Logged:", {
      bannerId: id,
      type,
      deviceType,
      country,
      referrer,
      landingPage,
      sessionId,
      userAgent: req.headers.get("user-agent") || undefined,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
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
