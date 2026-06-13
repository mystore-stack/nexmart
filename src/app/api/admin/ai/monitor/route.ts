import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const organizationId = session.organizationId;
    const take = Math.min(50, Number(req.nextUrl.searchParams.get("take") || 20));

    const [conversations, messageCount, blockedCount, embeddingCount, events] = await Promise.all([
      prisma.aiConversation.findMany({
        where: { organizationId },
        include: {
          User: { select: { id: true, email: true, name: true } },
          AiMessage: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
        take,
      }),
      prisma.aiMessage.count({ where: { AiConversation: { organizationId } } }),
      prisma.aiMessage.count({ where: { AiConversation: { organizationId }, blocked: true } }),
      prisma.aiProductEmbedding.count({ where: { organizationId } }),
      prisma.aiEvent.groupBy({
        by: ["type"],
        where: { organizationId },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        conversations: conversations.length,
        messages: messageCount,
        blockedMessages: blockedCount,
        embeddings: embeddingCount,
        events: events.map((event) => ({ type: event.type, count: event._count._all })),
      },
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        user: conversation.User,
        status: conversation.status,
        title: conversation.title,
        updatedAt: conversation.updatedAt,
        lastMessage: conversation.AiMessage[0]?.content || "",
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur monitoring IA";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
