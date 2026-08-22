import { NextResponse } from "next/server";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { getHealthSnapshot } from "@/lib/admin-ai/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAiEngineerAccess();
    const health = await getHealthSnapshot(session.organizationId);
    return NextResponse.json({ success: true, health });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
