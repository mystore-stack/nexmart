import { randomUUID } from "crypto";
import { AiMessageRole, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createJson, createText } from "@/lib/ai/gemini";
import type { AiChatMessage } from "@/lib/ai/types";
import type { CodeGenerationResult, EngineerConversation } from "./types";

const ENGINEER_PROMPT = [
  "You are NexMart's in-admin AI Engineer.",
  "NexMart is a Next.js 15 App Router, TypeScript, Tailwind, Shadcn/UI, Prisma, PostgreSQL, Gemini, Vercel ecommerce platform.",
  "Help administrators diagnose, audit, monitor, and improve the platform without opening VS Code.",
  "Be precise, production-minded, and security-aware.",
  "When suggesting code, name exact files and explain risk.",
  "Never claim you edited files. You only advise from available telemetry and context.",
].join("\n");

export async function listEngineerConversations(organizationId: string): Promise<EngineerConversation[]> {
  const conversations = await prisma.aiConversation.findMany({
    where: { organizationId, channel: "admin_ai" },
    orderBy: { updatedAt: "desc" },
    take: 25,
    include: { AiMessage: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    status: conversation.status,
    updatedAt: conversation.updatedAt.toISOString(),
  }));
}

export async function getEngineerConversation(organizationId: string, conversationId: string): Promise<EngineerConversation | null> {
  const conversation = await prisma.aiConversation.findFirst({
    where: { id: conversationId, organizationId, channel: "admin_ai" },
    include: { AiMessage: { orderBy: { createdAt: "asc" }, take: 100 } },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    title: conversation.title,
    status: conversation.status,
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.AiMessage.map((message) => ({
      id: message.id,
      role: message.role.toLowerCase() as "user" | "assistant" | "system",
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

async function getOrCreateEngineerConversation(input: {
  organizationId: string;
  userId: string;
  conversationId?: string;
  firstMessage: string;
}) {
  if (input.conversationId) {
    const existing = await prisma.aiConversation.findFirst({
      where: { id: input.conversationId, organizationId: input.organizationId, channel: "admin_ai" },
    });
    if (existing) return existing;
  }

  return prisma.aiConversation.create({
    data: {
      id: randomUUID(),
      organizationId: input.organizationId,
      userId: input.userId,
      channel: "admin_ai",
      title: input.firstMessage.slice(0, 80),
      metadata: { source: "admin_ai_engineer" } as Prisma.InputJsonValue,
    },
  });
}

export async function sendEngineerMessage(input: {
  organizationId: string;
  userId: string;
  conversationId?: string;
  message: string;
  context?: unknown;
}) {
  const conversation = await getOrCreateEngineerConversation({
    organizationId: input.organizationId,
    userId: input.userId,
    conversationId: input.conversationId,
    firstMessage: input.message,
  });

  await prisma.aiMessage.create({
    data: {
      id: randomUUID(),
      conversationId: conversation.id,
      role: AiMessageRole.USER,
      content: input.message,
      metadata: { context: input.context || null } as Prisma.InputJsonValue,
    },
  });

  const recentMessages = await prisma.aiMessage.findMany({
    where: { conversationId: conversation.id, blocked: false },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const messages: AiChatMessage[] = [
    {
      role: "system",
      content: `Admin telemetry/context:\n${JSON.stringify(input.context || {}, null, 2).slice(0, 6000)}`,
    },
    ...recentMessages.reverse().map((message) => ({
      role: message.role === "ASSISTANT" ? "assistant" as const : "user" as const,
      content: message.content,
    })),
  ];

  const content = await createText(ENGINEER_PROMPT, messages);

  const assistantMessage = await prisma.aiMessage.create({
    data: {
      id: randomUUID(),
      conversationId: conversation.id,
      role: AiMessageRole.ASSISTANT,
      content,
      metadata: { source: "admin_ai_engineer" } as Prisma.InputJsonValue,
    },
  });

  await prisma.aiConversation.update({
    where: { id: conversation.id },
    data: { summary: content.slice(0, 600) },
  });

  return {
    conversationId: conversation.id,
    message: {
      id: assistantMessage.id,
      role: "assistant" as const,
      content,
      createdAt: assistantMessage.createdAt.toISOString(),
    },
  };
}

const CODE_GENERATOR_FALLBACK: CodeGenerationResult = {
  summary: "AI code generation is waiting for GEMINI_API_KEY.",
  prismaSchema: "// Configure GEMINI_API_KEY to generate Prisma schema.",
  apiRoutes: "// Configure GEMINI_API_KEY to generate API routes.",
  serverActions: "// Configure GEMINI_API_KEY to generate server actions.",
  forms: "// Configure GEMINI_API_KEY to generate forms.",
  validation: "// Configure GEMINI_API_KEY to generate validation schemas.",
  adminPages: "// Configure GEMINI_API_KEY to generate admin pages.",
  implementationPlan: ["Define requirements", "Generate code with AI", "Review and test before applying"],
};

export async function generateCodePlan(prompt: string): Promise<CodeGenerationResult> {
  return createJson<CodeGenerationResult>(
    [
      "You generate implementation plans and code snippets for the NexMart admin codebase.",
      "Return strict JSON with keys: summary, prismaSchema, apiRoutes, serverActions, forms, validation, adminPages, implementationPlan.",
      "Do not include markdown fences in string fields. Keep snippets concise but complete enough to implement.",
      "Assume Next.js 15 App Router, TypeScript, Prisma, PostgreSQL, Tailwind, Shadcn/UI.",
    ].join("\n"),
    { prompt },
    { ...CODE_GENERATOR_FALLBACK, summary: `Generated scaffold request: ${prompt}` },
  );
}
