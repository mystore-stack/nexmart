// src/app/api/admin/cms/homepage-sections/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const sectionSchema = z.object({
  sectionKey: z.string().min(2),
  title: z.string().min(2),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  bannerImage: z.string().optional(),
  viewAllButton: z.string().optional(),
  destinationUrl: z.string().optional(),
  order: z.number().int().default(0),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
  maxProducts: z.number().int().default(12),
  hideIfEmpty: z.boolean().default(false),
});

const DEFAULT_SECTIONS = [
  { sectionKey: "hero", title: "Hero", description: "Bannière principale et CTA", destinationUrl: "/" },
  { sectionKey: "categories", title: "Catégories", description: "Ordre, visibilité et images des catégories homepage", destinationUrl: "/categories" },
  { sectionKey: "promotionalCards", title: "Cartes Promo", description: "Bannières promotionnelles et collections spéciales", destinationUrl: "/promotions" },
  { sectionKey: "flashDeals", title: "Ventes Flash", description: "Articles en promotion avec compte à rebours", destinationUrl: "/collections/flash-deals", viewAllButton: "Voir toutes les offres" },
  { sectionKey: "flashSale", title: "Flash Sale", description: "Offres flash dans la section vente du jour", destinationUrl: "/deals", viewAllButton: "Voir tout" },
  { sectionKey: "serviceBanners", title: "Bannières Service", description: "Livraison express et paiement à la livraison", destinationUrl: "/services" },
  { sectionKey: "showcaseGrid", title: "Showcase Grid", description: "Meilleures ventes, nouveautés, mystery boxes", destinationUrl: "/collections" },
  { sectionKey: "bundleBuilder", title: "Bundle Builder", description: "Création de packs et réductions packagées", destinationUrl: "/bundles", viewAllButton: "Créer un bundle" },
  { sectionKey: "buyMoreSaveMore", title: "Buy More Save More", description: "Offres cumulatives et réductions progressives", destinationUrl: "/deals/buy-more-save-more", viewAllButton: "Voir toutes les offres" },
  { sectionKey: "recommended", title: "Recommended For You", description: "Produits recommandés personnalisés", destinationUrl: "/collections/recommended", viewAllButton: "Voir tout" },
  { sectionKey: "brandCarousel", title: "Marques Partenaires", description: "Carousel des partenaires et marques premium", destinationUrl: "/brands" },
  { sectionKey: "featuredProducts", title: "Produits en Vedette", description: "Sélection premium de produits mis en avant", destinationUrl: "/collections/featured", viewAllButton: "Voir tout" },
  { sectionKey: "promoBanner", title: "Promo Banner", description: "Bannière marketing secondaire", destinationUrl: "/promotions" },
  { sectionKey: "trendingProducts", title: "Tendances", description: "Produits populaires et tendances du moment", destinationUrl: "/collections/trending", viewAllButton: "Voir tout" },
  { sectionKey: "recentlyViewed", title: "Historique de Navigation", description: "Produits récemment consultés", destinationUrl: "/account/history" },
  { sectionKey: "whyNexMart", title: "Pourquoi NexMart", description: "Section de confiance et différenciation de marque", destinationUrl: "/about" },
  { sectionKey: "featuresBar", title: "Barre d'Avantages", description: "Livraison, paiement sécurisé, support client", destinationUrl: "/services" },
  { sectionKey: "mobileAppBanner", title: "Promotion Mobile", description: "Encourager le téléchargement de l'app mobile", destinationUrl: "/app" },
  { sectionKey: "newsletter", title: "Newsletter", description: "Inscription à la newsletter premium", destinationUrl: "/newsletter" },
];

export async function GET() {
  try {
    await requireAdmin();
    let sections = await prisma.homePageSection.findMany({ orderBy: { order: "asc" } });
    
    console.log("Found sections in DB:", sections.length);
    
    // If no sections exist, initialize defaults
    if (sections.length === 0) {
      console.log("No sections found, initializing defaults...");
      try {
        sections = await prisma.$transaction(
          DEFAULT_SECTIONS.map((section, index) =>
            prisma.homePageSection.create({
              data: {
                ...section,
                order: index + 1,
                active: true,
              },
            })
)
        );
        console.log("Default sections created:", sections.length);
      } catch (createError) {
        console.error("Error creating default sections:", createError);
        // Return empty array if creation fails
        return ok({ data: [] });
      }
    }
    
    console.log("Returning sections:", sections.length);
    return ok(sections);
  } catch (err) {
    console.error("Error in GET:", err);
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = sectionSchema.parse(body);
    const section = await prisma.homePageSection.upsert({
      where: { sectionKey: data.sectionKey },
      update: data,
      create: data,
    });
    return ok(section);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    console.log("PATCH body:", body);
    const { id, ...updates } = body;
    if (!id) throw new Error("Section ID is required");
    console.log("Updating section:", id, "with:", updates);
    const section = await prisma.homePageSection.update({ where: { id }, data: updates });
    console.log("Updated section:", section);
    return ok(section);
  } catch (err: any) {
    console.error("PATCH error:", err);
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("Section ID is required");
    await prisma.homePageSection.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { items } = await req.json();
    if (!Array.isArray(items)) throw new Error("Items array is required for reordering");

    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.homePageSection.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );

    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
