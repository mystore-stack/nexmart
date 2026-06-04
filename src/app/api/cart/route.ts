// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();
    const organizationId = await getOrganizationIdForUser(user);
    const items = await prisma.cartItem.findMany({
      where: { userId: user.userId, product: { organizationId } },
      include: { product: { include: { category: true, variants: true } }, variant: true },
    });
    return NextResponse.json({ success: true, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const organizationId = await getOrganizationIdForUser(user);
    const { productId, variantId, quantity } = cartItemSchema.parse(await req.json());

    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId, published: true },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: user.userId,
        productId,
        variantId: variantId ?? null,
      },
    });

    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: { increment: quantity } },
          include: { product: true, variant: true },
        })
      : await prisma.cartItem.create({
          data: {
            userId: user.userId,
            productId,
            variantId: variantId ?? undefined,
            quantity,
          },
          include: { product: true, variant: true },
        });

    return NextResponse.json({ success: true, item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
