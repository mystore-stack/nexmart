"use server";

import { requireAdmin } from "@/lib/auth-api";
import { isGeminiConfigured, testGeminiConnection } from "@/lib/ai/gemini";

export async function getAISettings() {
  await requireAdmin();
  return {
    provider: "Google Gemini",
    configured: isGeminiConfigured(),
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    visionModel: process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-1.5-flash",
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
    timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS || 12000),
    maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 1200),
    chatRpm: Number(process.env.AI_CHAT_RPM || 30),
    searchRpm: Number(process.env.AI_SEARCH_RPM || 60),
    semanticSearch: process.env.AI_SEMANTIC_SEARCH !== "false",
    searchIntent: process.env.AI_SEARCH_INTENT !== "false",
  };
}

export async function testGeminiAction() {
  await requireAdmin();
  return testGeminiConnection();
}
