import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, notFound, handleApiError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-api";
import { invalidateProductCache } from "@/lib/redis";
import { aiProductPublishSchema } from "@/lib/ai-products/validation";
import {
  buildProductDescription,
  ensureUniqueProductSlug,
  ensureUniqueSku,
  productSnapshot,
} from "@/lib/ai-products/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = aiProductPublishSchema.parse(await req.json());
    const db = prisma as any;

    const generation = await db.aiProductGeneration.findFirst({
      where: { id: body.generationId, organizationId: session.organizationId },
    });
    if (!generation) return notFound("AI generation not found");

    const category = await prisma.category.findFirst({
      where: { id: body.categoryId, organizationId: session.organizationId },
      select: { id: true },
    });
    if (!category) return notFound("Category not found");

    const output = generation.output;
    const description = body.description || buildProductDescription(output);
    const published = body.workflow === "AUTO_PUBLISH";
    const slug = await ensureUniqueProductSlug(prisma, session.organizationId, body.title, body.productId);
    const sku = await ensureUniqueSku(prisma, session.organizationId, body.sku, body.productId);
    const action = body.workflow === "AUTO_PUBLISH"
      ? "AUTO_PUBLISHED"
      : body.workflow === "REVIEW_REQUIRED"
        ? "REVIEW_REQUESTED"
        : "DRAFT_CREATED";

    const productData = {
      name: body.title,
      slug,
      description,
      price: body.price,
      comparePrice: body.comparePrice ?? null,
      cost: body.cost ?? null,
      categoryId: body.categoryId,
      images: body.images,
      tags: body.tags,
      sku,
      stock: body.stock,
      lowStockAt: body.lowStockAt,
      weight: body.weight ?? null,
      published,
      featured: body.featured,
    };

    let product;
    let fromStatus: string | null = null;

    if (body.productId) {
      const existing = await prisma.product.findFirst({
        where: { id: body.productId, organizationId: session.organizationId },
      });
      if (!existing) return notFound("Product not found");
      fromStatus = existing.published ? "published" : "draft";

      const latest = await db.productRevision.aggregate({
        where: { productId: existing.id },
        _max: { version: true },
      });

      await db.productRevision.create({
        data: {
          organizationId: session.organizationId,
          productId: existing.id,
          generationId: generation.id,
          createdById: session.userId,
          version: (latest._max.version || 0) + 1,
          title: `Before AI publish: ${existing.name}`,
          snapshot: productSnapshot(existing),
          note: body.revisionNote || "Snapshot before AI product manager update.",
        },
      });

      product = await prisma.product.update({
        where: { id: existing.id, organizationId: session.organizationId },
        data: productData,
        include: { category: true },
      });
    } else {
      product = await prisma.product.create({
        data: {
          ...productData,
          organizationId: session.organizationId,
        },
        include: { category: true },
      });
    }

    const latestAfter = await db.productRevision.aggregate({
      where: { productId: product.id },
      _max: { version: true },
    });

    await db.productRevision.create({
      data: {
        organizationId: session.organizationId,
        productId: product.id,
        generationId: generation.id,
        createdById: session.userId,
        version: (latestAfter._max.version || 0) + 1,
        title: `AI version: ${product.name}`,
        snapshot: productSnapshot(product),
        note: body.revisionNote || "AI product manager published version.",
      },
    });

    await db.productPublishingHistory.create({
      data: {
        organizationId: session.organizationId,
        productId: product.id,
        generationId: generation.id,
        actorId: session.userId,
        workflow: body.workflow,
        action,
        fromStatus,
        toStatus: product.published ? "published" : "draft",
        metadata: {
          qualityScore: generation.qualityScore,
          seo: generation.seo,
          safety: "No automatic deletion. Revision history captured.",
        },
      },
    });

    await db.aiProductGeneration.update({
      where: { id: generation.id },
      data: {
        productId: product.id,
        status: published ? "PUBLISHED" : body.workflow,
        workflow: body.workflow,
        selectedCategoryId: body.categoryId,
        publishedAt: published ? new Date() : null,
        revisionNote: body.revisionNote,
      },
    });

    await invalidateProductCache(product.id);
    return ok({ product, action });
  } catch (error) {
    return handleApiError(error);
  }
}
