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
    
    // Get all categories (both parent and child)
    const allCategories = await prisma.category.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });

    // Separate parent and child categories
    const parentCategories = allCategories.filter(c => c.parentId === null);
    const childCategories = allCategories.filter(c => c.parentId !== null);

    // Count products for all categories
    const categoryIds = allCategories.map(c => c.id);

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

    // Build category hierarchy with counts
    const categories = parentCategories.map(parent => {
      const children = childCategories
        .filter(child => child.parentId === parent.id)
        .map(child => ({
          ...child,
          _count: {
            products: countMap.get(child.id) || 0
          }
        }));

      return {
        ...parent,
        _count: {
          products: countMap.get(parent.id) || 0
        },
        children
      };
    });

    await setCache(CACHE_KEYS.categories(), categories, CACHE_TTL.LONG);
    return ok(categories);
  } catch (err) {
    return handleApiError(err);
  }
}
