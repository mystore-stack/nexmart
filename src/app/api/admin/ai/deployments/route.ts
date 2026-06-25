import { NextResponse } from "next/server";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { getDeployments } from "@/lib/admin-ai/deployments";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAiEngineerAccess();
    const deployments = await getDeployments();
    return NextResponse.json({ success: true, deployments });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
