// src/app/api/mobile/cart/items/route.ts
// Add item to mobile cart
// Uses requireMobileAuth() - does NOT modify auth-api.ts or NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1).max(99).default(1),
  qty: z.number().int().min(1).max(99).optional(), // Mobile sends 'qty' instead of 'quantity'
}).transform((data) => ({
  productId: data.productId,
  variantId: data.variantId,
  quantity: data.qty ?? data.quantity, // Use qty if provided, otherwise quantity
}));

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/mobile/cart/items
 * Add a product to the cart with server-side validation
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const organizationId = session.organizationId;
    const { productId, variantId, quantity } = cartItemSchema.parse(await req.json());

    // Validate product exists, is published, and belongs to organization
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
        published: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        comparePrice: true,
        stock: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    // Validate variant if provided
    let variant = null;
    if (variantId) {
      variant = await prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      });

      if (!variant) {
        return NextResponse.json(
          { success: false, error: 'Variant not found' },
          { status: 404 }
        );
      }
    }

    // Check stock
    const availableStock = variant?.stock ?? product.stock;
    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock', code: 'OUT_OF_STOCK' },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: session.userId,
        productId,
        variantId: variantId ?? null,
      },
    });

    let item;

    if (existing) {
      // Update quantity if item exists
      const newQuantity = existing.quantity + quantity;
      if (newQuantity > 99) {
        return NextResponse.json(
          { success: false, error: 'Maximum quantity exceeded (99)' },
          { status: 400 }
        );
      }

      if (newQuantity > availableStock) {
        return NextResponse.json(
          { success: false, error: 'Insufficient stock for requested quantity', code: 'OUT_OF_STOCK' },
          { status: 400 }
        );
      }

      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: { category: true },
          },
          variant: true,
        },
      });
    } else {
      // Create new cart item
      item = await prisma.cartItem.create({
        data: {
          userId: session.userId,
          productId,
          variantId: variantId ?? undefined,
          quantity,
        },
        include: {
          product: {
            include: { category: true },
          },
          variant: true,
        },
      });
    }

    // Return formatted item
    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        qty: item.quantity, // Mobile uses 'qty' - include both for compatibility
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          comparePrice: item.product.comparePrice,
          stock: item.product.stock,
          images: item.product.images,
          category: {
            id: item.product.category.id,
            name: item.product.category.name,
            slug: item.product.category.slug,
          },
        },
        variant: item.variant ? {
          id: item.variant.id,
          name: item.variant.name,
          price: item.variant.price,
          stock: item.variant.stock,
        } : null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE CART] POST error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
