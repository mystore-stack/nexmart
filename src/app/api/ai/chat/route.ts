import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { AiMessageRole, LocaleCode, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/api";
import { getDefaultOrganizationId, getOrganizationIdForUser } from "@/lib/tenant";
import { COMMERCE_ASSISTANT_PROMPT } from "@/lib/ai/prompts";
import { createStreamingText, moderateText } from "@/lib/ai/openai";
import type { AiChatMessage } from "@/lib/ai/types";
import { AI_CACHE_TTL, getAiCache, setAiCache } from "@/lib/ai/cache";
import { assertAiRequestAllowed, clientIp } from "@/lib/ai/security";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const chatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(12)
    .optional()
    .default([]),
  context: z
    .object({
      productSlug: z.string().optional(),
      orderNumber: z.string().optional(),
      voice: z.boolean().optional(),
    })
    .optional()
    .default({}),
  locale: z.enum(["fr", "ar", "en", "darija"]).optional().default("fr"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req).catch(() => null);
    const conversationId = req.nextUrl.searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ success: true, conversation: null, messages: [] });
    }

    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: conversationId,
        ...(user?.userId ? { userId: user.userId } : { userId: null }),
      },
      include: { AiMessage: { orderBy: { createdAt: "asc" }, take: 50 } },
    });

    if (!conversation) {
      return NextResponse.json({ success: true, conversation: null, messages: [] });
    }

    return NextResponse.json({
      success: true,
      conversation: { id: conversation.id, status: conversation.status, title: conversation.title },
      messages: conversation.AiMessage.map((message) => ({
        id: message.id,
        role: message.role.toLowerCase(),
        content: message.content,
        createdAt: message.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    assertAiRequestAllowed(req);
    const ip = clientIp(req);
    const user = await getAuthFromRequest(req).catch(() => null);
    const rl = await rateLimit(`ai:chat:${user?.userId || ip}`, Number(process.env.AI_CHAT_RPM || 30), 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Trop de requêtes IA." }, { status: 429 });
    }

    const body = chatSchema.parse(await req.json());
    const moderation = await moderateText(body.message);
    const organizationId = user ? await getOrganizationIdForUser(user) : await getDefaultOrganizationId();

    const conversation = await getOrCreateConversation({
      conversationId: body.conversationId,
      organizationId,
      userId: user?.userId,
      locale: body.locale,
      firstMessage: body.message,
    });

    await prisma.aiMessage.create({
      data: {
        id: randomUUID(),
        conversationId: conversation.id,
        role: AiMessageRole.USER,
        content: body.message,
        moderated: true,
        blocked: moderation.flagged,
        metadata: { categories: moderation.categories } as Prisma.InputJsonValue,
      },
    });

    if (moderation.flagged) {
      await prisma.aiMessage.create({
        data: {
          id: randomUUID(),
          conversationId: conversation.id,
          role: AiMessageRole.ASSISTANT,
          content: "Je ne peux pas aider avec cette demande. Je peux toutefois vous aider à trouver un produit, suivre une commande ou contacter le support.",
          moderated: true,
          blocked: false,
        },
      });
      return NextResponse.json({
        success: true,
        conversationId: conversation.id,
        message: "Je ne peux pas aider avec cette demande. Je peux toutefois vous aider à trouver un produit, suivre une commande ou contacter le support.",
      });
    }

    const context = await buildCommerceContext({
      userId: user?.userId,
      organizationId,
      productSlug: body.context.productSlug,
      orderNumber: body.context.orderNumber,
    });

    const recentMessages = await prisma.aiMessage.findMany({
      where: { conversationId: conversation.id, blocked: false },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const messages: AiChatMessage[] = [
      { role: "system", content: context },
      ...recentMessages
        .reverse()
        .map((message) => ({
          role: message.role === "ASSISTANT" ? "assistant" as const : "user" as const,
          content: message.content,
        })),
    ];

    const cacheableFaq = !user?.userId && !body.context.productSlug && !body.context.orderNumber;
    const cachedReply = cacheableFaq
      ? await getAiCache<string>("chat_faq", { locale: body.locale, message: body.message.trim().toLowerCase() })
      : null;

    const openAiStream = cachedReply
      ? textToOpenAiSseStream(cachedReply)
      : await createStreamingText(COMMERCE_ASSISTANT_PROMPT, messages);
    const { readable, responseText } = openAiSseToUiStream(openAiStream, conversation.id);

    responseText.then(async (content) => {
      if (!content.trim()) return;
      await prisma.aiMessage.create({
        data: {
          id: randomUUID(),
          conversationId: conversation.id,
          role: AiMessageRole.ASSISTANT,
          content,
          moderated: false,
        },
      });
      await prisma.aiConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date(), summary: content.slice(0, 500) },
      });
      if (cacheableFaq && !cachedReply) {
        await setAiCache(
          "chat_faq",
          { locale: body.locale, message: body.message.trim().toLowerCase() },
          content,
          AI_CACHE_TTL.CHAT_FAQ
        );
      }
    }).catch(() => {});

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "x-ai-conversation-id": conversation.id,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function textToOpenAiSseStream(text: string) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const chunks = text.match(/.{1,80}(\s|$)/g) || [text];
      for (const chunk of chunks) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "response.output_text.delta", delta: chunk })}\n\n`)
        );
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "response.completed" })}\n\n`));
      controller.close();
    },
  });
}

