// src/app/api/homepage/sections/[sectionKey]/products/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    const { sectionKey } = await params;

    // Get the section
    const section = await prisma.homePageSection.findUnique({
      where: { sectionKey },
    });

    if (!section || !section.active) {
      return ok({ data: [], section: null });
    }

    // Get products for this section with full product details
    const sectionProducts = await prisma.homepageSectionProduct.findMany({
      where: { 
        sectionId: section.id,
        active: true,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Filter by date range if specified
    const now = new Date();
    const activeProducts = sectionProducts.filter(sp => {
      if (sp.startDate && sp.startDate > now) return false;
      if (sp.endDate && sp.endDate < now) return false;
      return true;
    });

    // Format response
    const products = activeProducts.map(sp => ({
      id: sp.product.id,
      name: sp.product.name,
      slug: sp.product.slug,
      description: sp.product.description,
      price: sp.customPrice || sp.product.price,
      comparePrice: sp.product.comparePrice,
      images: sp.product.images,
      sku: sp.product.sku,
      stock: sp.product.stock,
      rating: sp.product.rating,
      reviewCount: sp.product.reviewCount,
      soldCount: sp.product.soldCount,
      category: sp.product.category,
      tags: sp.product.tags,
      customBadge: sp.customBadge,
      order: sp.order,
    }));

    return ok({ 
      data: products,
      section: {
        id: section.id,
        sectionKey: section.sectionKey,
        title: section.title,
        subtitle: section.subtitle,
        description: section.description,
        bannerImage: section.bannerImage,
        viewAllButton: section.viewAllButton,
        destinationUrl: section.destinationUrl,
        active: section.active,
        maxProducts: section.maxProducts,
        hideIfEmpty: section.hideIfEmpty,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
