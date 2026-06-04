/**
 * /api/ai/describe — AI Product Description Generator
 * ────────────────────────────────────────────────────
 * Generates SEO-optimized, multilingual product descriptions
 * using Claude. Admin-only endpoint.
 *
 * POST { name, category, price, tags, existingDescription? }
 * → { description, seoTitle, seoDescription, tags, keyFeatures }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name:                z.string().min(2).max(200),
  category:            z.string().min(1),
  price:               z.number().positive(),
  tags:                z.array(z.string()).optional().default([]),
  existingDescription: z.string().optional(),
  language:            z.enum(["fr", "ar", "en"]).optional().default("fr"),
  tone:                z.enum(["premium", "casual", "technical"]).optional().default("premium"),
});

export async function POST(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req).catch(() => null);
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = schema.parse(await req.json());

    const langInstructions = {
      fr: "en français parfait, élégant et commercial",
      ar: "باللغة العربية الفصحى",
      en: "in professional English",
    }[body.language];

    const toneInstructions = {
      premium: "luxurious and aspirational, emphasizing quality and exclusivity",
      casual:  "friendly and approachable, like talking to a knowledgeable friend",
      technical: "detailed and spec-focused, for informed buyers who want facts",
    }[body.tone];

    const prompt = `You are an expert e-commerce copywriter for NexMart Maroc, a premium Moroccan marketplace.

Create compelling product content ${langInstructions} for this product:

Product Name: ${body.name}
Category: ${body.category}
Price: ${body.price} MAD
Tags: ${body.tags.join(", ") || "none"}
${body.existingDescription ? `Existing description (improve this): ${body.existingDescription}` : ""}

Tone: ${toneInstructions}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "description": "2-3 compelling paragraphs, 120-180 words total",
  "seoTitle": "SEO-optimized title under 60 chars",
  "seoDescription": "Meta description 120-155 chars with primary keyword",
  "tags": ["5-8 relevant product tags in lowercase"],
  "keyFeatures": ["3-5 bullet-point key features, each under 10 words"]
}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error("AI service unavailable");
    const data = await res.json();
    const text = data.content?.[0]?.text?.trim() || "{}";

    // Strip any accidental markdown fences
    const clean = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[AI Describe]", err);
    return NextResponse.json({ success: false, error: "Failed to generate description" }, { status: 500 });
  }
}
