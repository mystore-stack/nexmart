import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-api";
import { aiImageAnalysisSchema } from "@/lib/ai-products/validation";
import { analyzeProductImages } from "@/lib/ai-products/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = aiImageAnalysisSchema.parse(await req.json());
    const imageAnalysis = await analyzeProductImages(body.imageUrls, body.productName);
    return ok({ imageAnalysis });
  } catch (error) {
    return handleApiError(error);
  }
}
