import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

export async function getCatalogCategories() {
  const organizationId = await getDefaultOrganizationId();
  return prisma.category.findMany({
    where: { organizationId, parentId: null },
    include: {
      _count: { select: { products: { where: { organizationId, published: true } } } },
      children: {
        where: { organizationId },
        include: { _count: { select: { products: { where: { organizationId, published: true } } } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  const organizationId = await getDefaultOrganizationId();
  return prisma.category.findFirst({
    where: { organizationId, slug },
    include: {
      _count: { select: { products: { where: { organizationId, published: true } } } },
      children: {
        where: { organizationId },
        include: { _count: { select: { products: { where: { organizationId, published: true } } } } },
      },
    },
  });
}

export async function getCatalogMaxPrice() {
  const organizationId = await getDefaultOrganizationId();
  const agg = await prisma.product.aggregate({
    _max: { price: true },
    where: { organizationId, published: true },
  });
  return agg._max.price || 1000;
}

export async function getBrandsFromTags() {
  const organizationId = await getDefaultOrganizationId();
  const products = await prisma.product.findMany({
    where: { organizationId, published: true },
    select: { tags: true },
  });
  const counts = new Map<string, number>();
  for (const p of products) {
    for (const tag of p.tags) {
      const key = tag.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), count }))
    .sort((a, b) => b.count - a.count);
}
