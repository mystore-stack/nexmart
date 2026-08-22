import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sections = await prisma.homePageSection.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      include: {
        products: {
          where: { active: true },
          orderBy: { order: "asc" },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch homepage sections",
      },
      { status: 500 }
    );
  }
}
