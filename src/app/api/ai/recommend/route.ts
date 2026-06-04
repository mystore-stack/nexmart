import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthFromRequest } from "@/lib/auth";
import { getDefaultOrganizationId, getOrganizationIdForUser } from "@/lib/tenant";
import { getCache, setCache } from "@/lib/redis";
import { recommendationCandidates } from "@/lib/ai/commerce";
import { AI_CACHE_TTL } from "@/lib/ai/cache";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string().uuid().optional(),
  context: z.enum(["homepage", "related", "cart", "post_purchase", "chat"]).default("homepage"),
  limit: z.coerce.number().int().min(1).max(24).default(8),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req).catch(() => null);
    const query = schema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const organizationId = user ? await getOrganizationIdForUser(user) : await getDefaultOrganizationId();
    const cacheKey = `ai:recs:v2:${organizationId}:${user?.userId || "anon"}:${query.context}:${query.productId || "none"}:${query.limit}`;
    const cached = await getCache<unknown[]>(cacheKey);
    if (cached) return NextResponse.json({ success: true, products: cached, cached: true });

    const products = await recommendationCandidates({
      organizationId,
      userId: user?.userId,
      productId: query.productId,
      limit: query.limit,
    });

    await setCache(cacheKey, products, query.context === "homepage" ? AI_CACHE_TTL.SEARCH : AI_CACHE_TTL.RECOMMENDATIONS);
    return NextResponse.json({ success: true, products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur recommandations IA";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
