import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-api";
import { aiProductBulkSchema } from "@/lib/ai-products/validation";
import { generateAIProduct, parseCsvProducts } from "@/lib/ai-products/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = aiProductBulkSchema.parse(await req.json());
    const categories = await prisma.category.findMany({
      where: { organizationId: session.organizationId },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, parentId: true },
    });

    const csvInputs = body.csv ? parseCsvProducts(body.csv) : [];
    const imageInputs = body.imageUrls.map((imageUrl, index) => ({
      productName: `Image product ${index + 1}`,
      imageUrls: [imageUrl],
    }));
    const inputs = [...csvInputs, ...imageInputs].slice(0, 50);
    const db = prisma as any;
    const generations = [];

    for (const input of inputs) {
      const output = await generateAIProduct(input, categories);
      const selectedCategory = categories.find((category) => category.name.toLowerCase() === output.category.toLowerCase()) || categories[0];
      generations.push(
        await db.aiProductGeneration.create({
          data: {
            organizationId: session.organizationId,
            createdById: session.userId,
            kind: "BULK_IMPORT",
            status: body.workflow === "AUTO_PUBLISH" ? "READY" : "REVIEW_REQUIRED",
            workflow: body.workflow,
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
        })
      );
    }

    return ok({ count: generations.length, generations }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
