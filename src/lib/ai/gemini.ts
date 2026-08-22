import fs from "fs/promises";
import path from "path";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type Content,
  type Part,
} from "@google/generative-ai";
import type { AiChatMessage } from "./types";
import { AI_CACHE_TTL, getAiCache, setAiCache } from "./cache";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const DEFAULT_VISION_MODEL = process.env.GEMINI_VISION_MODEL || DEFAULT_MODEL;
const DEFAULT_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
const DEFAULT_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 12000);
const DEFAULT_MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 1200);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function getGeminiKey() {
  return process.env.GEMINI_API_KEY?.trim();
}

function getClient() {
  const apiKey = getGeminiKey();
  return apiKey ? new GoogleGenerativeAI(apiKey) : null;
}

export function isGeminiConfigured() {
  return Boolean(getGeminiKey());
}

export async function testGeminiConnection() {
  if (!isGeminiConfigured()) {
    return { ok: false, status: "missing_key", message: "GEMINI_API_KEY is not configured." };
  }

  try {
    const text = await generateText("Reply with exactly: ok", [], "ok");
    return {
      ok: text.toLowerCase().includes("ok"),
      status: "operational",
      message: "Gemini API responded successfully.",
    };
  } catch (error) {
    console.error("[Gemini] connection test failed:", safeError(error));
    return {
      ok: false,
      status: "failed",
      message: "Gemini API could not be reached. Check the key, quota, and model settings.",
    };
  }
}

export async function generateText(instructions: string, messages: AiChatMessage[] = [], fallback = "") {
  const client = getClient();
  if (!client) return fallback || "Gemini is not configured. Add GEMINI_API_KEY to enable AI responses.";

  try {
    const model = client.getGenerativeModel({
      model: DEFAULT_MODEL,
      safetySettings,
      generationConfig: { maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS },
    });
    const prompt = buildPrompt(instructions, messages);
    const result = await withTimeout(model.generateContent(prompt), DEFAULT_TIMEOUT_MS);
    return result.response.text().trim() || fallback;
  } catch (error) {
    console.error("[Gemini] generateText failed:", safeError(error));
    return fallback || "AI generation is temporarily unavailable. Please try again shortly.";
  }
}

export async function createText(instructions: string, messages: AiChatMessage[]) {
  return generateText(
    instructions,
    messages,
    "Je peux vous aider avec vos achats, recommandations et questions produit. Configurez GEMINI_API_KEY pour activer les reponses IA completes."
  );
}

export async function createJson<T>(instructions: string, input: unknown, fallback: T, ttl = AI_CACHE_TTL.JSON): Promise<T> {
  if (!isGeminiConfigured()) return fallback;
  const cacheShape = { model: DEFAULT_MODEL, instructions, input };
  const cached = await getAiCache<T>("json", cacheShape);
  if (cached) return cached;

  try {
    const text = await generateText(
      [
        instructions,
        "Return valid JSON only. Do not include markdown fences, commentary, or trailing prose.",
        `Input JSON: ${JSON.stringify(input)}`,
      ].join("\n\n"),
      [],
      JSON.stringify(fallback)
    );
    const parsed = JSON.parse(extractJsonObject(text)) as T;
    await setAiCache("json", cacheShape, parsed, ttl);
    return parsed;
  } catch (error) {
    console.error("[Gemini] createJson fallback:", safeError(error));
    return fallback;
  }
}

export async function createStreamingText(instructions: string, messages: AiChatMessage[]) {
  const client = getClient();
  if (!client) {
    return textToProviderSseStream(
      "Je suis pret a vous aider avec vos achats, recommandations et questions produit. Ajoutez GEMINI_API_KEY pour activer le streaming IA complet."
    );
  }

  try {
    const model = client.getGenerativeModel({
      model: DEFAULT_MODEL,
      safetySettings,
      generationConfig: { maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS },
    });
    const stream = await model.generateContentStream(buildPrompt(instructions, messages));
    return geminiStreamToProviderSse(stream.stream);
  } catch (error) {
    console.error("[Gemini] streaming fallback:", safeError(error));
    return textToProviderSseStream("AI streaming is temporarily unavailable. Please try again shortly.");
  }
}

export async function moderateText(input: string) {
  const normalized = input.toLowerCase();
  const flagged = [
    "self harm",
    "suicide",
    "weapon instructions",
    "credit card dump",
    "bypass payment",
  ].some((pattern) => normalized.includes(pattern));
  return { flagged, categories: flagged ? { unsafe_commerce_request: true } : {} as Record<string, boolean> };
}

