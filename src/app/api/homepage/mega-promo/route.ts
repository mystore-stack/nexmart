import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { buildPromoBannerPayload } from "@/lib/promo-banner";

export async function GET() {
  try {
    let organizationId: string | undefined;

    try {
      organizationId = await getDefaultOrganizationId();
    } catch {
      organizationId = undefined;
    }

    let promo = await prisma.homePromoCard.findFirst({
      where: { cardKey: "megaPromo", active: true },
      orderBy: { order: "asc" },
    });

    if (!promo) {
      promo = await prisma.homePromoCard.create({
        data: {
          cardKey: "megaPromo",
          title: "Édition premium à prix fort",
          subtitle: "Une sélection premium pensée pour les meilleures offres de la semaine.",
          image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
          link: "/products",
          ctaText: "Explorer l’offre",
          badgeText: "Mega promo",
          discountPills: ["Jusqu’à -45%", "Livraison express"],
          active: true,
          order: 0,
        },
      });
    }

    let section = await prisma.homePageSection.findFirst({
      where: { sectionKey: "megaPromo" },
    });

    if (!section) {
      section = await prisma.homePageSection.create({
        data: {
          sectionKey: "megaPromo",
          title: "Mega Promo Banner",
          subtitle: "Un coup de cœur premium pour la semaine.",
          description: JSON.stringify({
            background: "linear-gradient(135deg, #020617 0%, #111827 50%, #1f2937 100%)",
            surface: "rgba(255,255,255,0.14)",
            accent: "#f59e0b",
            text: "#f8fafc",
            cta: "#111827",
          }),
          bannerImage: promo.image,
          destinationUrl: promo.link,
          viewAllButton: "Voir l’offre",
          maxProducts: 6,
          active: true,
          order: 0,
          displayOrder: 0,
          hideIfEmpty: false,
        },
      });
    }

    let sectionProducts = section
      ? await prisma.homepageSectionProduct.findMany({
          where: { sectionId: section.id, active: true },
          orderBy: { order: "asc" },
          include: { product: true },
        })
      : [];

    if (sectionProducts.length === 0) {
      const candidateProducts = await prisma.product.findMany({
        where: {
          ...(organizationId ? { organizationId } : {}),
          published: true,
          stock: { gt: 0 },
          OR: [{ comparePrice: { not: null } }, { featured: true }],
        },
        orderBy: [{ featured: "desc" }, { soldCount: "desc" }],
        take: 6,
      });

      if (candidateProducts.length > 0) {
        await prisma.homepageSectionProduct.createMany({
          data: candidateProducts.map((product: any, index: number) => ({
            sectionId: section.id,
            productId: product.id,
            order: index,
            customBadge: product.comparePrice ? "-20%" : "Nouveau",
            active: true,
          })),
          skipDuplicates: true,
        });

        sectionProducts = await prisma.homepageSectionProduct.findMany({
          where: { sectionId: section.id, active: true },
          orderBy: { order: "asc" },
          include: { product: true },
        });
      }
    }

    const products = sectionProducts.map((item: any) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.images?.[0] || "",
      oldPrice: item.product.comparePrice ?? item.product.price,
      currentPrice: item.product.price,
      rating: item.product.rating || 4.8,
      reviewCount: item.product.reviewCount || 120,
      discountBadge: item.customBadge || "-20%",
    }));

    return NextResponse.json({
      success: true,
      data: buildPromoBannerPayload(
        promo
          ? {
              id: promo.id,
              title: promo.title,
              subtitle: promo.subtitle,
              image: promo.image,
              link: promo.link,
              ctaText: promo.ctaText,
              badgeText: promo.badgeText,
              discountPills: promo.discountPills,
              startDate: promo.startDate,
              endDate: promo.endDate,
              active: promo.active,
              order: promo.order,
            }
          : null,
        section
          ? {
              id: section.id,
              title: section.title,
              subtitle: section.subtitle,
              description: section.description,
              bannerImage: section.bannerImage,
              destinationUrl: section.destinationUrl,
              viewAllButton: section.viewAllButton,
              maxProducts: section.maxProducts,
              active: section.active,
              order: section.order,
            }
          : null,
        products
      ),
    });
  } catch (error) {
    console.error("mega promo fetch failed", error);
    return NextResponse.json({ success: false, error: "Failed to load mega promo" }, { status: 500 });
  }
}
