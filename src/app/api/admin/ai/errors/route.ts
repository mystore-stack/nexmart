import { NextResponse } from "next/server";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { getErrorIssues } from "@/lib/admin-ai/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAiEngineerAccess();
    const issues = await getErrorIssues(session.organizationId);
    return NextResponse.json({ success: true, issues });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
