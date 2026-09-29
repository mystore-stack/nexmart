// src/app/api/mobile/cms/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_MOBILE_SECTIONS } from "@/app/api/admin/cms/mobile-app/route";

export async function GET() {
  try {
    let dbSections = await prisma.mobileAppSection.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    if (dbSections.length === 0) {
      // Seed if empty
      for (const sec of DEFAULT_MOBILE_SECTIONS) {
        await prisma.mobileAppSection.create({
          data: {
            sectionKey: sec.sectionKey,
            titleFr: sec.titleFr,
            titleAr: sec.titleAr,
            subtitleFr: sec.subtitleFr,
            subtitleAr: sec.subtitleAr,
            order: sec.order,
            active: sec.active,
            layoutType: sec.layoutType,
            bannerImage: sec.bannerImage || null,
            config: sec.config || null,
          },
        });
      }
      dbSections = await prisma.mobileAppSection.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      });
    }

    // Fetch fallback products, categories, and brands to populate sections if specific IDs aren't pinned
    const [allProducts, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where: { published: true },
        orderBy: { soldCount: "desc" },
        take: 30,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, logo: true } },
        },
      }),
      prisma.category.findMany({
        orderBy: { order: "asc" },
        take: 12,
      }),
      prisma.brand.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
        take: 12,
      }),
    ]);

    const formattedSections = await Promise.all(
      dbSections.map(async (sec) => {
        let products = allProducts;

        if (sec.productIds && sec.productIds.length > 0) {
          const customProds = await prisma.product.findMany({
            where: { id: { in: sec.productIds }, published: true },
            include: {
              category: { select: { id: true, name: true, slug: true } },
              brand: { select: { id: true, name: true, logo: true } },
            },
          });
          if (customProds.length > 0) {
            products = customProds;
          }
        }

        // Section specific slicing or filtering logic
        if (sec.sectionKey === "offresDuMoment") {
          products = products.filter((p) => p.comparePrice && p.comparePrice > p.price).slice(0, 10);
          if (products.length === 0) products = allProducts.slice(0, 10);
        } else if (sec.sectionKey === "meilleuresVentes") {
          products = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 10);
        } else if (sec.sectionKey === "nouveautes") {
          products = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
        }

        return {
          id: sec.id,
          sectionKey: sec.sectionKey,
          titleFr: sec.titleFr,
          titleAr: sec.titleAr || sec.titleFr,
          subtitleFr: sec.subtitleFr || "",
          subtitleAr: sec.subtitleAr || "",
          order: sec.order,
          active: sec.active,
          layoutType: sec.layoutType,
          bannerImage: sec.bannerImage,
          config: sec.config,
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            comparePrice: p.comparePrice,
            images: p.images,
            category: p.category?.name || "Général",
            categoryId: p.categoryId,
            inStock: p.stock > 0,
            stock: p.stock,
            rating: p.rating || 4.8,
            reviewCount: p.reviewCount || 12,
            soldCount: p.soldCount || 0,
            sku: p.sku,
            brand: p.brand?.name || null,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        sections: formattedSections,
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80",
          itemCount: 15,
        })),
        brands: brands.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          logo: b.logo || b.image,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching mobile CMS:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load mobile CMS sections" },
      { status: 500 }
    );
  }
}
