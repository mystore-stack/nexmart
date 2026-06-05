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

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const organizationId = await getOrganizationIdForUser(user);

    // Get all cart items for the user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      select: { id: true, productId: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ success: true, removedCount: 0, details: [] });
    }

    const productIds = cartItems.map(item => item.productId);

    // Find products that exist and are published for this organization
    const validProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        organizationId,
        published: true,
      },
      select: { id: true },
    });

    const validProductIds = new Set(validProducts.map(p => p.id));
    const invalidCartItems = cartItems.filter(item => !validProductIds.has(item.productId));

    if (invalidCartItems.length === 0) {
      return NextResponse.json({ success: true, removedCount: 0, details: [] });
    }

    // Remove invalid cart items
    const deleteResult = await prisma.cartItem.deleteMany({
      where: {
        id: { in: invalidCartItems.map(item => item.id) },
      },
    });

    const cleanupDetails = invalidCartItems.map(item => ({
      cartItemId: item.id,
      productId: item.productId,
      reason: validProductIds.has(item.productId) ? "unpublished" : "not_found",
    }));

    console.log("[CART CLEANUP] Removed invalid cart items:", {
      userId: user.userId,
      removedCount: deleteResult.count,
      details: cleanupDetails,
    });

    return NextResponse.json({
      success: true,
      removedCount: deleteResult.count,
      details: cleanupDetails,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
