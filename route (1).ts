/**
 * /api/ai/search — AI-Powered Semantic Search
 * ─────────────────────────────────────────────
 * Transforms natural language queries into structured product search
 * using Claude for intent extraction + semantic enrichment.
 *
 * Architecture:
 * 1. Claude extracts: category intent, price range, attributes, synonyms
 * 2. Enriched query hits Prisma full-text search
 * 3. Results ranked by relevance + personalization signals
 * 4. Redis cache: 5min TTL per query fingerprint
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/redis";
import { getDefaultOrganizationId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

interface SearchIntent {
  query: string;
  synonyms: string[];
  category?: string;
  priceRange?: { min?: number; max?: number };
  attributes: string[];
  isQuestion: boolean;
  language: "fr" | "ar" | "en" | "darija";
}

async function extractSearchIntent(query: string): Promise<SearchIntent> {
  const cacheKey = `ai:intent:${Buffer.from(query).toString("base64").slice(0, 40)}`;
  const cached = await getCache<SearchIntent>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // Fast + cheap for search intent
        max_tokens: 300,
        system: `You are a search intent analyzer for a Moroccan e-commerce marketplace.
Extract structured search intent from user queries. Users may write in French, Arabic, Darija (Moroccan Arabic), or English.
Always respond with valid JSON only. No markdown, no explanation.`,
        messages: [
          {
            role: "user",
            content: `Analyze this search query and extract intent:
Query: "${query}"

Respond with JSON in this exact format:
{
  "query": "normalized English query",
  "synonyms": ["synonym1", "synonym2"],
  "category": "electronics|fashion|home-living|sports|beauty|books|toys|automotive or null",
  "priceRange": {"min": number or null, "max": number or null},
  "attributes": ["key product attributes"],
  "isQuestion": boolean,
  "language": "fr|ar|en|darija"
}`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error("AI unavailable");
    const data = await res.json();
    const text = data.content?.[0]?.text?.trim() || "{}";
    const intent: SearchIntent = { query, synonyms: [], attributes: [], isQuestion: false, language: "fr", ...JSON.parse(text) };
    await setCache(cacheKey, intent, 300); // 5 min cache
    return intent;
  } catch {
    // Fallback: return basic intent without AI
    return {
      query,
      synonyms: [],
      attributes: [],
      isQuestion: query.includes("?") || query.toLowerCase().startsWith("how") || query.toLowerCase().startsWith("what"),
      language: "fr",
    };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(20, parseInt(searchParams.get("limit") || "12"));
  const ai = searchParams.get("ai") !== "false"; // Enable AI by default

  if (q.length < 2) {
    return NextResponse.json({ success: true, results: [], intent: null });
  }

  try {
    const cacheKey = `search:ai:${Buffer.from(q + limit).toString("base64").slice(0, 50)}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, ...cached, cached: true });
    }

    const organizationId = await getDefaultOrganizationId();

    // Step 1: Extract intent (with AI if enabled)
    const intent = ai ? await extractSearchIntent(q) : {
      query: q, synonyms: [], attributes: [], isQuestion: false, language: "fr" as const
    };

    // Step 2: Build enriched search terms
    const searchTerms = [q, ...intent.synonyms].filter(Boolean);

    // Step 3: Build Prisma where clause with all search terms
    const searchClauses = searchTerms.flatMap((term) => [
      { name: { contains: term, mode: "insensitive" as const } },
      { description: { contains: term, mode: "insensitive" as const } },
      { tags: { has: term.toLowerCase() } },
      { sku: { contains: term, mode: "insensitive" as const } },
    ]);

    const categoryFilter = intent.category
      ? { category: { slug: intent.category } }
      : {};

    const priceFilter = intent.priceRange
      ? {
          price: {
            ...(intent.priceRange.min !== null && intent.priceRange.min !== undefined ? { gte: intent.priceRange.min } : {}),
            ...(intent.priceRange.max !== null && intent.priceRange.max !== undefined ? { lte: intent.priceRange.max } : {}),
          },
        }
      : {};

    // Step 4: Execute parallel search
    const [products, categories, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: {
          organizationId,
          published: true,
          OR: searchClauses,
          ...categoryFilter,
          ...priceFilter,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { select: { id: true, name: true, value: true, price: true, stock: true } },
        },
        orderBy: [
          { soldCount: "desc" },
          { rating: "desc" },
          { featured: "desc" },
        ],
        take: limit,
      }),

      prisma.category.findMany({
        where: {
          organizationId,
          name: { contains: q, mode: "insensitive" },
        },
        take: 4,
        select: { id: true, name: true, slug: true, image: true, _count: { select: { products: true } } },
      }),

      prisma.product.count({
        where: {
          organizationId,
          published: true,
          OR: searchClauses,
          ...categoryFilter,
          ...priceFilter,
        },
      }),
    ]);

    // Step 5: Build response with relevance scoring
    const scoredProducts = products.map((p) => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      const qLower = q.toLowerCase();

      if (nameLower === qLower) score += 100;
      else if (nameLower.startsWith(qLower)) score += 50;
      else if (nameLower.includes(qLower)) score += 30;

      // Boost by sales velocity
      score += Math.min(20, p.soldCount / 100);
      score += p.rating * 2;
      if (p.featured) score += 10;

      return { ...p, _relevanceScore: score };
    }).sort((a, b) => b._relevanceScore - a._relevanceScore);

    const result = {
      results: scoredProducts,
      categories,
      total: totalCount,
      intent: ai ? intent : null,
      query: q,
    };

    // Cache for 5 minutes
    await setCache(cacheKey, result, 300);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[AI Search]", err);
    return NextResponse.json({ success: false, error: "Search error" }, { status: 500 });
  }
}
