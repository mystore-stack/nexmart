import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminFromRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/api";
import { CONTENT_GENERATION_PROMPT } from "@/lib/ai/prompts";
import { createJson, moderateText } from "@/lib/ai/openai";
import type { AiGeneratedContent } from "@/lib/ai/types";
import { assertAiRequestAllowed } from "@/lib/ai/security";

export const dynamic = "force-dynamic";

const schema = z.object({
  type: z.enum(["product_description", "seo_metadata", "blog", "alt_text", "category_description", "email", "push"]),
  language: z.enum(["fr", "ar", "en", "darija"]).default("fr"),
  tone: z.enum(["premium", "friendly", "technical", "urgent"]).default("premium"),
  product: z
    .object({
      name: z.string().optional(),
      category: z.string().optional(),
      price: z.number().optional(),
      tags: z.array(z.string()).optional(),
      description: z.string().optional(),
    })
    .optional(),
  brief: z.string().min(3).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    assertAiRequestAllowed(req);
    const user = await requireAdminFromRequest(req);
    const rl = await rateLimit(`ai:content:${user.userId}`, 40, 60 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Limite de génération IA atteinte." }, { status: 429 });
    }

    const body = schema.parse(await req.json());
    const moderation = await moderateText(body.brief);
    if (moderation.flagged) {
      return NextResponse.json({ success: false, error: "Brief refusé par la modération IA." }, { status: 400 });
    }

    const fallback: AiGeneratedContent = {
      description: body.brief,
      seoTitle: body.product?.name?.slice(0, 60),
      seoDescription: body.brief.slice(0, 155),
      tags: body.product?.tags || [],
      keyFeatures: [],
    };

    const content = await createJson<AiGeneratedContent>(
      `${CONTENT_GENERATION_PROMPT}
Return a JSON object matching the requested content type. Language: ${body.language}. Tone: ${body.tone}.`,
      body,
      fallback
    );

    return NextResponse.json({ success: true, content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur génération IA";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
