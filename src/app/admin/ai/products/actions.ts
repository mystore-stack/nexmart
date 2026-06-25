"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import type { AIProductManagerBootstrap } from "@/types/ai-products";

export async function getAIProductManagerBootstrap(): Promise<AIProductManagerBootstrap> {
  const { organizationId } = await requireAdmin();
  const db = prisma as any;

  const [categories, products, generations] = await Promise.all([
    prisma.category.findMany({
      where: { organizationId },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, parentId: true },
    }),
    prisma.product.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 24,
      include: { category: { select: { id: true, name: true } } },
    }),
    db.aiProductGeneration.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }).catch(() => []),
  ]);

  return {
    categories,
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      published: product.published,
      category: product.category,
      images: product.images,
    })),
    generations,
  };
}
