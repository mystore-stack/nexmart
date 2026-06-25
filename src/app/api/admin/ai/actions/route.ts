import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { invalidateAllCMSCache } from "@/lib/cms/cache";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { getHealthSnapshot } from "@/lib/admin-ai/health";
import { runCmsAudit, runProjectAudit } from "@/lib/admin-ai/audit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  action: z.enum(["revalidate", "clear-cache", "run-audit", "run-health", "validate-cms"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAiEngineerAccess();
    const { action } = bodySchema.parse(await req.json());

    if (action === "revalidate") {
      await revalidateSiteContent(session.organizationId);
      return NextResponse.json({ success: true, message: "Website revalidated." });
    }

    if (action === "clear-cache") {
      await invalidateAllCMSCache(session.organizationId);
      return NextResponse.json({ success: true, message: "CMS cache cleared." });
    }

    if (action === "run-health") {
      const health = await getHealthSnapshot(session.organizationId);
      return NextResponse.json({ success: true, message: "Health check complete.", health });
    }

    if (action === "validate-cms") {
      const cms = await runCmsAudit(session.organizationId);
      return NextResponse.json({ success: true, message: "CMS validation complete.", cms });
    }

    const project = await runProjectAudit();
    return NextResponse.json({ success: true, message: "Project audit complete.", project });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
