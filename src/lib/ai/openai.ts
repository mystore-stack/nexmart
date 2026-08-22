import type { AiChatMessage } from "./types";
import { AI_CACHE_TTL, getAiCache, setAiCache } from "./cache";

const OPENAI_API_BASE = "https://api.openai.com/v1";
const DEFAULT_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 12000);
const DEFAULT_MAX_OUTPUT_TOKENS = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 700);

export const AI_MODELS = {
  chat: process.env.OPENAI_CHAT_MODEL || "gpt-5-mini",
  fast: process.env.OPENAI_FAST_MODEL || "gpt-5-nano",
  embedding: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  moderation: process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest",
} as const;

function getOpenAiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

export function isOpenAiConfigured() {
  return Boolean(getOpenAiKey());
}

async function openAiFetch(path: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const apiKey = getOpenAiKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${OPENAI_API_BASE}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...(init.headers || {}),
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        if (response.status >= 500 && attempt === 0) {
          lastError = new Error(`OpenAI transient failure: ${response.status}`);
          continue;
        }
        throw new Error(`OpenAI request failed: ${response.status} ${text.slice(0, 300)}`);
      }

      return response;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt === 0) continue;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("OpenAI request failed");
}

export async function moderateText(input: string) {
  if (!isOpenAiConfigured()) return { flagged: false, categories: {} as Record<string, boolean> };
  const cacheInput = input.trim().toLowerCase().slice(0, 2000);
  const cached = await getAiCache<{ flagged: boolean; categories: Record<string, boolean> }>("moderation", cacheInput);
  if (cached) return cached;

  try {
    const response = await openAiFetch("/moderations", {
      method: "POST",
      body: JSON.stringify({
        model: AI_MODELS.moderation,
        input: cacheInput,
      }),
    }, 8000);
    const data = await response.json();
    const result = data.results?.[0];
    const moderation = {
      flagged: Boolean(result?.flagged),
      categories: (result?.categories || {}) as Record<string, boolean>,
    };
    await setAiCache("moderation", cacheInput, moderation, AI_CACHE_TTL.MODERATION);
    return moderation;
  } catch {
    return { flagged: false, categories: {} as Record<string, boolean> };
  }
}

export async function createEmbedding(input: string): Promise<number[]> {
  if (!isOpenAiConfigured()) return deterministicEmbedding(input);
  const normalized = input.trim().replace(/\s+/g, " ").slice(0, 8000);
  const cached = await getAiCache<number[]>("embedding", {
    model: AI_MODELS.embedding,
    input: normalized,
  });
  if (cached) return cached;

  const response = await openAiFetch("/embeddings", {
    method: "POST",
    body: JSON.stringify({
      model: AI_MODELS.embedding,
      input: normalized,
    }),
  }, 10000);
  const data = await response.json();
  const embedding = data.data?.[0]?.embedding || deterministicEmbedding(input);
  await setAiCache("embedding", { model: AI_MODELS.embedding, input: normalized }, embedding, AI_CACHE_TTL.EMBEDDING);
  return embedding;
}

export async function createJson<T>(instructions: string, input: unknown, fallback: T, ttl = AI_CACHE_TTL.JSON): Promise<T> {
  if (!isOpenAiConfigured()) return fallback;
  const cacheShape = { model: AI_MODELS.fast, instructions, input };
  const cached = await getAiCache<T>("json", cacheShape);
  if (cached) return cached;

  try {
    const response = await openAiFetch("/responses", {
      method: "POST",
      body: JSON.stringify({
        model: AI_MODELS.fast,
        instructions,
        input: JSON.stringify(input),
        max_output_tokens: Math.min(DEFAULT_MAX_OUTPUT_TOKENS, 500),
        text: { format: { type: "json_object" } },
      }),
    }, 10000);
    const data = await response.json();
    const text = extractOutputText(data);
    const parsed = JSON.parse(text) as T;
    await setAiCache("json", cacheShape, parsed, ttl);
    return parsed;
  } catch {
    return fallback;
  }
}

export async function createText(instructions: string, messages: AiChatMessage[]) {
  if (!isOpenAiConfigured()) {
    return "Je peux vous aider à trouver des produits, comparer des options et suivre vos commandes. Configurez OPENAI_API_KEY pour activer les réponses IA complètes.";
  }

  const response = await openAiFetch("/responses", {
    method: "POST",
    body: JSON.stringify({
      model: AI_MODELS.chat,
      instructions,
      max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
      input: messages.map((message) => ({
        role: message.role === "system" ? "developer" : message.role,
        content: message.content,
      })),
    }),
  }, DEFAULT_TIMEOUT_MS);
  return extractOutputText(await response.json());
}

export async function createStreamingText(instructions: string, messages: AiChatMessage[]) {
  if (!isOpenAiConfigured()) {
    return fallbackTextStream(
      "Je suis prêt à vous aider avec vos achats, recommandations et questions produit. Ajoutez OPENAI_API_KEY pour activer le streaming IA complet."
    );
  }

  const response = await openAiFetch("/responses", {
    method: "POST",
    body: JSON.stringify({
      model: AI_MODELS.chat,
      instructions,
      max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
      input: messages.map((message) => ({
        role: message.role === "system" ? "developer" : message.role,
        content: message.content,
      })),
      stream: true,
    }),
  }, 20000);

  if (!response.body) throw new Error("OpenAI stream missing body");
  return response.body;
}

export function extractOutputText(data: any): string {
  if (typeof data.output_text === "string") return data.output_text;
  const chunks: string[] = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("").trim();
}

export function cosineSimilarity(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length);
  if (!len) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

function deterministicEmbedding(input: string) {
  const vector = new Array(128).fill(0);
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    vector[(code + i) % vector.length] += ((code % 31) - 15) / 15;
  }
  return vector;
}

function fallbackTextStream(text: string) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: "response.output_text.delta", delta: text })}\n\n`));
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: "response.completed" })}\n\n`));
      controller.close();
    },
  });
}
