// src/app/api/mobile/orders/route.ts
// Mobile orders endpoint - Bearer token authentication
// Uses requireMobileAuth() - does NOT modify auth-api.ts or NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/mobile/orders
 * List authenticated user's orders
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const organizationId = session.organizationId;

    const page = Math.max(1, Number(new URL(req.url).searchParams.get('page')) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      where: {
        userId: session.userId,
        organizationId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
            variant: true,
          },
        },
        address: true,
        trackingHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.order.count({
      where: {
        userId: session.userId,
        organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    const status = err instanceof MobileAuthError ? err.statusCode : 401;
    console.error('[MOBILE ORDERS] GET error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

/**
 * POST /api/mobile/orders
 * Create a new order (mobile checkout)
 * Uses mobile Bearer authentication
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const organizationId = session.organizationId;

    const body = await req.json();

    // Validate order payload
    const { addressId, paymentMethod, items, notes, city, shippingCarrierId, shippingCost } = body;

    if (!addressId || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order payload', code: 'INVALID_PAYLOAD' },
        { status: 400 }
      );
    }

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.userId,
      },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found', code: 'ADDRESS_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate products and calculate totals
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        organizationId,
        published: true,
      },
      include: {
        variants: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some products not found or unavailable', code: 'PRODUCTS_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Calculate totals with server-side validation
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      const variant = item.variantId
        ? product?.variants.find((v) => v.id === item.variantId)
        : null;

      const price = variant?.price ?? product?.price ?? 0;
      const quantity = item.quantity || 1;
      const itemTotal = price * quantity;

      subtotal += itemTotal;

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity,
        price,
        name: product?.name || '',
      };
    });

    // Calculate shipping
    const deliveryCost = shippingCost || 0;
    const total = subtotal + deliveryCost;

    // Generate order number
    const orderNumber = `NM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.userId,
        organizationId,
        addressId,
        paymentMethod,
        paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
        status: 'PENDING',
        subtotal,
        shipping: deliveryCost,
        tax: 0,
        total,
        notes: notes || null,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
          })),
        },
        trackingHistory: {
          create: {
            status: 'PENDING',
            message: 'Order placed successfully',
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
            variant: true,
          },
        },
        address: true,
        trackingHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE ORDERS] POST error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
