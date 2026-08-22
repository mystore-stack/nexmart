import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const banners = await prisma.heroSlide.findMany({
      where: {
        active: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    // Return stable response with empty array instead of 404
    // Homepage data endpoints should return success with empty data, not 404
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error("[HERO GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero banners" },
      { status: 500 }
    );
  }
}
