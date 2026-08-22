import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

// Force dynamic rendering and no caching for CMS
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - Fetch all CMS content for the homepage
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();

    // Fetch all CMS content in parallel
    const [announcementBar, homepageConfig, footerConfig, testimonials] = await Promise.all([
      prisma.announcementBar.findFirst({
        where: { 
          organizationId,
          isActive: true,
          OR: [
            { startDate: null },
            { startDate: { lte: new Date() } }
          ],
          AND: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ]
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.homepageConfig.findFirst({
        where: { organizationId, isActive: true },
      }),
      prisma.footerConfig.findFirst({
        where: { organizationId, isActive: true },
      }),
      prisma.testimonial.findMany({
        where: { organizationId, isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        announcementBar,
        homepageConfig,
        footerConfig,
        testimonials,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("[CMS GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch CMS content" },
      { status: 500 }
    );
  }
}
