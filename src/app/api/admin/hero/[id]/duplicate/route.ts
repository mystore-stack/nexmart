import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";

// POST duplicate hero banner (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    // Check if banner exists
    const existingBanner = await prisma.heroBanner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: "Hero banner not found" },
        { status: 404 }
      );
    }

    // Get the highest display order
    const maxOrder = await prisma.heroBanner.findFirst({
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    // Create duplicate
    const { id: _, createdAt, updatedAt, impressions, primaryButtonClicks, secondaryButtonClicks, conversionCount, revenueGenerated, publishedAt, ...bannerData } = existingBanner;
    const duplicate = await prisma.heroBanner.create({
      data: {
        ...bannerData,
        title: `${bannerData.title} (Copy)`,
        displayOrder: (maxOrder?.displayOrder || 0) + 1,
        isActive: false,
        status: "DRAFT",
        impressions: 0,
        primaryButtonClicks: 0,
        secondaryButtonClicks: 0,
        conversionCount: 0,
        revenueGenerated: 0,
        publishedAt: null,
      },
    });

    return NextResponse.json({ success: true, banner: duplicate }, { status: 201 });
  } catch (error: any) {
    console.error("[ADMIN HERO DUPLICATE ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to duplicate hero banner" },
      { status: 500 }
    );
  }
}
