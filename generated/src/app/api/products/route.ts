// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit    = Math.min(48, parseInt(searchParams.get("limit") || "24"));
    const category = searchParams.get("category");
    const sort     = searchParams.get("sort") || "popular";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");
    const search   = searchParams.get("q");
    const featured = searchParams.get("featured") === "true";

    const where: any = {
      published: true,
      price: { gte: minPrice, lte: maxPrice },
      ...(category && { category: { slug: category } }),
      ...(featured && { featured: true }),
      ...(search && {
        OR: [
          { name:        { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags:        { has: search } },
        ],
      }),
    };

    const orderBy: any =
      sort === "price_asc"  ? { price: "asc" }      :
      sort === "price_desc" ? { price: "desc" }     :
      sort === "newest"     ? { createdAt: "desc" }  :
      sort === "rating"     ? { rating: "desc" }     :
      [{ soldCount: "desc" }, { rating: "desc" }];

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
