import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get organization - for now use default organization
    const organization = await prisma.organization.findFirst({
      where: { slug: "nexmart" },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const organizationId = organization.id;

    // Fetch categories
    const categories = await prisma.category.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        _count: {
          select: { products: true },
        },
      },
      take: 9,
    });

    // Fetch featured products
    const featuredProducts = await prisma.product.findMany({
      where: {
        organizationId,
        published: true,
        featured: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: 16,
      orderBy: {
        soldCount: "desc",
      },
    });

    // Fetch active deals
    const activeDeals = await prisma.deal.findMany({
      where: {
        organizationId,
        active: true,
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      },
      include: {
        products: {
          include: {
            Product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      take: 4,
    });

    // Fetch bundles
    const bundles = await prisma.bundle.findMany({
      where: {
        organizationId,
        active: true,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      take: 3,
    });

    // Fetch store boxes
    const storeBoxes = await prisma.storeBox.findMany({
      where: {
        organizationId,
        active: true,
      },
      take: 2,
    });

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          count: cat._count.products,
        })),
        featuredProducts: featuredProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          images: product.images,
          rating: product.rating,
          reviewCount: product.reviewCount,
          soldCount: product.soldCount,
          category: product.category,
          tags: product.tags,
        })),
        deals: activeDeals.map((deal: any) => ({
          id: deal.id,
          name: deal.name,
          slug: deal.slug,
          discountType: deal.discountType,
          discountValue: deal.discountValue,
          startsAt: deal.startsAt,
          endsAt: deal.endsAt,
          stockLimit: deal.stockLimit,
          soldCount: deal.soldCount,
          products: deal.products.map((dp: any) => ({
            position: dp.position,
            product: dp.Product,
          })),
        })),
        bundles: bundles.map((bundle: any) => ({
          id: bundle.id,
          name: bundle.name,
          slug: bundle.slug,
          description: bundle.description,
          image: bundle.image,
          regularPrice: bundle.regularPrice,
          bundlePrice: bundle.bundlePrice,
          discount: bundle.discount,
          sales: bundle.sales,
          products: bundle.products.map((bp: any) => bp.product),
        })),
        storeBoxes: storeBoxes.map((box: any) => ({
          id: box.id,
          name: box.name,
          slug: box.slug,
          description: box.description,
          image: box.image,
          cadence: box.cadence,
          price: box.price,
          comparePrice: box.comparePrice,
        })),
      },
    });
  } catch (error) {
    console.error("[HOMEPAGE API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage data" },
      { status: 500 }
    );
  }
}
