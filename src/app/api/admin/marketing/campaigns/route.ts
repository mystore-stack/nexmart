import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { z } from "zod";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.enum(["facebook", "google", "tiktok", "email", "other"]),
  campaignId: z.string().optional(),
  budget: z.number().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  metadata: z.any().optional(),
});

// GET all marketing campaigns
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const campaigns = await prisma.adCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    console.error("[CAMPAIGNS GET ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST create new campaign
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const data = campaignSchema.parse(body);

    const campaign = await prisma.adCampaign.create({
      data: {
        name: data.name,
        platform: data.platform,
        campaignId: data.campaignId,
        budget: data.budget,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        metadata: data.metadata,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    console.error("[CAMPAIGN CREATE ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
