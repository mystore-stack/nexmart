// src/app/api/admin/cms/mobile-app/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const sectionSchema = z.object({
  id: z.string().optional(),
  sectionKey: z.string().min(2),
  titleFr: z.string().min(2),
  titleAr: z.string().optional().nullable(),
  subtitleFr: z.string().optional().nullable(),
  subtitleAr: z.string().optional().nullable(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  layoutType: z.string().default("grid"),
  bannerImage: z.string().optional().nullable(),
  productIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  brandIds: z.array(z.string()).default([]),
  config: z.any().optional(),
});

export const DEFAULT_MOBILE_SECTIONS = [
  {
    sectionKey: "heroCarousel",
    titleFr: "Offres Spéciales",
    titleAr: "عروض خاصة",
    subtitleFr: "La technologie à portée de main",
    subtitleAr: "التكنولوجيا بين يديك",
    order: 1,
    active: true,
    layoutType: "carousel",
    config: {
      banners: [
        {
          id: "banner-1",
          badgeFr: "Offre spéciale",
          badgeAr: "عرض خاص",
          titleFr: "La technologie à portée de main",
          titleAr: "التكنولوجيا بين يديك",
          subtitleFr: "Découvrez nos meilleurs produits électroniques avec des prix exclusifs.",
          subtitleAr: "اكتشف أفضل منتجاتنا الإلكترونية بأسعار حصرية.",
          ctaFr: "Voir l'offre",
          ctaAr: "تصفح العرض",
          gradient: ["#0F766E", "#042F2E"],
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "banner-2",
          badgeFr: "Équipement maison",
          badgeAr: "تجهيزات المنزل",
          titleFr: "Transformez votre maison",
          titleAr: "غيّر ديكور بيتك",
          subtitleFr: "Des produits de qualité pour un intérieur moderne et confortable.",
          subtitleAr: "منتجات عالية الجودة لمنزل عصري ومريح.",
          ctaFr: "Découvrir",
          ctaAr: "إكتشف الآن",
          gradient: ["#0284C7", "#0369A1"],
          image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        },
      ],
    },
  },
  {
    sectionKey: "categories",
    titleFr: "Nos Catégories",
    titleAr: "الفئات",
    subtitleFr: "Explorez nos univers",
    subtitleAr: "تصفح مجموعاتنا",
    order: 2,
    active: true,
    layoutType: "pills",
  },
  {
    sectionKey: "offresDuMoment",
    titleFr: "Nos offres du moment",
    titleAr: "عروض اللحظة المميزة",
    subtitleFr: "Prix réduits et ventes flash",
    subtitleAr: "تخفيضات واسعة ومميزة",
    order: 3,
    active: true,
    layoutType: "carousel",
  },
  {
    sectionKey: "marquesVedettes",
    titleFr: "Nos marques vedettes",
    titleAr: "ماركاتنا الشهيرة",
    subtitleFr: "Les marques officielles recommandées",
    subtitleAr: "أبرز العلامات التجارية المعتمدة",
    order: 4,
    active: true,
    layoutType: "brands",
  },
  {
    sectionKey: "meilleuresVentes",
    titleFr: "Meilleures ventes",
    titleAr: "الأكثر مبيعاً",
    subtitleFr: "Les produits plébiscités par nos clients",
    subtitleAr: "المنتجات الأكثر طلباً وإعجاباً",
    order: 5,
    active: true,
    layoutType: "grid",
  },
  {
    sectionKey: "promoBanner",
    titleFr: "Équipement Maison Premium",
    titleAr: "تجهيزات منزلية راقية",
    subtitleFr: "Transformez votre espace de vie avec nos sélections",
    subtitleAr: "عزز جمال بيتك بأجود المستلزمات",
    order: 6,
    active: true,
    layoutType: "banner",
    bannerImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    config: {
      ctaFr: "Découvrir",
      ctaAr: "تسوق الآن",
      link: "/categories",
    },
  },
  {
    sectionKey: "nouveautes",
    titleFr: "Nouveautés",
    titleAr: "وصل حديثاً",
    subtitleFr: "Derniers arrivages exclusifs",
    subtitleAr: "أحدث المنتجات المضافة حديثاً",
    order: 7,
    active: true,
    layoutType: "grid",
  },
];

