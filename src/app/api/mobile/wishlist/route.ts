// src/app/api/mobile/wishlist/route.ts
// Mobile wishlist endpoint - Bearer token authentication
// Uses requireMobileAuth() - does NOT modify auth-api.ts or NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

const wishlistSchema = z.object({
  productId: z.string().min(1),
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/mobile/wishlist
 * Get user's wishlist
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const organizationId = session.organizationId;

    // Fetch wishlist items (WishlistItem has no product relation, only productId)
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Extract productIds
    const productIds = wishlistItems.map((item) => item.productId);

    // Fetch products with organization scoping
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        organizationId,
        published: true,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    // Map products to wishlist items
    const items = wishlistItems
      .map((wishlistItem) => {
        const product = products.find((p) => p.id === wishlistItem.productId);
        if (!product) return null;
        return {
          ...wishlistItem,
          product,
        };
      })
      .filter((item) => item !== null);

    return NextResponse.json({ success: true, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE WISHLIST] GET error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

/**
 * POST /api/mobile/wishlist
 * Add or remove item from wishlist (toggle)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const organizationId = session.organizationId;
    const { productId } = wishlistSchema.parse(await req.json());

    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId, published: true },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.userId,
          productId,
        },
      },
    });

    if (existing) {
      // Remove if exists
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: 'removed' });
    }

    // Add if doesn't exist
    await prisma.wishlistItem.create({
      data: { userId: session.userId, productId },
    });
    return NextResponse.json({ success: true, action: 'added' }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE WISHLIST] POST error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

/**
 * DELETE /api/mobile/wishlist
 * Remove item from wishlist
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const { productId } = wishlistSchema.parse(await req.json());

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.userId,
          productId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Item not in wishlist' },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, action: 'removed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE WISHLIST] DELETE error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
