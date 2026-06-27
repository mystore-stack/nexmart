import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get featured categories
    const featuredCategories = await (prisma as any).featuredCategory.findMany({
      where: {
        enabled: true,
      },
      include: {
        category: {
          include: {
            products: {
              where: {
                published: true,
              },
              take: 3,
              orderBy: {
                soldCount: "desc",
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    // Get regular categories (not featured)
    const featuredCategoryIds = featuredCategories.map((fc: any) => fc.categoryId);
    const regularCategories = await (prisma as any).category.findMany({
      where: {
        id: {
          notIn: featuredCategoryIds,
        },
      },
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        featuredCategories: featuredCategories.map((fc: any) => ({
          id: fc.id,
          category: {
            id: fc.category.id,
            name: fc.category.name,
            slug: fc.category.slug,
            image: fc.category.image,
          },
          backgroundColor: fc.backgroundColor,
          gradient: fc.gradient,
          buttonText: fc.buttonText,
          buttonUrl: fc.buttonUrl,
          description: fc.description,
          featuredProducts: fc.category.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            image: p.images[0],
            price: p.price,
            comparePrice: p.comparePrice,
            rating: p.rating,
            soldCount: p.soldCount,
          })),
        })),
        categories: regularCategories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
        })),
      },
    });
  } catch (error) {
    console.error("[HOME_CATEGORIES_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
