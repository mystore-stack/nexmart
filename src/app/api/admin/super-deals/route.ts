import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - List all super deals
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const enabled = searchParams.get("enabled");
    const featured = searchParams.get("featured");

    const where: any = { organizationId: session.organizationId };
    if (enabled === "true") where.enabled = true;
    if (featured === "true") where.featured = true;

    const superDeals = await (prisma as any).superDeal.findMany({
      where,
      include: {
        product: true,
        analytics: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: superDeals,
    });
  } catch (error) {
    console.error("[SUPER_DEALS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch super deals" },
      { status: 500 }
    );
  }
}

// POST - Create super deal
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const {
      productId,
      order,
      enabled,
      discountType,
      discountValue,
      originalPrice,
      dealPrice,
      startDate,
      endDate,
      autoStart,
      autoEnd,
      countdown,
      featured,
      flashSale,
      stockLimit,
      image,
      bannerImage,
      backgroundColor,
      gradient,
      buttonText,
      buttonUrl,
      title,
      description,
      seoTitle,
      seoDescription,
      ogImage,
      titleAr,
      titleFr,
      descriptionAr,
      descriptionFr,
      buttonTextAr,
      buttonTextFr,
      aiGenerated,
      aiPrompt,
    } = body;

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        organizationId: session.organizationId,
      },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: `Product ${productId || "(missing)"} was not found in organization ${session.organizationId}. Refresh the product selector and choose an available product.`,
        },
        { status: 404 }
      );
    }

    const superDeal = await (prisma as any).superDeal.create({
      data: {
        organizationId: session.organizationId,
        productId,
        order: order || 0,
        enabled: enabled !== undefined ? enabled : true,
        discountType: discountType || "PERCENTAGE",
        discountValue: discountValue || 0,
        originalPrice,
        dealPrice,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        autoStart: autoStart !== undefined ? autoStart : false,
        autoEnd: autoEnd !== undefined ? autoEnd : true,
        countdown: countdown !== undefined ? countdown : false,
        featured: featured !== undefined ? featured : false,
        flashSale: flashSale !== undefined ? flashSale : false,
        stockLimit,
        image,
        bannerImage,
        backgroundColor: backgroundColor || "#ffffff",
        gradient,
        buttonText: buttonText || "Buy Now",
        buttonUrl,
        title,
        description,
        seoTitle,
        seoDescription,
        ogImage,
        titleAr,
        titleFr,
        descriptionAr,
        descriptionFr,
        buttonTextAr,
        buttonTextFr,
        aiGenerated: aiGenerated || false,
        aiPrompt,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: superDeal,
    });
  } catch (error) {
    console.error("[SUPER_DEALS_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create super deal" },
      { status: 500 }
    );
  }
}
