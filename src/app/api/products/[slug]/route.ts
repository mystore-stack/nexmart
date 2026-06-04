import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { CACHE_KEYS, CACHE_TTL, getCache, setCache } from "@/lib/redis";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const organizationId = await getDefaultOrganizationId();
    const cacheKey = CACHE_KEYS.productSlug(slug);
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    const product = await prisma.product.findFirst({
      where: { slug, organizationId, published: true },
      include: {
        category: true,
        variants: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Produit introuvable" }, { status: 404 });
    }

    await setCache(cacheKey, product, CACHE_TTL.MEDIUM);
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
