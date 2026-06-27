import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    
    // Get active super deals
    const superDeals = await (prisma as any).superDeal.findMany({
      where: {
        enabled: true,
        OR: [
          {
            startDate: null,
          },
          {
            startDate: {
              lte: now,
            },
          },
        ],
        AND: [
          {
            OR: [
              {
                endDate: null,
              },
              {
                endDate: {
                  gte: now,
                },
              },
            ],
          },
        ],
      },
      include: {
        product: {
          where: {
            published: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: superDeals.map((deal: any) => ({
        id: deal.id,
        product: {
          id: deal.product.id,
          name: deal.product.name,
          slug: deal.product.slug,
          image: deal.product.images[0],
          price: deal.product.price,
          comparePrice: deal.product.comparePrice,
          rating: deal.product.rating,
          soldCount: deal.product.soldCount,
        },
        endDate: deal.endDate?.toISOString(),
        countdown: deal.countdown,
      })),
    });
  } catch (error) {
    console.error("[HOME_DEALS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
