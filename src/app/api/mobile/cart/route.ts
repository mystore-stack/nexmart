// src/app/api/mobile/cart/route.ts
// Mobile cart endpoint - SEPARATE from web /api/cart
// Uses requireMobileAuth() - does NOT modify auth-api.ts or NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/mobile/cart
 * Read the authenticated user's cart with server-side totals
 * Delivery is NOT calculated here (requires address/city from checkout)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const organizationId = session.organizationId;

    // Fetch cart items with product and variant data
    const items = await prisma.cartItem.findMany({
      where: {
        userId: session.userId,
        product: { organizationId, published: true },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate server-side totals
    let subtotal = 0;
    let savings = 0;
    let itemCount = 0;

    const processedItems = items.map((item) => {
      const price = item.variant?.price ?? item.product.price;
      const comparePrice = item.product.comparePrice;
      const itemTotal = price * item.quantity;
      const itemSavings = comparePrice && comparePrice > price
        ? (comparePrice - price) * item.quantity
        : 0;

      subtotal += itemTotal;
      savings += itemSavings;
      itemCount += item.quantity;

      return {
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
      };
    });

    // Delivery is NOT calculated here - requires city/address from checkout
    // Mobile app should call /api/shipping/calculate with city during checkout
    const freeShippingThreshold = 500; // MAD

    return NextResponse.json({
      success: true,
      items: processedItems,
      subtotal,
      discount: 0, // Coupons not implemented for mobile yet
      savings,
      delivery: 0, // Mobile expects a number, will be updated during checkout
      deliveryCalculated: false,
      total: subtotal, // Without delivery until checkout
      freeShippingThreshold,
      itemCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    const status = err instanceof MobileAuthError ? err.statusCode : 401;
    console.error('[MOBILE CART] GET error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
