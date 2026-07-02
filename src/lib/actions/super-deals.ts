"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-api";

export async function getSuperDeals(filters?: {
  enabled?: boolean;
  featured?: boolean;
}) {
  console.log("[GET_SUPER_DEALS] === SERVER ACTION START ===");
  try {
    console.log("[GET_SUPER_DEALS] Checking admin auth...");
    const session = await requireAdmin();
    console.log("[GET_SUPER_DEALS] Auth successful:", {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    
    const where: any = {};
    if (filters?.enabled !== undefined) where.enabled = filters.enabled;
    if (filters?.featured !== undefined) where.featured = filters.featured;

    console.log("[GET_SUPER_DEALS] Querying super deals with where:", where);
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

    console.log("[GET_SUPER_DEALS] Found", superDeals.length, "super deals");
    return { success: true, data: superDeals };
  } catch (error) {
    console.error("[GET_SUPER_DEALS] Error:", error);
    console.error("[GET_SUPER_DEALS] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, error: "Failed to fetch super deals" };
  }
}

export async function getSuperDeal(id: string) {
  try {
    await requireAdmin();

    const superDeal = await (prisma as any).superDeal.findUnique({
      where: { id },
      include: {
        product: true,
        analytics: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    });

    if (!superDeal) {
      return { success: false, error: "Super deal not found" };
    }

    return { success: true, data: superDeal };
  } catch (error) {
    console.error("[GET_SUPER_DEAL]", error);
    return { success: false, error: "Failed to fetch super deal" };
  }
}

export async function createSuperDeal(data: any) {
  try {
    await requireAdmin();

    const superDeal = await (prisma as any).superDeal.create({
      data: {
        organizationId: data.organizationId,
        productId: data.productId,
        order: data.order || 0,
        enabled: data.enabled !== undefined ? data.enabled : true,
        discountType: data.discountType || "PERCENTAGE",
        discountValue: data.discountValue || 0,
        originalPrice: data.originalPrice,
        dealPrice: data.dealPrice,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        autoStart: data.autoStart !== undefined ? data.autoStart : false,
        autoEnd: data.autoEnd !== undefined ? data.autoEnd : true,
        countdown: data.countdown !== undefined ? data.countdown : false,
        featured: data.featured !== undefined ? data.featured : false,
        flashSale: data.flashSale !== undefined ? data.flashSale : false,
        stockLimit: data.stockLimit,
        image: data.image,
        bannerImage: data.bannerImage,
        backgroundColor: data.backgroundColor || "#ffffff",
        gradient: data.gradient,
        buttonText: data.buttonText || "Buy Now",
        buttonUrl: data.buttonUrl,
        title: data.title,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogImage: data.ogImage,
        titleAr: data.titleAr,
        titleFr: data.titleFr,
        descriptionAr: data.descriptionAr,
        descriptionFr: data.descriptionFr,
        buttonTextAr: data.buttonTextAr,
        buttonTextFr: data.buttonTextFr,
        aiGenerated: data.aiGenerated || false,
        aiPrompt: data.aiPrompt,
      },
      include: {
        product: true,
      },
    });

    revalidatePath("/admin/super-deals");
    revalidatePath("/");

    return { success: true, data: superDeal };
  } catch (error) {
    console.error("[CREATE_SUPER_DEAL]", error);
    return { success: false, error: "Failed to create super deal" };
  }
}

export async function updateSuperDeal(id: string, data: any) {
  try {
    await requireAdmin();

    const updateData: any = {};
    if (data.productId !== undefined) updateData.productId = data.productId;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice;
    if (data.dealPrice !== undefined) updateData.dealPrice = data.dealPrice;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.autoStart !== undefined) updateData.autoStart = data.autoStart;
    if (data.autoEnd !== undefined) updateData.autoEnd = data.autoEnd;
    if (data.countdown !== undefined) updateData.countdown = data.countdown;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.flashSale !== undefined) updateData.flashSale = data.flashSale;
    if (data.stockLimit !== undefined) updateData.stockLimit = data.stockLimit;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.bannerImage !== undefined) updateData.bannerImage = data.bannerImage;
    if (data.backgroundColor !== undefined) updateData.backgroundColor = data.backgroundColor;
    if (data.gradient !== undefined) updateData.gradient = data.gradient;
    if (data.buttonText !== undefined) updateData.buttonText = data.buttonText;
    if (data.buttonUrl !== undefined) updateData.buttonUrl = data.buttonUrl;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.ogImage !== undefined) updateData.ogImage = data.ogImage;
    if (data.titleAr !== undefined) updateData.titleAr = data.titleAr;
    if (data.titleFr !== undefined) updateData.titleFr = data.titleFr;
    if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr;
    if (data.descriptionFr !== undefined) updateData.descriptionFr = data.descriptionFr;
    if (data.buttonTextAr !== undefined) updateData.buttonTextAr = data.buttonTextAr;
    if (data.buttonTextFr !== undefined) updateData.buttonTextFr = data.buttonTextFr;
    if (data.aiGenerated !== undefined) updateData.aiGenerated = data.aiGenerated;
    if (data.aiPrompt !== undefined) updateData.aiPrompt = data.aiPrompt;

    const superDeal = await (prisma as any).superDeal.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
      },
    });

    revalidatePath("/admin/super-deals");
    revalidatePath("/");

    return { success: true, data: superDeal };
  } catch (error) {
    console.error("[UPDATE_SUPER_DEAL]", error);
    return { success: false, error: "Failed to update super deal" };
  }
}

