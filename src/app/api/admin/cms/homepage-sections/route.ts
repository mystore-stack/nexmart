// src/app/api/admin/cms/homepage-sections/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";
import { revalidatePath } from "next/cache";
import { normalizeToCanonicalKey, getCanonicalSection, normalizeSectionType } from "@/lib/homepage/canonical-contract";

const sectionSchema = z.object({
  sectionKey: z.string().min(2),
  sectionType: z.string().optional(),
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
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid().optional(),
    sectionKey: z.string().optional(),
    displayOrder: z.number().int().min(0),
  })).min(1),
}).refine(data => data.items.every(item => item.id || item.sectionKey), {
  message: "Each item must have either id or sectionKey",
});

const DEFAULT_SECTIONS = [
  { sectionKey: "hero", title: "Hero", description: "Bannière principale et CTA", destinationUrl: "/" },
  { sectionKey: "categories", title: "Catégories", description: "Ordre, visibilité et images des catégories homepage", destinationUrl: "/categories" },
  { sectionKey: "flashSale", title: "Flash Sale", description: "Offres flash dans la section vente du jour", destinationUrl: "/deals", viewAllButton: "Voir tout" },
  { sectionKey: "bundleBuilder", title: "Bundle Builder", description: "Création de packs et réductions packagées", destinationUrl: "/bundles", viewAllButton: "Créer un bundle" },
  { sectionKey: "mysteryBoxes", title: "Mystery Boxes", description: "Boîtes mystère premium", destinationUrl: "/collections/mystery-boxes" },
  { sectionKey: "featuredProducts", title: "Produits en Vedette", description: "Sélection premium de produits mis en avant", destinationUrl: "/collections/featured", viewAllButton: "Voir tout" },
  { sectionKey: "recommended", title: "Recommended For You", description: "Produits personnalisés générés par l’IA", destinationUrl: "/collections/recommended", viewAllButton: "Voir tout" },
  { sectionKey: "bestSellers", title: "Best Sellers", description: "Produits les plus vendus", destinationUrl: "/collections/best-sellers", viewAllButton: "Voir tout" },
  { sectionKey: "brandCarousel", title: "Marques Partenaires", description: "Carousel des partenaires et marques premium", destinationUrl: "/brands" },
  { sectionKey: "testimonials", title: "Testimonials", description: "Avis clients et preuve sociale", destinationUrl: "/testimonials" },
  { sectionKey: "seasonalCollection", title: "Seasonal Collection", description: "Sélection saisonnière de produits premium", destinationUrl: "/collections/seasonal" },
  { sectionKey: "mobileAppBanner", title: "Promotion Mobile", description: "Encourager le téléchargement de l'app mobile", destinationUrl: "/app" },
  { sectionKey: "newsletter", title: "Newsletter", description: "Inscription à la newsletter premium", destinationUrl: "/newsletter" },
  { sectionKey: "footer", title: "Footer", description: "Contenu de pied de page", destinationUrl: "/" },
];

export async function GET() {
  try {
    await requireAdmin();
    let sections = await prisma.homePageSection.findMany({ orderBy: { displayOrder: "asc" } });

    if (sections.length === 0) {
      sections = await prisma.$transaction(
        DEFAULT_SECTIONS.map((section, index) =>
          prisma.homePageSection.create({
            data: {
              ...section,
              displayOrder: index + 1,
              order: index + 1,
              active: true,
            },
          })
        )
      );
    }

    const deduped = new Map<string, (typeof sections)[number]>();
    for (const section of sections) {
      const canonicalKey = normalizeToCanonicalKey(section.sectionKey);
      if (canonicalKey && !deduped.has(canonicalKey)) deduped.set(canonicalKey, section);
    }

    return ok(Array.from(deduped.values()).sort((a, b) => (a.displayOrder ?? a.order ?? 0) - (b.displayOrder ?? b.order ?? 0)));
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
    
    // Convert sectionKey to canonical sectionType for storage
    const canonicalSection = getCanonicalSection(data.sectionKey);
    const normalizedSectionType = normalizeSectionType(canonicalSection?.sectionType || data.sectionKey);
    
    const sectionData: any = {
      ...data,
      sectionType: data.sectionType || normalizedSectionType || data.sectionKey.toUpperCase(),
    };

    const section = await prisma.homePageSection.create({
      data: sectionData,
    });
    revalidatePath("/");
    revalidatePath("/admin/cms/homepage");
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
    
    // If sectionKey is being updated, also update sectionType
    if (updates.sectionKey) {
      const canonicalSection = getCanonicalSection(updates.sectionKey);
      const normalizedSectionType = normalizeSectionType(canonicalSection?.sectionType || updates.sectionKey);
      updates.sectionType = normalizedSectionType || updates.sectionKey.toUpperCase();
    }
    
    const section = await prisma.homePageSection.update({ where: { id }, data: updates });
    console.log("Updated section:", section);
    revalidatePath("/");
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
    const sectionKey = req.nextUrl.searchParams.get("sectionKey");
    
    if (!id && !sectionKey) throw new Error("Section ID or sectionKey is required");
    
    if (id) {
      await prisma.homePageSection.delete({ where: { id } });
    } else if (sectionKey) {
      await prisma.homePageSection.delete({ where: { sectionKey } });
    }
    
    revalidatePath("/");
    revalidatePath("/admin/cms/homepage");
    return ok({});
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = reorderSchema.parse(body);

    await prisma.$transaction(
      data.items.map((item: { id?: string; sectionKey?: string; displayOrder: number }) => {
        const where = item.id ? { id: item.id } : { sectionKey: item.sectionKey };
        return prisma.homePageSection.update({ 
          where, 
          data: { displayOrder: item.displayOrder } 
        });
      })
    );

    revalidatePath("/");
    revalidatePath("/admin/cms/homepage");
    return ok({});
  } catch (err) {
    return handleApiError(err);
  }
}

