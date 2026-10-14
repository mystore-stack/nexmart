// src/app/api/gift-finder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getSession } from "@/lib/auth-api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const giftFinderSchema = z.object({
  budget: z.string().optional(),
  style: z.string().optional(),
  who: z.string().optional(),
  occasion: z.string().optional(),
});

// Budget range mappings
const budgetRanges: Record<string, { min: number; max: number }> = {
  '<500': { min: 0, max: 500 },
  '500–1000': { min: 500, max: 1000 },
  '1000–2500': { min: 1000, max: 2500 },
  '2500+': { min: 2500, max: 999999 },
  '<200': { min: 0, max: 200 },
  '200-500': { min: 200, max: 500 },
  '500-1000': { min: 500, max: 1000 },
  '1000-2000': { min: 1000, max: 2000 },
  '>2000': { min: 2000, max: 999999 },
};

// Style/interest to category/tag mapping
const styleMapping: Record<string, string[]> = {
  'Tech': ['tech', 'electronics', 'smartphone', 'laptop', 'gadget'],
  'Maison': ['home', 'decoration', 'furniture', 'kitchen'],
  'Beauté': ['beauty', 'cosmetics', 'skincare', 'perfume'],
  'Mode': ['fashion', 'clothing', 'accessories', 'shoes'],
  'Sport': ['sport', 'fitness', 'outdoor', 'equipment'],
  'Premium': ['luxury', 'premium', 'high-end', 'designer'],
};

// Recipient to category/tag mapping
const recipientMapping: Record<string, string[]> = {
  'Partenaire': ['gift', 'romantic', 'jewelry', 'perfume'],
  'Famille': ['family', 'home', 'kitchen', 'decoration'],
  'Ami(e)': ['gift', 'fun', 'tech', 'accessories'],
  'Enfant': ['toys', 'kids', 'games', 'educational'],
  'Collègue': ['office', 'professional', 'accessories'],
  'Pour moi': ['self-care', 'treat', 'wellness'],
  'Autre': ['gift', 'general'],
};

// Occasion to category/tag mapping
const occasionMapping: Record<string, string[]> = {
  'Anniversaire': ['birthday', 'gift', 'celebration'],
  'Mariage': ['wedding', 'gift', 'home', 'kitchen'],
  'Fête des mères': ['mother', 'gift', 'beauty', 'home'],
  'Fête des pères': ['father', 'gift', 'tech', 'tools'],
  'Noël': ['christmas', 'gift', 'holiday'],
  'Naissance': ['baby', 'gift', 'toys', 'clothing'],
  'Saint-Valentin': ['valentine', 'romantic', 'gift', 'jewelry'],
  'Remerciement': ['gift', 'thank-you', 'appreciation'],
  'Cadeau surprise': ['gift', 'surprise', 'unique'],
  'Sans occasion': ['gift', 'general'],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { budget, style, who, occasion } = giftFinderSchema.parse(body);

    const session = await getSession();
    let organizationId;
    if (session) {
      const { getOrganizationIdForUser } = await import("@/lib/tenant");
      organizationId = await getOrganizationIdForUser({ userId: session.userId });
    } else {
      organizationId = await getDefaultOrganizationId();
    }

    // Build where clause based on filters
    const where: any = {
      organizationId,
      published: true,
      stock: { gt: 0 },
      OR: [
        { source: null },
        { source: { not: "DEMO" } }
      ],
    };

    // Apply budget filter
    if (budget && budgetRanges[budget]) {
      const { min, max } = budgetRanges[budget];
      where.price = { gte: min, lte: max };
    }

    // Collect all relevant tags from filters
    const relevantTags: string[] = [];

    if (style && styleMapping[style]) {
      relevantTags.push(...styleMapping[style]);
    }

    if (who && recipientMapping[who]) {
      relevantTags.push(...recipientMapping[who]);
    }

    if (occasion && occasionMapping[occasion]) {
      relevantTags.push(...occasionMapping[occasion]);
    }

    // Apply tag filter if we have relevant tags
    if (relevantTags.length > 0) {
      where.OR = relevantTags.map(tag => ({
        tags: { has: tag }
      }));
    }

    // Fetch products matching criteria
    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { rating: 'desc' },
        { soldCount: 'desc' },
        { discount: 'desc' },
      ],
      take: 12,
    });

    // Get related data
    const productIds = products.map(p => p.id);
    const productCategoryIds = products.map(p => p.categoryId).filter(Boolean);

    const [variants, categories] = await Promise.all([
      prisma.productVariant.findMany({
        where: { productId: { in: productIds } }
      }),
      prisma.category.findMany({
        where: { id: { in: productCategoryIds } }
      })
    ]);

    const variantsByProduct = new Map();
    variants.forEach(v => {
      if (!variantsByProduct.has(v.productId)) {
        variantsByProduct.set(v.productId, []);
      }
      variantsByProduct.get(v.productId).push(v);
    });

    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // Generate gift recommendations with reasons
    const items = products.map(product => {
      const reasons: string[] = [];

      if (budget && budgetRanges[budget]) {
        const { min, max } = budgetRanges[budget];
        if (product.price >= min && product.price <= max) {
          reasons.push(`Dans votre budget (${product.price} MAD)`);
        }
      }

      if (product.rating >= 4) {
        reasons.push(`Très bien noté (${product.rating}/5)`);
      }

      if (product.discount > 0) {
        reasons.push(`Promotion de -${product.discount}%`);
      }

      if (product.soldCount > 10) {
        reasons.push(`Populaire (${product.soldCount} ventes)`);
      }

      // Generate a reason based on filters
      if (style && styleMapping[style]) {
        reasons.push(`Correspond à votre style: ${style}`);
      }

      if (who && recipientMapping[who]) {
        reasons.push(`Idéal pour: ${who}`);
      }

      if (occasion && occasionMapping[occasion]) {
        reasons.push(`Parfait pour: ${occasion}`);
      }

      return {
        product: {
          ...product,
          category: product.categoryId ? categoryMap.get(product.categoryId) : null,
          variants: variantsByProduct.get(product.id) || []
        },
        reason: reasons.length > 0 ? reasons.join('. ') : 'Excellent choix de cadeau',
      };
    });

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
    });
  } catch (error) {
    console.error("[GIFT FINDER API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
