import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, notFound, handleApiError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-api";
import { invalidateProductCache } from "@/lib/redis";
import { rollbackRevisionSchema } from "@/lib/ai-products/validation";
import { productSnapshot } from "@/lib/ai-products/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const params = await context.params;
    const body = rollbackRevisionSchema.parse(await req.json().catch(() => ({})));
    const db = prisma as any;

    const revision = await db.productRevision.findFirst({
      where: { id: params.id, organizationId: session.organizationId },
    });
    if (!revision) return notFound("Revision not found");

    const product = await prisma.product.findFirst({
      where: { id: revision.productId, organizationId: session.organizationId },
    });
    if (!product) return notFound("Product not found");

    const latest = await db.productRevision.aggregate({
      where: { productId: product.id },
      _max: { version: true },
    });

    await db.productRevision.create({
      data: {
        organizationId: session.organizationId,
        productId: product.id,
        createdById: session.userId,
        source: "ROLLBACK",
        version: (latest._max.version || 0) + 1,
        title: `Before rollback: ${product.name}`,
        snapshot: productSnapshot(product),
        note: body.note || `Rollback initiated from revision ${revision.version}.`,
      },
    });

    const snapshot = revision.snapshot;
    const restored = await prisma.product.update({
      where: { id: product.id, organizationId: session.organizationId },
      data: {
        name: snapshot.name,
        slug: snapshot.slug,
        description: snapshot.description,
        price: snapshot.price,
        comparePrice: snapshot.comparePrice ?? null,
        cost: snapshot.cost ?? null,
        categoryId: snapshot.categoryId,
        images: snapshot.images || [],
        tags: snapshot.tags || [],
        sku: snapshot.sku,
        stock: snapshot.stock,
        lowStockAt: snapshot.lowStockAt,
        weight: snapshot.weight ?? null,
        published: snapshot.published,
        featured: snapshot.featured,
      },
      include: { category: true },
    });

    await db.productPublishingHistory.create({
      data: {
        organizationId: session.organizationId,
        productId: product.id,
        generationId: revision.generationId,
        actorId: session.userId,
        workflow: restored.published ? "AUTO_PUBLISH" : "DRAFT",
        action: "ROLLED_BACK",
        fromStatus: product.published ? "published" : "draft",
        toStatus: restored.published ? "published" : "draft",
        metadata: { revisionId: revision.id, note: body.note },
      },
    });

    await invalidateProductCache(product.id);
    return ok({ product: restored });
  } catch (error) {
    return handleApiError(error);
  }
}