export async function createEmbedding(input: string): Promise<number[]> {
  const normalized = input.trim().replace(/\s+/g, " ").slice(0, 8000);
  if (!isGeminiConfigured()) return deterministicEmbedding(normalized);
  const cached = await getAiCache<number[]>("embedding", { model: DEFAULT_EMBEDDING_MODEL, input: normalized });
  if (cached) return cached;

  try {
    const client = getClient();
    if (!client) return deterministicEmbedding(normalized);
    const model = client.getGenerativeModel({ model: DEFAULT_EMBEDDING_MODEL });
    const result = await withTimeout(model.embedContent(normalized), DEFAULT_TIMEOUT_MS);
    const embedding = result.embedding.values.length ? result.embedding.values : deterministicEmbedding(normalized);
    await setAiCache("embedding", { model: DEFAULT_EMBEDDING_MODEL, input: normalized }, embedding, AI_CACHE_TTL.EMBEDDING);
    return embedding;
  } catch (error) {
    console.error("[Gemini] embedding fallback:", safeError(error));
    return deterministicEmbedding(normalized);
  }
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

export async function analyzeProduct(input: {
  productName?: string;
  supplierInfo?: string;
  productUrl?: string;
  imageUrls?: string[];
  categories?: Array<{ id?: string; name: string; parentId?: string | null }>;
}) {
  const fallback = {
    title: input.productName || "NexMart product",
    description: input.supplierInfo || "Product analysis is available after configuring Gemini.",
    productType: "Product",
    category: input.categories?.[0]?.name || "General",
    tags: ["nexmart"],
    seoTitle: input.productName || "NexMart product",
    seoDescription: (input.supplierInfo || input.productName || "NexMart product").slice(0, 155),
    imageAnalysis: (input.imageUrls || []).map((imageUrl) => ({
      imageUrl,
      productType: input.productName || "Product",
      colors: ["neutral"],
      features: ["product image"],
      useCases: ["ecommerce"],
      altText: `${input.productName || "Product"} image`,
      confidence: 0.4,
    })),
  };

  if (!isGeminiConfigured()) return fallback;

  try {
    const client = getClient();
    if (!client) return fallback;
    const model = client.getGenerativeModel({
      model: DEFAULT_VISION_MODEL,
      safetySettings,
      generationConfig: { maxOutputTokens: 2600 },
    });
    const imageParts = await Promise.all((input.imageUrls || []).slice(0, 8).map(toGeminiImagePart));
    const result = await withTimeout(
      model.generateContent([
        {
          text: [
            "You are an ecommerce product image and catalog specialist.",
            "Return JSON only with keys: title, description, productType, category, tags, seoTitle, seoDescription, imageAnalysis.",
            "imageAnalysis must include imageUrl, productType, colors, features, useCases, altText, confidence.",
            `Product context: ${JSON.stringify(input)}`,
          ].join("\n"),
        },
        ...imageParts,
      ]),
      DEFAULT_TIMEOUT_MS
    );
    return { ...fallback, ...JSON.parse(extractJsonObject(result.response.text())) };
  } catch (error) {
    console.error("[Gemini] product analysis fallback:", safeError(error));
    return fallback;
  }
}

export async function generateSEO(input: { title: string; description?: string; tags?: string[] }) {
  return createJson(
    "Generate ecommerce SEO metadata. Return JSON with seoTitle, seoDescription, metaKeywords, openGraphTitle, openGraphDescription, slug.",
    input,
    {
      seoTitle: input.title.slice(0, 65),
      seoDescription: (input.description || input.title).slice(0, 160),
      metaKeywords: input.tags || [],
      openGraphTitle: input.title,
      openGraphDescription: (input.description || input.title).slice(0, 160),
      slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }
  );
}

export async function generateProductDescription(input: { title: string; supplierInfo?: string; tone?: string }) {
  return createJson(
    "Generate ecommerce product copy. Return JSON with shortDescription, longDescription, highlights, specifications, faq, marketingCopy.",
    input,
    {
      shortDescription: input.supplierInfo?.slice(0, 150) || input.title,
      longDescription: input.supplierInfo || input.title,
      highlights: [],
      specifications: [],
      faq: [],
      marketingCopy: input.title,
    }
  );
}

export async function categorizeProduct(input: {
  title: string;
  description?: string;
  categories: Array<{ id?: string; name: string; parentId?: string | null }>;
}) {
  return createJson(
    "Choose the best ecommerce category. Return JSON with category, subcategory, brand, productType, confidence.",
    input,
    {
      category: input.categories[0]?.name || "General",
      subcategory: input.categories[0]?.name || "General",
      brand: "NexMart",
      productType: "Product",
      confidence: 0.4,
    }
  );
}

async function toGeminiImagePart(imageUrl: string): Promise<Part> {
  const data = await imageToBase64(imageUrl);
  return { inlineData: { data: data.base64, mimeType: data.mimeType } };
}

async function imageToBase64(imageUrl: string) {
  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) return { mimeType: match[1], base64: match[2] };
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    return { mimeType: response.headers.get("content-type") || "image/jpeg", base64: buffer.toString("base64") };
  }

  const publicPath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  const buffer = await fs.readFile(publicPath);
  return { mimeType: mimeFromPath(publicPath), base64: buffer.toString("base64") };
}

function buildPrompt(instructions: string, messages: AiChatMessage[]) {
  const content = messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
  return [instructions, content].filter(Boolean).join("\n\n");
}

function geminiStreamToProviderSse(stream: AsyncIterable<any>) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text?.() || "";
          if (!text) continue;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "response.output_text.delta", delta: text })}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "response.completed" })}\n\n`));
      } catch (error) {
        console.error("[Gemini] stream read failed:", safeError(error));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "response.output_text.delta", delta: "AI streaming is temporarily unavailable." })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "response.completed" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });
}

function textToProviderSseStream(text: string) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const chunks = text.match(/.{1,80}(\s|$)/g) || [text];
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "response.output_text.delta", delta: chunk })}\n\n`));
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "response.completed" })}\n\n`));
      controller.close();
    },
  });
}

function extractJsonObject(text: string) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) return cleaned.slice(first, last + 1);
  return cleaned;
}

function deterministicEmbedding(input: string) {
  const vector = new Array(128).fill(0);
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    vector[(code + i) % vector.length] += ((code % 31) - 15) / 15;
  }
  return vector;
}

function mimeFromPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}

function safeError(error: unknown) {
  if (!(error instanceof Error)) return "Unknown Gemini error";
  return { name: error.name, message: error.message.slice(0, 500) };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Gemini request timed out")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
