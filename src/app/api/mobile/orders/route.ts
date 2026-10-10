// src/app/api/mobile/orders/route.ts
// Mobile orders endpoint - Bearer token authentication
// Uses requireMobileAuth() - does NOT modify auth-api.ts or NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';
import { z } from 'zod';
import { generateOrderNumber } from '@/utils/format';
import { getValidatedShippingCost } from '@/lib/shipping';
import { generateIdempotencyKey } from '@/lib/idempotency';
import { withLock, LOCK_KEYS, publishEvent, PUBSUB_CHANNELS, isRedisEnabled } from '@/lib/redis';
import { notifyNewOrder } from '@/lib/notifications/telegram';

const createOrderSchema = z.object({
  addressId: z.string().uuid('Invalid address ID format'),
  paymentMethod: z.enum(['CASH_ON_DELIVERY']),
  items: z.array(
    z.object({
      productId: z.string().uuid('Invalid product ID format'),
      variantId: z.string().uuid('Invalid variant ID format').optional().nullable(),
      quantity: z.number().int().min(1).max(99),
    })
  ).min(1, 'At least one item required'),
  city: z.string().min(2).optional(),
  shippingCarrierId: z.string().min(1).optional(),
  shippingCost: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  idempotencyKey: z.string().optional(),
});

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
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE ORDERS] GET error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

