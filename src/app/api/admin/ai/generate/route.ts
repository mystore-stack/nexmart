import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { generateCodePlan } from "@/lib/admin-ai/engineer";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  prompt: z.string().min(4).max(4000),
});

export async function POST(req: NextRequest) {
  try {
    await requireAiEngineerAccess();
    const { prompt } = bodySchema.parse(await req.json());
    const result = await generateCodePlan(prompt);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
