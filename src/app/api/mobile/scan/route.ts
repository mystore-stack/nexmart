import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = (body?.code || "").trim();

    if (!rawCode) {
      return NextResponse.json({ success: false, message: "Code requis" }, { status: 400 });
    }

    // 1. Try match by SKU (exact)
    let product = await prisma.product.findFirst({
      where: { sku: { equals: rawCode, mode: "insensitive" } },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        comparePrice: true,
        images: true,
        stock: true,
        rating: true,
        reviewCount: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
    });

    // 2. If not found and code is a URL, extract slug (e.g. https://.../products/mon-produit)
    if (!product && (rawCode.startsWith("http://") || rawCode.startsWith("https://") || rawCode.includes("/products/"))) {
      const match = rawCode.match(/\/products\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        product = await prisma.product.findFirst({
          where: { slug: match[1] },
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            price: true,
            comparePrice: true,
            images: true,
            stock: true,
            rating: true,
            reviewCount: true,
            category: { select: { name: true } },
            brand: { select: { name: true } },
          },
        });
      }
    }

    // 3. Try match by UUID id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawCode);
    if (!product && isUuid) {
      product = await prisma.product.findUnique({
        where: { id: rawCode },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          comparePrice: true,
          images: true,
          stock: true,
          rating: true,
          reviewCount: true,
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
      });
    }

    // 4. Try match by exact slug
    if (!product) {
      product = await prisma.product.findFirst({
        where: { slug: rawCode },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          comparePrice: true,
          images: true,
          stock: true,
          rating: true,
          reviewCount: true,
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
      });
    }

    if (!product) {
      return NextResponse.json({
        success: false,
        found: false,
        code: rawCode,
        message: `Aucun produit correspondant au code "${rawCode}" n'a été trouvé.`,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      product,
    });
  } catch (err: any) {
    console.error("[api/mobile/scan] Error:", err);
    return NextResponse.json({ success: false, message: "Erreur lors de la recherche" }, { status: 500 });
  }
}
