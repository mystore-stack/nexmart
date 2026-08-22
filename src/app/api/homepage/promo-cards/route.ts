import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const promoCards = await prisma.homePromoCard.findMany({
      where: {
        active: true,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        ]
      },
      orderBy: {
        order: "asc"
      }
    });

    return NextResponse.json({
      success: true,
      data: promoCards
    });
  } catch (error) {
    console.error("Error fetching promo cards:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch promo cards"
      },
      { status: 500 }
    );
  }
}
