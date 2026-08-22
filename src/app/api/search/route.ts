// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getCache, setCache } from "@/lib/redis";
import { z } from "zod";

export const dynamic = "force-dynamic";

const searchSchema = z.object({
  q: z.string().trim().default(""),
  limit: z.coerce.number().int().min(1).max(48).default(10),
});

export async function GET(req: NextRequest) {
  try {
    const { q, limit } = searchSchema.parse(Object.fromEntries(req.nextUrl.searchParams));

    if (q.length < 2) {
      return NextResponse.json({
        success: true,
        data: { products: [], categories: [], suggestions: [], total: 0 },
        products: [],
        categories: [],
        suggestions: [],
        total: 0,
      });
    }
    const organizationId = await getDefaultOrganizationId();
    const cacheKey = `search:v2:${organizationId}:${q.toLowerCase()}:${limit}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) return NextResponse.json({ success: true, cached: true, ...cached });

    const [products, categories, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          organizationId,
          published: true,
          OR: [
            { name:        { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags:        { has: q.toLowerCase() } },
          ],
        },
        include: { category: true, variants: true },
        take: limit,
        orderBy: { soldCount: "desc" },
      }),
      prisma.category.findMany({
        where: { organizationId, name: { contains: q, mode: "insensitive" } },
        take: 4,
        select: { id: true, name: true, slug: true, image: true },
      }),
      prisma.product.count({
        where: {
          organizationId,
          published: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags: { has: q.toLowerCase() } },
          ],
        },
      }),
    ]);

    // Add product counts to categories manually
    const categoryIds = categories.map(c => c.id);
    const productCounts = await prisma.product.groupBy({
      by: ['categoryId'],
      where: { 
        organizationId, 
        published: true,
        categoryId: { in: categoryIds }
      },
      _count: { categoryId: true }
    });

    const countMap = new Map(productCounts.map(pc => [pc.categoryId, pc._count.categoryId]));
    const categoriesWithCounts = categories.map(category => ({
      ...category,
      _count: {
        products: countMap.get(category.id) || 0
      }
    }));

    const suggestions = [
      ...products.slice(0, 5).map((product) => product.name),
      ...categoriesWithCounts.slice(0, 3).map((category) => category.name),
    ];
    const payload = {
      data: { products, categories: categoriesWithCounts, suggestions, total },
      products,
      categories: categoriesWithCounts,
      suggestions,
      total,
    };
    await setCache(cacheKey, payload, 120);
    return NextResponse.json({ success: true, ...payload });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur recherche" }, { status: 500 });
  }
}
