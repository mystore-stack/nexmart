import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, notFound, handleApiError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-api";
import { aiProductOptimizeSchema } from "@/lib/ai-products/validation";
import { generateAIProduct, productSnapshot } from "@/lib/ai-products/service";

export const dynamic = "force-dynamic";

function isMissingProductRevisionTable(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2021"
  );
}

async function createProductRevisionSnapshot({
  db,
  organizationId,
  product,
  userId,
  title,
  note,
}: {
  db: any;
  organizationId: string;
  product: any;
  userId: string;
  title: string;
  note: string;
}) {
  try {
    const latest = await db.productRevision.aggregate({
      where: { productId: product.id },
      _max: { version: true },
    });

    await db.productRevision.create({
      data: {
        organizationId,
        productId: product.id,
        createdById: userId,
        version: (latest._max.version || 0) + 1,
        title,
        snapshot: productSnapshot(product),
        note,
      },
    });
  } catch (error) {
    if (isMissingProductRevisionTable(error)) {
      console.warn(
        "[AI Products] ProductRevision table is missing; skipping revision snapshot. Run `npx prisma db push` or migrations to enable revision history."
      );
      return;
    }

    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = aiProductOptimizeSchema.parse(await req.json());
    const product = await prisma.product.findFirst({
      where: { id: body.productId, organizationId: session.organizationId },
      include: { category: true },
    });
    if (!product) return notFound("Product not found");

    const categories = await prisma.category.findMany({
      where: { organizationId: session.organizationId },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, parentId: true },
    });

    const output = await generateAIProduct(
      {
        productName: product.name,
        supplierInfo: [
          `Existing product description: ${product.description}`,
          `Current category: ${product.category?.name}`,
          `Current tags: ${(product.tags || []).join(", ")}`,
          `Requested edit: ${body.instruction}`,
          body.notes ? `Admin notes: ${body.notes}` : "",
        ].filter(Boolean).join("\n"),
        imageUrls: product.images,
        tone: body.instruction === "seo" ? "technical" : "conversion",
      },
      categories
    );

    const db = prisma as any;
    await createProductRevisionSnapshot({
      db,
      organizationId: session.organizationId,
      product,
      userId: session.userId,
      title: `Before AI ${body.instruction}`,
      note: body.notes || "Snapshot before AI optimization.",
    });

    const generation = await db.aiProductGeneration.create({
      data: {
        organizationId: session.organizationId,
        productId: product.id,
        createdById: session.userId,
        kind: "OPTIMIZE_EXISTING",
        status: "READY",
        workflow: "REVIEW_REQUIRED",
        input: body,
        output,
        imageAnalysis: output.imageAnalysis,
        translations: output.translations,
        seo: output.seo,
        qualityScore: output.qualityScore.overall,
        qualityBreakdown: output.qualityScore,
        suggestions: output.suggestions,
        selectedCategoryId: product.categoryId,
        selectedBrand: output.brand,
        productType: output.productType,
      },
    });

    return ok(generation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
