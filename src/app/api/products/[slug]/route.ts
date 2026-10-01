import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { CACHE_KEYS, CACHE_TTL, getCache, setCache } from "@/lib/redis";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    let organizationId: string;
    
    try {
      organizationId = await getDefaultOrganizationId();
    } catch (orgError) {
      console.error("[PRODUCT DETAIL API] Failed to get organization ID:", orgError);
      return NextResponse.json(
        { success: false, error: "Configuration organisation requise", code: "ORGANIZATION_CONFIG_ERROR" },
        { status: 500 }
      );
    }
    
    const cacheKey = CACHE_KEYS.productSlug(slug);
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    const lookup: Array<{ slug?: string; id?: string }> = [{ slug }];
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
      lookup.push({ id: slug });
    }

    const product = await prisma.product.findFirst({
      where: { organizationId, published: true, OR: lookup },
      include: {
        category: true,
        variants: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Produit introuvable" }, { status: 404 });
    }

    const responseProduct = {
      ...product,
    };

    await setCache(cacheKey, responseProduct, CACHE_TTL.MEDIUM);
    return NextResponse.json({ success: true, data: responseProduct });
  } catch (error) {
    console.error("[PRODUCT DETAIL API] Error:", error);
    
    // Handle organization access errors specifically
    if (error instanceof Error && error.message.includes("has no organization access")) {
      return NextResponse.json(
        { success: false, error: "Accès organisation requis", code: "NO_ORGANIZATION_ACCESS" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
}
