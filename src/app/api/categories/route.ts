// src/app/api/categories/route.ts
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { ok, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCache(CACHE_KEYS.categories());
    if (cached) return ok(cached);

    const organizationId = await getDefaultOrganizationId();
    const categories = await prisma.category.findMany({
      where: { organizationId, parentId: null },
      include: {
        _count: { select: { products: { where: { organizationId, published: true } } } },
        children: {
          where: { organizationId },
          include: { _count: { select: { products: { where: { organizationId } } } } },
        },
      },
      orderBy: { name: "asc" },
    });

    await setCache(CACHE_KEYS.categories(), categories, CACHE_TTL.LONG);
    return ok(categories);
  } catch (err) {
    return handleApiError(err);
  }
}
