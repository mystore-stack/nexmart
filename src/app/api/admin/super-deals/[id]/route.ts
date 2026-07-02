import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - Get single super deal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();

    const superDeal = await (prisma as any).superDeal.findFirst({
      where: { id, organizationId: session.organizationId },
      include: {
        product: true,
        analytics: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    });

    if (!superDeal) {
      return NextResponse.json(
        { success: false, error: "Super deal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: superDeal,
    });
  } catch (error) {
    console.error("[SUPER_DEAL_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch super deal" },
      { status: 500 }
    );
  }
}

// PATCH - Update super deal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updateData: any = {};
    if (productId !== undefined) {
      const product = await prisma.product.findFirst({
        where: { id: productId, organizationId: session.organizationId },
        select: { id: true },
      });

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `Product ${productId} was not found in organization ${session.organizationId}. Refresh the product selector and choose an available product.`,
          },
          { status: 404 }
        );
      }

      updateData.productId = productId;
    }
    if (order !== undefined) updateData.order = order;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (dealPrice !== undefined) updateData.dealPrice = dealPrice;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (autoStart !== undefined) updateData.autoStart = autoStart;
    if (autoEnd !== undefined) updateData.autoEnd = autoEnd;
    if (countdown !== undefined) updateData.countdown = countdown;
    if (featured !== undefined) updateData.featured = featured;
    if (flashSale !== undefined) updateData.flashSale = flashSale;
    if (stockLimit !== undefined) updateData.stockLimit = stockLimit;
    if (image !== undefined) updateData.image = image;
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage;
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
    if (gradient !== undefined) updateData.gradient = gradient;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (buttonUrl !== undefined) updateData.buttonUrl = buttonUrl;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (ogImage !== undefined) updateData.ogImage = ogImage;
    if (titleAr !== undefined) updateData.titleAr = titleAr;
    if (titleFr !== undefined) updateData.titleFr = titleFr;
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
    if (descriptionFr !== undefined) updateData.descriptionFr = descriptionFr;
    if (buttonTextAr !== undefined) updateData.buttonTextAr = buttonTextAr;
    if (buttonTextFr !== undefined) updateData.buttonTextFr = buttonTextFr;
    if (aiGenerated !== undefined) updateData.aiGenerated = aiGenerated;
    if (aiPrompt !== undefined) updateData.aiPrompt = aiPrompt;

    const existingDeal = await (prisma as any).superDeal.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true },
    });

    if (!existingDeal) {
      return NextResponse.json(
        { success: false, error: "Super deal not found in this organization" },
        { status: 404 }
      );
    }

    const superDeal = await (prisma as any).superDeal.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: superDeal,
    });
  } catch (error) {
    console.error("[SUPER_DEALS_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update super deal" },
      { status: 500 }
    );
  }
}

// DELETE - Delete super deal
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();

    const existingDeal = await (prisma as any).superDeal.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true },
    });

    if (!existingDeal) {
      return NextResponse.json(
        { success: false, error: "Super deal not found in this organization" },
        { status: 404 }
      );
    }

    await (prisma as any).superDeal.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Super deal deleted successfully",
    });
  } catch (error) {
    console.error("[SUPER_DEALS_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete super deal" },
      { status: 500 }
    );
  }
}