async function ensureSeedSections() {
  const count = await prisma.mobileAppSection.count();
  if (count === 0) {
    for (const sec of DEFAULT_MOBILE_SECTIONS) {
      await prisma.mobileAppSection.upsert({
        where: { sectionKey: sec.sectionKey },
        update: {},
        create: {
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
  }
}

export async function GET() {
  try {
    await requireAdmin();
    await ensureSeedSections();
    const sections = await prisma.mobileAppSection.findMany({
      orderBy: { order: "asc" },
    });
    return ok(sections);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (body.action === "reset") {
      await prisma.mobileAppSection.deleteMany({});
      await ensureSeedSections();
      const resetSections = await prisma.mobileAppSection.findMany({
        orderBy: { order: "asc" },
      });
      return ok(resetSections);
    }

    if (Array.isArray(body.sections)) {
      const updated = [];
      for (let i = 0; i < body.sections.length; i++) {
        const item = body.sections[i];
        const parsed = sectionSchema.parse({ ...item, order: i + 1 });
        const existing = await prisma.mobileAppSection.findUnique({
          where: { sectionKey: parsed.sectionKey },
        });

        if (existing) {
          const res = await prisma.mobileAppSection.update({
            where: { sectionKey: parsed.sectionKey },
            data: {
              titleFr: parsed.titleFr,
              titleAr: parsed.titleAr,
              subtitleFr: parsed.subtitleFr,
              subtitleAr: parsed.subtitleAr,
              order: parsed.order,
              active: parsed.active,
              layoutType: parsed.layoutType,
              bannerImage: parsed.bannerImage,
              productIds: parsed.productIds,
              categoryIds: parsed.categoryIds,
              brandIds: parsed.brandIds,
              config: parsed.config,
            },
          });
          updated.push(res);
        } else {
          const res = await prisma.mobileAppSection.create({
            data: {
              sectionKey: parsed.sectionKey,
              titleFr: parsed.titleFr,
              titleAr: parsed.titleAr,
              subtitleFr: parsed.subtitleFr,
              subtitleAr: parsed.subtitleAr,
              order: parsed.order,
              active: parsed.active,
              layoutType: parsed.layoutType,
              bannerImage: parsed.bannerImage,
              productIds: parsed.productIds,
              categoryIds: parsed.categoryIds,
              brandIds: parsed.brandIds,
              config: parsed.config,
            },
          });
          updated.push(res);
        }
      }
      return ok(updated);
    }

    const parsed = sectionSchema.parse(body);
    const result = await prisma.mobileAppSection.upsert({
      where: { sectionKey: parsed.sectionKey },
      update: {
        titleFr: parsed.titleFr,
        titleAr: parsed.titleAr,
        subtitleFr: parsed.subtitleFr,
        subtitleAr: parsed.subtitleAr,
        order: parsed.order,
        active: parsed.active,
        layoutType: parsed.layoutType,
        bannerImage: parsed.bannerImage,
        productIds: parsed.productIds,
        categoryIds: parsed.categoryIds,
        brandIds: parsed.brandIds,
        config: parsed.config,
      },
      create: {
        sectionKey: parsed.sectionKey,
        titleFr: parsed.titleFr,
        titleAr: parsed.titleAr,
        subtitleFr: parsed.subtitleFr,
        subtitleAr: parsed.subtitleAr,
        order: parsed.order,
        active: parsed.active,
        layoutType: parsed.layoutType,
        bannerImage: parsed.bannerImage,
        productIds: parsed.productIds,
        categoryIds: parsed.categoryIds,
        brandIds: parsed.brandIds,
        config: parsed.config,
      },
    });

    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}
