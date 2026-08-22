// src/app/api/homepage/sections/[sectionKey]/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { normalizeToCanonicalKey, getCanonicalSection } from "@/lib/homepage/canonical-contract";
import { deduplicateProducts } from "@/lib/product-deduplication";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    const { sectionKey: rawKey } = await params;

    // Normalize section key
    const sectionKey = normalizeToCanonicalKey(rawKey);
    const canonicalSection = getCanonicalSection(rawKey);
    console.log("[PUBLIC SECTION PRODUCTS] RAW KEY:", rawKey);
    console.log("[PUBLIC SECTION PRODUCTS] NORMALIZED KEY:", sectionKey);

    if (!sectionKey || !canonicalSection) {
      console.error("[PUBLIC SECTION PRODUCTS] Invalid section key:", rawKey);
      return NextResponse.json({ error: "Invalid section key" }, { status: 400 });
    }

    // Warn about legacy usage
    if (rawKey !== sectionKey) {
      console.warn("[PUBLIC SECTION PRODUCTS] Legacy section key used:", rawKey, "->", sectionKey);
    }

    // Get the section
    const section = await prisma.homePageSection.findFirst({
      where: { sectionKey },
    });

    if (!section || !section.active) {
      return NextResponse.json({ data: [], section: null });
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

    // Deduplicate products to ensure no duplicates in the same section
    const uniqueProducts = deduplicateProducts(products);

    return NextResponse.json({
      success: true,
      data: uniqueProducts,
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
