/**
 * /api/ai/chat — AI Customer Support Chatbot
 * ─────────────────────────────────────────────
 * Powered by Claude with:
 * - Full marketplace context (products, orders, policies)
 * - Multilingual (FR/AR/Darija/EN)
 * - Order lookup capability
 * - Conversation history
 * - Escalation to human support
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(10).optional().default([]),
  context: z.object({
    productSlug: z.string().optional(),
    orderId: z.string().optional(),
  }).optional().default({}),
});

const SYSTEM_PROMPT = `Tu es NexBot, l'assistant intelligent de NexMart — la marketplace premium du Maroc.

Tu aides les clients avec:
- Questions sur les produits, prix, disponibilité
- Suivi de commandes et statuts
- Politiques de retour et garanties (14 jours retour, garantie constructeur)
- Modes de paiement: Carte bancaire (Stripe), Paiement à la livraison, CMI
- Livraison: Amana, Chrono Diali, Jibli (2-5 jours ouvrables, gratuit >500 MAD)
- Coupons et promotions actives

Règles:
- Réponds dans la langue de l'utilisateur (français, arabe, darija, ou anglais)
- Sois chaleureux, professionnel, et concis
- Si tu ne sais pas, dis-le honnêtement et propose d'escalader
- Ne jamais inventer des infos sur des commandes spécifiques sans les vérifier
- Maximum 150 mots par réponse sauf si demande de détails techniques
- Format markdown simple (gras, listes) pour la lisibilité

Informations NexMart:
- Support: support@nexmart.ma | WhatsApp: +212 6 XX XX XX XX
- Horaires: Lun-Sam 9h-18h
- HQ: Casablanca, Maroc`;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success: allowed } = await rateLimit(`chat:${ip}`, 20, 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de requêtes. Attendez une minute." }, { status: 429 });
    }

    const payload = await getAuthFromRequest(req).catch(() => null);
    const body = chatSchema.parse(await req.json());

    // Build context messages
    const contextMessages: { role: "user" | "assistant"; content: string }[] = [];

    // Inject product context if browsing a product
    if (body.context?.productSlug) {
      try {
        const product = await prisma.product.findFirst({
          where: { slug: body.context.productSlug },
          select: { name: true, price: true, description: true, stock: true, rating: true },
        });
        if (product) {
          contextMessages.push({
            role: "user",
            content: `[CONTEXT SYSTÈME] L'utilisateur consulte actuellement: "${product.name}" - Prix: ${product.price} MAD - Stock: ${product.stock} unités - Note: ${product.rating}/5`,
          });
          contextMessages.push({
            role: "assistant",
            content: "Compris, je vois que vous regardez ce produit.",
          });
        }
      } catch {}
    }

    // Inject order context if user is logged in and asking about an order
    if (payload?.userId && body.message.toLowerCase().includes("commande")) {
      try {
        const recentOrder = await prisma.order.findFirst({
          where: { userId: payload.userId },
          select: { orderNumber: true, status: true, total: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        if (recentOrder) {
          contextMessages.push({
            role: "user",
            content: `[CONTEXT SYSTÈME] Dernière commande de cet utilisateur: #${recentOrder.orderNumber} - Statut: ${recentOrder.status} - Total: ${recentOrder.total} MAD - Date: ${recentOrder.createdAt.toLocaleDateString("fr-MA")}`,
          });
          contextMessages.push({
            role: "assistant",
            content: "Je vois vos informations de commande.",
          });
        }
      } catch {}
    }

    const messages = [
      ...contextMessages,
      ...body.history,
      { role: "user" as const, content: body.message },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!res.ok) throw new Error("AI service error");
    const data = await res.json();
    const reply = data.content?.[0]?.text?.trim() || "Désolé, je n'ai pas pu traiter votre demande. Contactez support@nexmart.ma";

    return NextResponse.json({
      success: true,
      message: reply,
      tokens: data.usage?.output_tokens || 0,
    });
  } catch (err) {
    console.error("[AI Chat]", err);
    return NextResponse.json({
      success: true,
      message: "Je rencontre des difficultés techniques. Contactez-nous sur WhatsApp ou support@nexmart.ma",
    });
  }
}
