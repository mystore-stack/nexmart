import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-api";
import { rateLimit } from "@/lib/api";
import { aiProductInputSchema } from "@/lib/ai-products/validation";
import { generateAIProduct } from "@/lib/ai-products/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { organizationId } = await requireAdmin();
    const db = prisma as any;

    const [generations, products, categories] = await Promise.all([
      db.aiProductGeneration.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
      prisma.product.findMany({
        where: { organizationId },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.category.findMany({
        where: { organizationId },
        orderBy: [{ parentId: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true, parentId: true },
      }),
    ]);

    return ok({ generations, products, categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const rl = await rateLimit(`admin:ai-products:${session.userId}`, 30, 60 * 60 * 1000);
    if (!rl.success) throw new Error("AI product generation rate limit reached.");

    const input = aiProductInputSchema.parse(await req.json());
    const categories = await prisma.category.findMany({
      where: { organizationId: session.organizationId },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, parentId: true },
    });

    const output = await generateAIProduct(input, categories);
    const selectedCategory = categories.find((category) => category.name.toLowerCase() === output.category.toLowerCase()) || categories[0];
    const db = prisma as any;

    const generation = await db.aiProductGeneration.create({
      data: {
        organizationId: session.organizationId,
        createdById: session.userId,
        kind: "CREATE",
        status: "READY",
        workflow: "REVIEW_REQUIRED",
        input,
        output,
        imageAnalysis: output.imageAnalysis,
        translations: output.translations,
        seo: output.seo,
        qualityScore: output.qualityScore.overall,
        qualityBreakdown: output.qualityScore,
        suggestions: output.suggestions,
        selectedCategoryId: selectedCategory?.id,
        selectedBrand: output.brand,
        productType: output.productType,
      },
    });

    return ok(generation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
