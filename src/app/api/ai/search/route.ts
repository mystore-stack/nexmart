import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";
import { rateLimit } from "@/lib/api";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getCache, setCache } from "@/lib/redis";
import { createJson } from "@/lib/ai/openai";
import { SEARCH_INTENT_PROMPT } from "@/lib/ai/prompts";
import { semanticProductSearch } from "@/lib/ai/commerce";
import type { SearchIntent } from "@/lib/ai/types";
import { AI_CACHE_TTL } from "@/lib/ai/cache";
import { clientIp } from "@/lib/ai/security";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().min(2).max(200),
  limit: z.coerce.number().int().min(1).max(30).default(12),
  semantic: z.coerce.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    const ip = clientIp(req);
    const rl = await rateLimit(`ai:search:${session?.userId || ip}`, Number(process.env.AI_SEARCH_RPM || 60), 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Trop de recherches IA." }, { status: 429 });
    }

    const query = querySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const organizationId = session?.organizationId || await getDefaultOrganizationId();
    const normalizedQ = query.q.trim().toLowerCase().replace(/\s+/g, " ");
    const cacheKey = `ai:search:v3:${organizationId}:${normalizedQ}:${query.limit}:${query.semantic}`;
    const cached = await getCache<unknown>(cacheKey);
    if (cached) return NextResponse.json({ success: true, cached: true, ...cached });

    const fallbackIntent: SearchIntent = {
      query: query.q,
      normalizedQuery: query.q,
      language: "fr",
      category: null,
      budget: { min: null, max: null },
      attributes: [],
      intent: "browse",
    };
    const shouldUseAiIntent =
      process.env.AI_SEARCH_INTENT !== "false" &&
      (normalizedQ.split(" ").length >= 4 || /cheap|budget|gaming|rgb|compare|best|meilleur|رخيص|مقارنة/i.test(normalizedQ));
    const intent = shouldUseAiIntent
      ? await createJson<SearchIntent>(SEARCH_INTENT_PROMPT, { query: query.q }, fallbackIntent, AI_CACHE_TTL.SEARCH)
      : fallbackIntent;

    const searchTerms = [query.q, intent.normalizedQuery, ...intent.attributes].filter(Boolean);
    const lexicalWhere = {
      organizationId,
      published: true,
      ...(intent.budget?.min || intent.budget?.max
        ? {
            price: {
              ...(intent.budget.min ? { gte: intent.budget.min } : {}),
              ...(intent.budget.max ? { lte: intent.budget.max } : {}),
            },
          }
        : {}),
      OR: searchTerms.flatMap((term) => [
        { name: { contains: term, mode: "insensitive" as const } },
        { description: { contains: term, mode: "insensitive" as const } },
        { tags: { has: term.toLowerCase() } },
      ]),
    };

    const [lexical, semantic] = await Promise.all([
      prisma.product.findMany({
        where: lexicalWhere,
        include: { category: true, variants: true },
        orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
        take: query.limit,
      }),
      query.semantic && process.env.AI_SEMANTIC_SEARCH !== "false"
        ? semanticProductSearch(`${intent.normalizedQuery} ${intent.attributes.join(" ")}`, query.limit, organizationId).catch(() => [])
        : [],
    ]);

    const merged = new Map<string, any>();
    for (const product of semantic) merged.set(product.id, { ...product, _source: "semantic" });
    for (const product of lexical) {
      const existing = merged.get(product.id);
      merged.set(product.id, {
        ...product,
        _source: existing ? "hybrid" : "lexical",
        _semanticScore: existing?._semanticScore || 0,
      });
    }

    const products = Array.from(merged.values())
      .map((product) => ({
        ...product,
        _aiScore:
          (product._semanticScore || 0) * 100 +
          product.rating * 4 +
          Math.min(product.soldCount / 10, 15) +
          (product.featured ? 8 : 0),
      }))
      .sort((a, b) => b._aiScore - a._aiScore)
      .slice(0, query.limit);

    await prisma.aiEvent.create({
      data: {
        organizationId,
        ...(session?.userId ? { userId: session.userId } : {}),
        type: "SEARCH" as any,
        query: query.q,
        metadata: { intent, resultCount: products.length } as any,
      } as any,
    }).catch(() => {});

    const payload = { products, intent, query: query.q };
    await setCache(cacheKey, payload, AI_CACHE_TTL.SEARCH);
    return NextResponse.json({ success: true, ...payload });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur recherche IA";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