export async function deleteSuperDeal(id: string) {
  try {
    await requireAdmin();

    await (prisma as any).superDeal.delete({
      where: { id },
    });

    revalidatePath("/admin/super-deals");
    revalidatePath("/");

    return { success: true, message: "Super deal deleted successfully" };
  } catch (error) {
    console.error("[DELETE_SUPER_DEAL]", error);
    return { success: false, error: "Failed to delete super deal" };
  }
}

export async function duplicateSuperDeal(id: string) {
  try {
    await requireAdmin();

    const original = await (prisma as any).superDeal.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!original) {
      return { success: false, error: "Super deal not found" };
    }

    const { id: _, createdAt, updatedAt, ...data } = original;

    const duplicated = await (prisma as any).superDeal.create({
      data: {
        ...data,
        title: data.title ? `${data.title} (Copy)` : null,
        enabled: false,
        order: data.order + 1,
      },
      include: {
        product: true,
      },
    });

    revalidatePath("/admin/super-deals");

    return { success: true, data: duplicated };
  } catch (error) {
    console.error("[DUPLICATE_SUPER_DEAL]", error);
    return { success: false, error: "Failed to duplicate super deal" };
  }
}

export async function reorderSuperDeals(orders: { id: string; order: number }[]) {
  try {
    await requireAdmin();

    await Promise.all(
      orders.map(({ id, order }) =>
        (prisma as any).superDeal.update({
          where: { id },
          data: { order },
        })
      )
    );

    revalidatePath("/admin/super-deals");
    revalidatePath("/");

    return { success: true, message: "Super deals reordered successfully" };
  } catch (error) {
    console.error("[REORDER_SUPER_DEALS]", error);
    return { success: false, error: "Failed to reorder super deals" };
  }
}

export async function trackSuperDealEvent(data: {
  superDealId: string;
  eventType: "IMPRESSION" | "CLICK" | "ADD_TO_CART" | "PURCHASE" | "VIEW_DETAILS";
  sessionId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}) {
  try {
    await (prisma as any).superDealAnalytics.create({
      data,
    });

    return { success: true };
  } catch (error) {
    console.error("[TRACK_SUPER_DEAL_EVENT]", error);
    return { success: false, error: "Failed to track event" };
  }
}

export async function getSuperDealAnalytics(superDealId: string) {
  try {
    await requireAdmin();

    const analytics = await (prisma as any).superDealAnalytics.groupBy({
      by: ["eventType"],
      where: { superDealId },
      _count: true,
    });

    const stats = analytics.reduce((acc: any, item: any) => {
      acc[item.eventType] = item._count;
      return acc;
    }, {});

    return { success: true, data: stats };
  } catch (error) {
    console.error("[GET_SUPER_DEAL_ANALYTICS]", error);
    return { success: false, error: "Failed to fetch analytics" };
  }
}
