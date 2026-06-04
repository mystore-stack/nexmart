import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";

const syncSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .max(50)
    .default([]),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const organizationId = await getOrganizationIdForUser(user);
    const { items } = syncSchema.parse(await req.json());
    const mergedItems = Array.from(
      items
        .reduce((acc, item) => {
          const key = `${item.productId}:${item.variantId ?? ""}`;
          const existing = acc.get(key);
          acc.set(key, {
            ...item,
            quantity: Math.min(99, (existing?.quantity ?? 0) + item.quantity),
          });
          return acc;
        }, new Map<string, (typeof items)[number]>())
        .values()
    );

    await prisma.cartItem.deleteMany({ where: { userId: user.userId } });

    for (const item of mergedItems) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, organizationId, published: true },
        select: { id: true },
      });
      if (!product) continue;

      await prisma.cartItem.create({
        data: {
          userId: user.userId,
          productId: item.productId,
          variantId: item.variantId ?? undefined,
          quantity: item.quantity,
        },
      });
    }

    const synced = await prisma.cartItem.findMany({
      where: { userId: user.userId, product: { organizationId } },
      include: { product: { include: { category: true, variants: true } }, variant: true },
    });

    return NextResponse.json({ success: true, items: synced });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
