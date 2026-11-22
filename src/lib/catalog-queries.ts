import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { Category } from "@prisma/client";

type CategoryWithCount = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  createdAt: Date;
  pageConfig: any;
  order: number;
  _count: {
    products: number;
  };
  children: CategoryWithCount[];
};

export async function getCatalogCategories(): Promise<CategoryWithCount[]> {
  const organizationId = await getDefaultOrganizationId();
  
  // Get all categories (both parent and child) with pageConfig
  const allCategories = await prisma.category.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      organizationId: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      parentId: true,
      createdAt: true,
      pageConfig: true,
      order: true,
    },
  });

  // Filter categories: only show those with status PUBLISHED
  // Note: showOnHomepage filter is ONLY for homepage, not for public categories page
  const publishedCategories = allCategories.filter((cat: any) => {
    const cfg = cat.pageConfig || {};
    const status = cfg.status || "PUBLISHED";
    return status === "PUBLISHED";
  });

  // Separate parent and child categories
  const parentCategories = publishedCategories.filter(c => c.parentId === null);
  const childCategories = publishedCategories.filter(c => c.parentId !== null);

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
      .map(child => {
        const childCfg = child.pageConfig || {};
        return {
          ...child,
          icon: childCfg.icon || null,
          bannerImage: childCfg.bannerImage || null,
          _count: {
            products: countMap.get(child.id) || 0
          }
        };
      });

    const cfg = parent.pageConfig || {};
    return {
      ...parent,
      icon: cfg.icon || null,
      bannerImage: cfg.bannerImage || null,
      _count: {
        products: countMap.get(parent.id) || 0
      },
      children
    };
  });
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithCount | null> {
  const organizationId = await getDefaultOrganizationId();
  const decodedSlug = decodeURIComponent(slug);
  
  // 1. Try exact match first
  let category = await prisma.category.findFirst({
    where: { 
      organizationId, 
      OR: [
        { slug: slug },
        { slug: decodedSlug },
      ]
    },
  });

  // 2. Fallback: Try normalized slug or name match if exact match fails
  if (!category) {
    const allCats = await prisma.category.findMany({
      where: { organizationId },
    });

    const targetNorm = decodedSlug.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    category = allCats.find((c) => {
      const cSlugNorm = c.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cNameNorm = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return (
        cSlugNorm === targetNorm ||
        cNameNorm === targetNorm ||
        cSlugNorm.includes(targetNorm) ||
        targetNorm.includes(cSlugNorm) ||
        cNameNorm.includes(targetNorm) ||
        targetNorm.includes(cNameNorm)
      );
    }) || null;

    // 3. Fallback to first available category if still null
    if (!category && allCats.length > 0) {
      category = allCats[0];
    }
  }

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
