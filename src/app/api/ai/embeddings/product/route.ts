import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { upsertProductEmbedding } from "@/lib/ai/commerce";
import { assertAiRequestAllowed } from "@/lib/ai/security";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  productId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(25),
});

export async function POST(req: NextRequest) {
  try {
    assertAiRequestAllowed(req);
    const user = await requireAdminFromRequest(req);
    const organizationId = await getOrganizationIdForUser(user);
    const body = schema.parse(await req.json().catch(() => ({})));

    const productIds = body.productId
      ? [body.productId]
      : (
          await prisma.product.findMany({
            where: { organizationId, published: true },
            select: { id: true },
            orderBy: { updatedAt: "desc" },
            take: body.limit,
          })
        ).map((product) => product.id);

    const results = [];
    for (const productId of productIds) {
      const embedding = await upsertProductEmbedding(productId, organizationId);
      if (embedding) results.push({ productId, embeddingId: embedding.id });
    }

    return NextResponse.json({ success: true, indexed: results.length, results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur indexation IA";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
