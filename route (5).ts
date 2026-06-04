/**
 * /api/ai/tag — AI Auto-Tagger
 * Analyzes product name + description → optimal SEO tags
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name:        z.string().min(2),
  description: z.string().optional().default(""),
  category:    z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req).catch(() => null);
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = schema.parse(await req.json());
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{ role: "user", content: `Generate 8-12 e-commerce search tags for a Moroccan marketplace.
Product: "${body.name}"
Category: ${body.category || "unknown"}
Respond ONLY with JSON: {"tags": ["lowercase-tags"],"suggestedCategory": "slug"}` }],
      }),
    });
    if (!res.ok) throw new Error("AI unavailable");
    const data = await res.json();
    const text = (data.content?.[0]?.text || "{}").replace(/\`\`\`json|\`\`\`/g, "").trim();
    return NextResponse.json({ success: true, ...JSON.parse(text) });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Tagging failed" }, { status: 500 });
  }
}
