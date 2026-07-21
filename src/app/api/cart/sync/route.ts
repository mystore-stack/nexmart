import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

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
    const session = await requireAuth();
    const organizationId = session.organizationId;
    const { items } = syncSchema.parse(await req.json());
    
    console.log("[CART SYNC] Sync request for user:", {
      userId: session.userId,
      organizationId,
      itemCount: items.length,
    });
    
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

    await prisma.cartItem.deleteMany({ where: { userId: session.userId } });

    for (const item of mergedItems) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, organizationId, published: true },
        select: { id: true },
      });
      if (!product) continue;

      await prisma.cartItem.create({
        data: {
          userId: session.userId,
          productId: item.productId,
          variantId: item.variantId ?? undefined,
          quantity: item.quantity,
        },
      });
    }

    const synced = await prisma.cartItem.findMany({
      where: { userId: session.userId, product: { organizationId } },
      include: { product: { include: { category: true, variants: true } }, variant: true },
    });
    
    console.log("[CART SYNC] Sync completed:", {
      userId: session.userId,
      syncedItemCount: synced.length,
    });

    return NextResponse.json({ success: true, items: synced });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[CART SYNC] Error:", message);
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
