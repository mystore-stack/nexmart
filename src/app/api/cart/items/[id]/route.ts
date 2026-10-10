// src/app/api/cart/items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUnifiedAuth } from "@/lib/unified-auth";

const updateSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireUnifiedAuth(req);
    const organizationId = session.organizationId;
    const { id } = params;

    const { quantity } = updateSchema.parse(await req.json());

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: { id, userId: session.userId },
      include: { 
        product: { 
          include: { variants: true } 
        },
        variant: true 
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Verify product exists and is published
    if (!cartItem.product || !cartItem.product.published) {
      return NextResponse.json(
        { success: false, error: "Product no longer available" },
        { status: 400 }
      );
    }

    // Verify sufficient stock
    const availableStock = cartItem.variant
      ? cartItem.variant.stock
      : cartItem.product.stock;

    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock" },
        { status: 400 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true, variant: true },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireUnifiedAuth(req);
    const { id } = params;

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: { id, userId: session.userId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
