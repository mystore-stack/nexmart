import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const promoCard = await prisma.homePromoCard.update({
      where: { id },
      data: {
        cardKey: body.cardKey,
        title: body.title,
        subtitle: body.subtitle,
        image: body.image,
        link: body.link,
        ctaText: body.ctaText,
        badgeText: body.badgeText,
        discountPills: body.discountPills,
        order: body.order,
        active: body.active,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: promoCard,
    });
  } catch (error) {
    console.error("Error updating promo card:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update promo card"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.homePromoCard.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting promo card:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete promo card"
      },
      { status: 500 }
    );
  }
}
