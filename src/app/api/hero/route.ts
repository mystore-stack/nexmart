import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const banners = await prisma.heroBanner.findMany({
      where: {
        isActive: true,
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
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    if (banners.length === 0) {
      return NextResponse.json({ success: false, banners: [] }, { status: 404 });
    }

    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error("[HERO GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero banners" },
      { status: 500 }
    );
  }
}
