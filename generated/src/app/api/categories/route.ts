// src/app/api/categories/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { ok, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const cached = await getCache(CACHE_KEYS.categories());
    if (cached) return ok(cached);

    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: { select: { products: { where: { published: true } } } },
        children: { include: { _count: { select: { products: true } } } },
      },
      orderBy: { name: "asc" },
    });

    await setCache(CACHE_KEYS.categories(), categories, CACHE_TTL.LONG);
    return ok(categories);
  } catch (err) {
    return handleApiError(err);
  }
}
