// src/app/api/ai/route.ts — AI Description Generator (Claude-powered)
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { productName, category, keywords } = await req.json();

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
        model:      "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error("AI service unavailable");
    const data = await res.json();
    const description = data.content?.[0]?.text?.trim();

    return NextResponse.json({ success: true, description });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
