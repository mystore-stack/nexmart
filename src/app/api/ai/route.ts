// src/app/api/ai/route.ts — AI Description Generator (Claude-powered)
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { rateLimit } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  productName: z.string().min(2).max(200),
  category: z.string().max(100).optional(),
  keywords: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const rl = await rateLimit(`ai:${session.userId}`, 20, 60 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: "Limite de requêtes IA atteinte. Réessayez plus tard." },
        { status: 429 }
      );
    }

    const { productName, category, keywords } = schema.parse(await req.json());

    const prompt = `Tu es un expert en e-commerce marocain premium. Génère une description de produit convaincante en français pour :

Produit: "${productName}"
Catégorie: "${category || "Général"}"
Mots-clés: ${keywords || "qualité, maroc, premium"}

La description doit:
- Être entre 100-150 mots
- Être persuasive et professionnelle
- Mettre en valeur la qualité marocaine si applicable
- Inclure des bénéfices clés
- Terminer par un appel à l'action subtil
- Style adapté à un marketplace premium

Retourne UNIQUEMENT la description, sans titre ni commentaire.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Service IA indisponible" }, { status: 503 });
    }
    const data = await res.json();
    const description = data.content?.[0]?.text?.trim();

    return NextResponse.json({ success: true, description });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
