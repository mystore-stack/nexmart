import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const promoCard = await prisma.homePromoCard.create({
      data: {
        cardKey: body.cardKey,
        title: body.title,
        subtitle: body.subtitle,
        image: body.image,
        link: body.link,
        ctaText: body.ctaText,
        badgeText: body.badgeText,
        discountPills: body.discountPills,
        order: body.order || 0,
        active: body.active ?? true,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: promoCard,
    });
  } catch (error) {
    console.error("Error creating promo card:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create promo card"
      },
      { status: 500 }
    );
  }
}
