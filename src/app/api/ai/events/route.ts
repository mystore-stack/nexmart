import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { getAuthFromRequest } from "@/lib/auth";
import { getDefaultOrganizationId, getOrganizationIdForUser } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { assertAiRequestAllowed, clientIp } from "@/lib/ai/security";
import { rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.object({
  type: z.enum(["VIEW", "SEARCH", "ADD_TO_CART", "PURCHASE", "WISHLIST", "CHAT", "RECOMMENDATION_CLICK"]),
  productId: z.string().uuid().optional(),
  query: z.string().max(300).optional(),
  score: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    assertAiRequestAllowed(req);
    const user = await getAuthFromRequest(req).catch(() => null);
    const rl = await rateLimit(`ai:event:${user?.userId || clientIp(req)}`, 120, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Too many AI events" }, { status: 429 });
    }
    const organizationId = user ? await getOrganizationIdForUser(user) : await getDefaultOrganizationId();
    const body = schema.parse(await req.json());

    await prisma.aiEvent.create({
      data: {
        organizationId,
        ...(user?.userId ? { userId: user.userId } : {}),
        ...(body.productId ? { productId: body.productId } : {}),
        type: body.type as any,
        ...(body.query ? { query: body.query } : {}),
        ...(body.score !== undefined ? { score: body.score } : {}),
        ...(body.metadata ? { metadata: body.metadata as any } : {}),
      } as any,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur événement IA";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
