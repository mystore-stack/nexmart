import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api-response";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    
    // Since we removed the draft/published system, all changes are immediate
    // This endpoint now just revalidates the homepage cache
    revalidatePath("/");

    return ok({ 
      success: true,
      message: "Homepage cache revalidated. All changes are now live."
    });
  } catch (err) {
    console.error("[PUBLISH] Error:", err);
    return handleApiError(err);
  }
}