/**
 * POST /api/mobile/orders
 * Create a new order (mobile checkout)
 * Uses mobile Bearer authentication with:
 * - Prisma transaction for atomicity
 * - Stock validation
 * - Server-side shipping cost validation
 * - Idempotency to prevent duplicate orders
 * - Redis locking for concurrency control
 * - Telegram notifications
 * - Event publishing for cache invalidation
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const validation = createOrderSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid order payload', code: 'INVALID_PAYLOAD', details: validation.error.errors },
      { status: 400 }
    );
  }

  const { addressId, paymentMethod, items, notes, city, shippingCarrierId, shippingCost, idempotencyKey: clientKey } = validation.data;
  const idempotencyKey = clientKey || generateIdempotencyKey();
  const lockKey = LOCK_KEYS.order(idempotencyKey);

  try {
    const session = await requireMobileAuth(req);
    const organizationId = session.organizationId;

    // Reject unsupported payment methods (Stripe not supported in mobile yet)
    if (paymentMethod === 'STRIPE') {
      return NextResponse.json(
        { success: false, error: 'Card payment not available in mobile app', code: 'PAYMENT_UNSUPPORTED' },
        { status: 400 }
      );
    }

    // Check for existing order BEFORE acquiring lock (database-level idempotency)
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey },
      select: { id: true, orderNumber: true, userId },
    });

    if (existingOrder) {
      // Verify order belongs to authenticated user
      if (existingOrder.userId !== session.userId) {
        console.error('[MOBILE ORDERS] Idempotency key belongs to different user:', { idempotencyKey, actualUserId: existingOrder.userId, sessionUserId: session.userId });
        return NextResponse.json(
          { success: false, error: 'Invalid idempotency key', code: 'IDEMPOTENCY_KEY_INVALID' },
          { status: 400 }
        );
      }

      console.log('[MOBILE ORDERS] Duplicate order detected:', { idempotencyKey, existingOrderNumber: existingOrder.orderNumber });
      // Fetch full order details for response
      const fullOrder = await prisma.order.findUnique({
        where: { id: existingOrder.id },
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
            },
          },
          address: true,
          trackingHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return NextResponse.json(
        { success: true, order: fullOrder, duplicate: true, idempotencyKey, message: 'Order already exists' },
        { status: 200 }
      );
    }

    // Execute order creation with distributed lock for concurrency control
    const result = await withLock(lockKey, async () => {
      // Use Prisma transaction for atomicity
      return await prisma.$transaction(async (tx) => {
        // Double-check idempotency within transaction (handles race condition)
        const existingOrderInTx = await tx.order.findUnique({
          where: { idempotencyKey },
          select: { id: true, orderNumber: true, userId },
        });

        if (existingOrderInTx) {
          // Verify order belongs to authenticated user
          if (existingOrderInTx.userId !== session.userId) {
            console.error('[MOBILE ORDERS] Idempotency key belongs to different user in transaction:', { idempotencyKey, actualUserId: existingOrderInTx.userId, sessionUserId: session.userId });
            throw new MobileAuthError('Invalid idempotency key', 400, 'IDEMPOTENCY_KEY_INVALID');
          }

          console.log('[MOBILE ORDERS] Duplicate order detected in transaction:', { idempotencyKey, existingOrderNumber: existingOrderInTx.orderNumber });
          // Fetch full order details
          const fullOrder = await tx.order.findUnique({
            where: { id: existingOrderInTx.id },
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
                },
              },
              address: true,
              trackingHistory: {
                orderBy: { createdAt: 'asc' },
              },
            },
          });
          return fullOrder;
        }

        // Validate address belongs to user
        const address = await tx.address.findFirst({
          where: {
            id: addressId,
            userId: session.userId,
          },
        });

        if (!address) {
          throw new MobileAuthError('Address not found', 404, 'ADDRESS_NOT_FOUND');
        }

        // Resolve city and carrier
        const orderCity = city || address.city || 'Casablanca';
        const carrierId = shippingCarrierId || 'jibli';

        // Validate products and stock
        const productIds = items.map((i) => i.productId);
        const products = await tx.product.findMany({
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
          throw new MobileAuthError('Some products not found or unavailable', 404, 'PRODUCTS_NOT_FOUND');
        }

        // Calculate totals with server-side validation and stock checks
        let subtotal = 0;
        const orderItems = items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) {
            throw new MobileAuthError(`Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
          }

          const variant = item.variantId
            ? product.variants.find((v) => v.id === item.variantId)
            : null;

          if (item.variantId && !variant) {
            throw new MobileAuthError(`Variant ${item.variantId} not found for product ${product.name}`, 404, 'VARIANT_NOT_FOUND');
          }

          // Stock validation
          const availableStock = variant?.stock ?? product.stock;
          if (availableStock < item.quantity) {
            throw new MobileAuthError(
              `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`,
              400,
              'STOCK_INSUFFICIENT'
            );
          }

          const price = variant?.price ?? product.price;
          const itemTotal = price * item.quantity;
          subtotal += itemTotal;

          return {
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            price,
            name: product.name,
            image: (product.images && product.images.length > 0) ? product.images[0] : '',
          };
        });

        // Decrement stock atomically within transaction (concurrency-safe)
        for (const item of orderItems) {
          if (item.variantId) {
            const variantUpdate = await tx.productVariant.updateMany({
              where: {
                id: item.variantId,
                productId: item.productId,
                stock: { gte: item.quantity },
              },
              data: { stock: { decrement: item.quantity } },
            });

            if (variantUpdate.count !== 1) {
              throw new MobileAuthError(
                `Variant stock update failed for ${item.name}. Please try again.`,
                400,
                'VARIANT_STOCK_UPDATE_FAILED'
              );
            }

            const productUpdate = await tx.product.updateMany({
              where: {
                id: item.productId,
                organizationId,
                published: true,
              },
              data: { soldCount: { increment: item.quantity } },
            });

            if (productUpdate.count !== 1) {
              throw new MobileAuthError(
                `Product sold count update failed for ${item.name}. Please try again.`,
                400,
                'PRODUCT_SOLD_COUNT_UPDATE_FAILED'
              );
            }
          } else {
            const productUpdate = await tx.product.updateMany({
              where: {
                id: item.productId,
                organizationId,
                published: true,
                stock: { gte: item.quantity },
              },
              data: {
                stock: { decrement: item.quantity },
                soldCount: { increment: item.quantity },
              },
            });

            if (productUpdate.count !== 1) {
              throw new MobileAuthError(
                `Product stock update failed for ${item.name}. Please try again.`,
                400,
                'PRODUCT_STOCK_UPDATE_FAILED'
              );
            }
          }
        }

        // Server-side shipping cost validation
        const validatedShippingCost = getValidatedShippingCost(orderCity, subtotal, carrierId, shippingCost);

        const total = subtotal + validatedShippingCost;

        // Generate order number using website utility
        const orderNumber = generateOrderNumber();

        // Create order with all required fields
        let order;
        try {
          order = await tx.order.create({
            data: {
              orderNumber,
              userId: session.userId,
              organizationId,
              addressId,
              paymentMethod,
              paymentStatus: 'UNPAID', // Match website convention for CASH_ON_DELIVERY
              status: 'PENDING',
              subtotal,
              shipping: validatedShippingCost,
              tax: 0,
              total,
              notes: notes || null,
              idempotencyKey, // Prevent duplicate orders
              items: {
                create: orderItems.map((item) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                  price: item.price,
                  name: item.name,
                  image: item.image, // REQUIRED FIELD
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
                },
              },
              address: true,
              trackingHistory: {
                orderBy: { createdAt: 'asc' },
              },
            },
          });
        } catch (err: unknown) {
          // Handle Prisma unique constraint violation (P2002)
          const error = err as { code?: string; message?: string };
          if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
            console.log('[MOBILE ORDERS] Unique constraint violation, fetching existing order:', { idempotencyKey });
            // Fetch the existing order created by concurrent request
            const existingOrder = await tx.order.findUnique({
              where: { idempotencyKey },
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
                  },
                },
                address: true,
                trackingHistory: {
                  orderBy: { createdAt: 'asc' },
                },
              },
            });

            if (existingOrder) {
              // Verify order belongs to authenticated user
              if (existingOrder.userId !== session.userId) {
                console.error('[MOBILE ORDERS] Idempotency key belongs to different user after P2002:', { idempotencyKey, actualUserId: existingOrder.userId, sessionUserId: session.userId });
                throw new MobileAuthError('Invalid idempotency key', 400, 'IDEMPOTENCY_KEY_INVALID');
              }
              // Return existing order - transaction will rollback stock changes
              return existingOrder;
            }
          }
          // Re-throw if not a unique constraint error or order not found
          throw err;
        }

        // Clear cart after successful order creation
        await tx.cartItem.deleteMany({
          where: { userId: session.userId },
        });

        return order;
      });
    });

    if (!result) {
      // Lock could not be acquired (concurrent request in progress)
      return NextResponse.json(
        { success: false, error: 'Order processing in progress, please try again', code: 'LOCK_FAILED' },
        { status: 429 }
      );
    }

    const order = result;

    // Send Telegram notification (non-blocking)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    });

    if (user) {
      notifyNewOrder({
        orderNumber: order.orderNumber,
        customerName: user.name,
        total: order.total,
        city: order.address?.city,
        itemCount: order.items.length,
        orderId: order.id,
      }).catch((err) => console.error('[MOBILE ORDERS] Telegram notification failed:', err));
    }

    // Publish event for cache invalidation (non-blocking)
    if (isRedisEnabled) {
      publishEvent(PUBSUB_CHANNELS.orders, {
        type: 'order.created',
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.userId,
        organizationId,
      }).catch((err) => console.error('[MOBILE ORDERS] Event publish failed:', err));
    }

    return NextResponse.json({
      success: true,
      order,
      idempotencyKey, // Return key so client can reuse for retries
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    const code = err instanceof MobileAuthError ? err.code : 'SERVER_ERROR';

    console.error('[MOBILE ORDERS] POST error:', { message, code, status });

    return NextResponse.json({ success: false, error: message, code }, { status });
  }
}