async function getOrCreateConversation(input: {
  conversationId?: string;
  organizationId: string;
  userId?: string;
  locale: "fr" | "ar" | "en" | "darija";
  firstMessage: string;
}) {
  if (input.conversationId) {
    const existing = await prisma.aiConversation.findFirst({
      where: {
        id: input.conversationId,
        organizationId: input.organizationId,
        ...(input.userId ? { userId: input.userId } : { userId: null }),
      },
    });
    if (existing) return existing;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.aiConversation.create({
    data: {
      id: randomUUID(),
      organizationId: input.organizationId,
      ...(input.userId ? { userId: input.userId } : {}),
      locale: input.locale as any,
      title: input.firstMessage.slice(0, 80),
      metadata: { source: "web_chat" } as Prisma.InputJsonValue,
    } as any,
  });
}

async function buildCommerceContext(input: {
  organizationId: string;
  userId?: string;
  productSlug?: string;
  orderNumber?: string;
}) {
  const context: string[] = ["Commerce context follows. Use only this context for factual product/order claims."];

  if (input.productSlug) {
    const product = await prisma.product.findFirst({
      where: { organizationId: input.organizationId, slug: input.productSlug, published: true },
      select: {
        name: true,
        price: true,
        comparePrice: true,
        stock: true,
        rating: true,
        reviewCount: true,
        tags: true,
        category: { select: { name: true } },
      },
    });
    if (product) context.push(`Current product: ${JSON.stringify(product)}`);
  }

  if (input.userId) {
    const [recentOrders, cartItems] = await Promise.all([
      prisma.order.findMany({
        where: { organizationId: input.organizationId, userId: input.userId },
        select: { orderNumber: true, status: true, paymentStatus: true, total: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.cartItem.findMany({
        where: { userId: input.userId, product: { organizationId: input.organizationId } },
        select: { quantity: true, product: { select: { name: true, price: true } } },
        take: 8,
      }),
    ]);
    context.push(`Recent orders: ${JSON.stringify(recentOrders)}`);
    context.push(`Cart: ${JSON.stringify(cartItems)}`);
  }

  return context.join("\n");
}

function openAiSseToUiStream(openAiStream: ReadableStream<Uint8Array>, conversationId: string) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let fullText = "";
  let resolveText: (value: string) => void;
  const responseText = new Promise<string>((resolve) => {
    resolveText = resolve;
  });

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(`event: meta\ndata: ${JSON.stringify({ conversationId })}\n\n`));
      const reader = openAiStream.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const event of events) {
            const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
            if (!dataLine) continue;
            const raw = dataLine.slice(6);
            if (raw === "[DONE]") continue;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.type === "response.output_text.delta" && parsed.delta) {
                fullText += parsed.delta;
                controller.enqueue(encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: parsed.delta })}\n\n`));
              }
            } catch {
              // Ignore non-JSON provider keepalive chunks.
            }
          }
        }
        controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ ok: true })}\n\n`));
      } finally {
        resolveText!(fullText);
        controller.close();
      }
    },
  });

  return { readable, responseText };
}
