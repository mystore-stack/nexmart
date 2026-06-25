import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { createEmbedding, cosineSimilarity } from "./gemini";
import type { Prisma } from "@prisma/client";

export function productSearchText(product: {
  name: string;
  description: string;
  sku: string;
  price: number;
  tags: string[];
  category?: { name: string } | null;
}) {
  return [
    product.name,
    product.category?.name,
    product.description,
    `SKU ${product.sku}`,
    `Price ${product.price} MAD`,
    product.tags.join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

export async function upsertProductEmbedding(productId: string, organizationId?: string) {
  const orgId = organizationId || (await getDefaultOrganizationId());
  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId: orgId },
    include: { category: true },
  });
  if (!product) return null;

  const searchableText = productSearchText(product);
  const contentHash = await sha256(searchableText);

  const existing = await prisma.aiProductEmbedding.findUnique({
    where: { productId },
    select: { id: true, contentHash: true },
  });
  if (existing?.contentHash === contentHash) return existing;

  const embedding = await createEmbedding(searchableText);
  return prisma.aiProductEmbedding.upsert({
    where: { productId },
    update: {
      model: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
      contentHash,
      searchableText,
      embedding: embedding as Prisma.InputJsonValue,
    },
    create: {
      organizationId: orgId,
      productId,
      model: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
      contentHash,
      searchableText,
      embedding: embedding as Prisma.InputJsonValue,
    } as any,
  });
}

export async function semanticProductSearch(query: string, limit = 12, organizationId?: string) {
  const orgId = organizationId || (await getDefaultOrganizationId());
  const embeddings = await prisma.aiProductEmbedding.findMany({
    where: { organizationId: orgId, Product: { published: true } },
    include: {
      Product: {
        include: { category: true, variants: true },
      },
    },
    take: 500,
  });
  if (embeddings.length === 0) return [];

  const queryEmbedding = await createEmbedding(query);

  return embeddings
    .map((entry) => ({
      ...entry.Product,
      _semanticScore: cosineSimilarity(
        queryEmbedding,
        Array.isArray(entry.embedding) ? (entry.embedding as number[]) : []
      ),
    }))
    .sort((a, b) => b._semanticScore - a._semanticScore)
    .slice(0, limit);
}

export async function recommendationCandidates(options: {
  organizationId: string;
  userId?: string;
  productId?: string;
  limit?: number;
}) {
  const limit = options.limit || 12;
  const behaviorScores = new Map<string, number>();

  if (options.userId) {
    const events = await prisma.aiEvent.findMany({
      where: { organizationId: options.organizationId, userId: options.userId, productId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    for (const event of events) {
      const weight =
        event.type === "PURCHASE" ? 8 :
        event.type === "ADD_TO_CART" ? 5 :
        event.type === "WISHLIST" ? 4 :
        event.type === "VIEW" ? 2 : 1;
      behaviorScores.set(event.productId!, (behaviorScores.get(event.productId!) || 0) + weight);
    }
  }

  const source = options.productId
    ? await prisma.product.findFirst({
        where: { id: options.productId, organizationId: options.organizationId },
        select: { id: true, categoryId: true, price: true, tags: true },
      })
    : null;

  const products = await prisma.product.findMany({
    where: {
      organizationId: options.organizationId,
      published: true,
      ...(source
        ? {
            id: { not: source.id },
            OR: [{ categoryId: source.categoryId }, { tags: { hasSome: source.tags } }],
          }
        : {}),
    },
    include: { category: true, variants: true },
    orderBy: [{ featured: "desc" }, { soldCount: "desc" }, { rating: "desc" }],
    take: Math.max(limit * 4, 24),
  });

  return products
    .map((product) => {
      const behavior = behaviorScores.get(product.id) || 0;
      const similarity = source
        ? (product.categoryId === source.categoryId ? 20 : 0) +
          product.tags.filter((tag) => source.tags.includes(tag)).length * 5
        : 0;
      const commerce = product.rating * 3 + Math.min(product.soldCount / 10, 20) + (product.featured ? 8 : 0);
      return { ...product, _aiScore: behavior + similarity + commerce };
    })
    .sort((a, b) => b._aiScore - a._aiScore)
    .slice(0, limit);
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
