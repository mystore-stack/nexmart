import { NextResponse } from "next/server";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { runCmsAudit } from "@/lib/admin-ai/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAiEngineerAccess();
    const cms = await runCmsAudit(session.organizationId);
    return NextResponse.json({ success: true, cms });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
