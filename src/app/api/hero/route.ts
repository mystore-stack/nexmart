import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CMSContentStatus } from "@prisma/client";
import { getDefaultOrganizationId } from "@/lib/tenant";

export async function GET() {
  try {
    const now = new Date();
    const organizationId = await getDefaultOrganizationId();

    const banners = await prisma.heroBanner.findMany({
      where: {
        organizationId,
        isActive: true,
        status: CMSContentStatus.PUBLISHED,
        AND: [
          {
            OR: [
              { publishDate: null },
              { publishDate: { lte: now } },
            ],
          },
          {
            OR: [
              { expireDate: null },
              { expireDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [{ displayOrder: "asc" }, { priorityScore: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error("[HERO API] Error:", error);
    console.error("[HERO API] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero banners" },
      { status: 500 }
    );
  }
}
