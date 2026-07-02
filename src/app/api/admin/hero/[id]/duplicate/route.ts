import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { getDefaultOrganizationId } from "@/lib/tenant";

// POST duplicate hero banner (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const organizationId = await getDefaultOrganizationId();

    // Check if banner exists and belongs to organization
    const existingBanner = await prisma.heroBanner.findFirst({
      where: { id, organizationId },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: "Hero banner not found" },
        { status: 404 }
      );
    }

    // Get the highest display order for this organization
    const maxOrder = await prisma.heroBanner.findFirst({
      where: { organizationId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    // Create duplicate
    const { id: _, createdAt, updatedAt, impressions, primaryButtonClicks, secondaryButtonClicks, conversionCount, revenueGenerated, publishedAt, ...bannerData } = existingBanner;
    const duplicate = await prisma.heroBanner.create({
      data: {
        ...bannerData,
        organizationId,
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
      } as any,
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
