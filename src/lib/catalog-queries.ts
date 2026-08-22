import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { Category } from "@prisma/client";

type CategoryWithCount = Category & {
  _count: {
    products: number;
  };
  children: CategoryWithCount[];
};

export async function getCatalogCategories(): Promise<CategoryWithCount[]> {
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
      source: { not: "DEMO" },
      categoryId: { in: categoryIds }
    },
    _count: { categoryId: true }
  });

  const countMap = new Map(productCounts.map(pc => [pc.categoryId, pc._count.categoryId]));

  // Build category hierarchy with counts
  return parentCategories.map(parent => {
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
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithCount | null> {
  const organizationId = await getDefaultOrganizationId();
  
  // Get the category
  const category = await prisma.category.findFirst({
    where: { organizationId, slug },
  });

  if (!category) return null;

  // Get all child categories
  const childCategories = await prisma.category.findMany({
    where: { organizationId, parentId: category.id },
  });

  // Count products for this category and its children
  const allCategoryIds = [category.id, ...childCategories.map(c => c.id)];

  const productCounts = await prisma.product.groupBy({
    by: ['categoryId'],
    where: { 
      organizationId, 
      published: true, 
      source: { not: "DEMO" },
      categoryId: { in: allCategoryIds }
    },
    _count: { categoryId: true }
  });

  const countMap = new Map(productCounts.map(pc => [pc.categoryId, pc._count.categoryId]));

  return {
    ...category,
    _count: {
      products: countMap.get(category.id) || 0
    },
    children: childCategories.map(child => ({
      ...child,
      _count: {
        products: countMap.get(child.id) || 0
      }
    }))
  };
}

export async function getCatalogMaxPrice() {
  const organizationId = await getDefaultOrganizationId();
  const agg = await prisma.product.aggregate({
    _max: { price: true },
    where: { organizationId, published: true, source: { not: "DEMO" } },
  });
  return agg._max.price || 1000;
}

export async function getBrandsFromTags() {
  const organizationId = await getDefaultOrganizationId();
  const products = await prisma.product.findMany({
    where: { organizationId, published: true, source: { not: "DEMO" } },
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
