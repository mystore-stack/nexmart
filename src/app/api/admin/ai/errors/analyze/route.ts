import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { analyzeErrorIssue } from "@/lib/admin-ai/errors";

export const dynamic = "force-dynamic";

const issueSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  source: z.enum(["logs", "vercel", "api", "database", "build"]),
  stack: z.string().optional(),
  count: z.number(),
  firstSeen: z.string(),
  lastSeen: z.string(),
  affectedFiles: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    await requireAiEngineerAccess();
    const issue = issueSchema.parse(await req.json());
    const analysis = await analyzeErrorIssue(issue);
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
