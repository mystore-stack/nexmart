// src/app/api/mobile/cart/items/[id]/route.ts
// Update quantity or delete a cart item
// Uses requireMobileAuth() - does NOT modify auth-api.ts or NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(99).optional(),
  qty: z.number().int().min(1).max(99).optional(),
}).transform((data) => ({
  quantity: data.qty ?? data.quantity, // Use qty if provided, otherwise quantity
}));

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * PATCH /api/mobile/cart/items/[id]
 * Update the quantity of a cart item
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireMobileAuth(req);
    const { id: itemId } = await params;

    // Validate UUID format
    if (!uuidRegex.test(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cart item ID format' },
        { status: 400 }
      );
    }

    const { quantity } = updateQuantitySchema.parse(await req.json());

    // Verify item belongs to the authenticated user
    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId: session.userId,
        product: {
          organizationId: session.organizationId,
          published: true,
        },
      },
      include: {
        product: {
          include: { category: true },
        },
        variant: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Check stock
    const availableStock = item.variant?.stock ?? item.product.stock;
    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock', code: 'OUT_OF_STOCK' },
        { status: 400 }
      );
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: { category: true },
        },
        variant: true,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem.id,
        productId: updatedItem.productId,
        variantId: updatedItem.variantId,
        quantity: updatedItem.quantity,
        qty: updatedItem.quantity, // Mobile uses 'qty' - include both for compatibility
        product: {
          id: updatedItem.product.id,
          name: updatedItem.product.name,
          slug: updatedItem.product.slug,
          price: updatedItem.product.price,
          comparePrice: updatedItem.product.comparePrice,
          stock: updatedItem.product.stock,
          images: updatedItem.product.images,
          category: {
            id: updatedItem.product.category.id,
            name: updatedItem.product.category.name,
            slug: updatedItem.product.category.slug,
          },
        },
        variant: updatedItem.variant ? {
          id: updatedItem.variant.id,
          name: updatedItem.variant.name,
          price: updatedItem.variant.price,
          stock: updatedItem.variant.stock,
        } : null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE CART] PATCH error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

/**
 * DELETE /api/mobile/cart/items/[id]
 * Delete a cart item
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireMobileAuth(req);
    const { id: itemId } = await params;

    // Validate UUID format
    if (!uuidRegex.test(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cart item ID format' },
        { status: 400 }
      );
    }

    // Verify item belongs to the authenticated user
    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId: session.userId,
      },
      select: { id: true },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Delete the item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      removedId: itemId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE CART] DELETE error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
