import { NextResponse } from "next/server";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { runCmsAudit, runProjectAudit } from "@/lib/admin-ai/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAiEngineerAccess();
    const [project, cms] = await Promise.all([
      runProjectAudit(),
      runCmsAudit(session.organizationId),
    ]);
    return NextResponse.json({ success: true, project, cms });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
