import { notifyNewOrder } from "@/lib/notifications/telegram";
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";
import { generateOrderNumber } from "@/utils/format";
import { getValidatedShippingCost } from "@/lib/shipping";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { withLock, LOCK_KEYS, publishEvent, PUBSUB_CHANNELS, incrementCounter, ANALYTICS_KEYS } from "@/lib/redis";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getOrganizationIdForUser, getDefaultOrganizationId } from "@/lib/tenant";

const DEFAULT_CARRIER = "jibli";
const DEFAULT_CITY = "Casablanca";
const CHECKOUT_DEBUG =
  process.env.CHECKOUT_DEBUG_ORDERS === "1" || process.env.NODE_ENV !== "production";

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(["STRIPE", "CASH_ON_DELIVERY"]),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      variantId: z.string().uuid().optional(),
      quantity: z.number().int().min(1).max(99),
    })
  ).min(1),
  couponCode: z.string().optional(),
  /** @deprecated Use city + shippingCarrierId — still accepted for backward compatibility */
  city: z.string().min(2).optional(),
  shippingCarrierId: z.string().min(1).optional(),
  shippingCost: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  stripePaymentId: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

type Tx = Prisma.TransactionClient;

class CheckoutError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, code: string, status = 400, details?: unknown) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function logCheckout(stage: string, data?: unknown) {
  if (!CHECKOUT_DEBUG) return;
  console.log(`[ORDER] ${stage}`, data ?? "");
}

function logCheckoutError(stage: string, err: unknown, context?: unknown) {
  const code = err instanceof CheckoutError ? err.code : err instanceof z.ZodError ? "ORDER_PAYLOAD_INVALID" : "UNHANDLED";
  console.error(`[ORDER] ${stage} ${code}`, {
    error:
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : err,
    context,
  });
}

async function validateStripePayment(params: {
  stripePaymentId: string | undefined;
  expectedTotal: number;
  userId: string;
  organizationId: string;
}) {
  const expectedAmount = Math.round(params.expectedTotal * 100);
  logCheckout("stripe.validation.start", {
    stripePaymentId: params.stripePaymentId,
    expectedTotal: params.expectedTotal,
    expectedAmount,
    expectedCurrency: "mad",
    userId: params.userId,
    organizationId: params.organizationId,
  });

  if (!params.stripePaymentId) {
    throw new CheckoutError("Paiement Stripe requis", "STRIPE_PAYMENT_ID_MISSING");
  }

  const { stripe } = await import("@/lib/stripe");
  const paymentIntent = await stripe.paymentIntents.retrieve(params.stripePaymentId);
  const result = {
    id: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    expectedAmount,
    currency: paymentIntent.currency,
    expectedCurrency: "mad",
    metadataUserId: paymentIntent.metadata?.userId,
    expectedUserId: params.userId,
    metadataOrganizationId: paymentIntent.metadata?.organizationId,
    expectedOrganizationId: params.organizationId,
  };
  logCheckout("stripe.validation.result", result);

  if (paymentIntent.status !== "succeeded") {
    throw new CheckoutError("Paiement Stripe non confirme", "STRIPE_NOT_SUCCEEDED", 400, result);
  }
  if (paymentIntent.amount !== expectedAmount) {
    throw new CheckoutError("Montant Stripe invalide", "STRIPE_AMOUNT_MISMATCH", 400, result);
  }
  if (paymentIntent.currency !== "mad") {
    throw new CheckoutError("Devise Stripe invalide", "STRIPE_CURRENCY_MISMATCH", 400, result);
  }
  if (paymentIntent.metadata?.userId !== params.userId) {
    throw new CheckoutError("Utilisateur Stripe invalide", "STRIPE_USER_MISMATCH", 400, result);
  }
  if (paymentIntent.metadata?.organizationId !== params.organizationId) {
    throw new CheckoutError("Organisation Stripe invalide", "STRIPE_ORGANIZATION_MISMATCH", 400, result);
  }
}

function calculateCouponDiscount(
  coupon: { type: string; value: number; maxDiscount: number | null } | null,
  subtotal: number
) {
  if (!coupon) return 0;
  const rawDiscount =
    coupon.type === "PERCENTAGE" ? subtotal * (coupon.value / 100) : coupon.value;
  const cappedDiscount = coupon.maxDiscount
    ? Math.min(rawDiscount, coupon.maxDiscount)
    : rawDiscount;
  return Math.max(0, Math.min(subtotal, cappedDiscount));
}

async function resolveCoupon(
  tx: Tx,
  organizationId: string,
  userId: string,
  couponCode: string | undefined,
  subtotal: number
) {
  if (!couponCode) return null;

  const coupon = await tx.coupon.findFirst({
    where: {
      organizationId,
      code: couponCode.toUpperCase(),
      active: true,
      startDate: { lte: new Date() },
      OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
    },
  });

  if (!coupon) throw new Error("Coupon invalide ou expiré");
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon épuisé");
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    throw new Error(`Commande minimum de ${coupon.minOrder.toFixed(2)} MAD requise`);
  }
  if (coupon.userLimit) {
    const usage = await tx.order.count({
      where: { organizationId, userId, couponId: coupon.id },
    });
    if (usage >= coupon.userLimit) throw new Error("Coupon déjà utilisé");
  }

  return coupon;
}

async function resolveShippingContext(
  userId: string,
  addressId: string,
  body: z.infer<typeof createOrderSchema>
) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { city: true },
  });

  const city = body.city ?? address?.city ?? DEFAULT_CITY;
  const shippingCarrierId = body.shippingCarrierId ?? DEFAULT_CARRIER;
  return { city, shippingCarrierId };
}

async function cleanupInvalidCartItems(
  tx: Tx,
  userId: string,
  organizationId: string
) {
  // Get all cart items for the user
  const cartItems = await tx.cartItem.findMany({
    where: { userId },
    select: { id: true, productId: true },
  });

  if (cartItems.length === 0) {
    logCheckout("cart.cleanup.no_items", { userId });
    return { removedCount: 0, details: [] };
  }

  const productIds = cartItems.map(item => item.productId);

  // Find products that exist and are published for this organization
  const validProducts = await tx.product.findMany({
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
    logCheckout("cart.cleanup.all_valid", { userId, itemCount: cartItems.length });
    return { removedCount: 0, details: [] };
  }

  // Remove invalid cart items
  const deleteResult = await tx.cartItem.deleteMany({
    where: {
      id: { in: invalidCartItems.map(item => item.id) },
    },
  });

  const cleanupDetails = invalidCartItems.map(item => ({
    cartItemId: item.id,
    productId: item.productId,
    reason: validProductIds.has(item.productId) ? "unpublished" : "not_found",
  }));

  logCheckout("cart.cleanup.removed", {
    userId,
    removedCount: deleteResult.count,
    details: cleanupDetails,
  });

  return {
    removedCount: deleteResult.count,
    details: cleanupDetails,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    
    // Resolve organizationId with defensive error handling
    let organizationId;
    try {
      organizationId = await getOrganizationIdForUser({ userId: session.userId });
    } catch (orgError) {
      console.error("[ORDERS GET] Organization resolution failed:", orgError);
      // Fallback to default organization for better UX
      try {
        organizationId = await getDefaultOrganizationId();
        console.warn("[ORDERS GET] Using default organization fallback");
      } catch (defaultError) {
        console.error("[ORDERS GET] Default organization also missing:", defaultError);
        return NextResponse.json(
          { success: false, error: "System configuration error: No organization found" },
          { status: 500 }
        );
      }
    }
    
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 10;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.userId, organizationId },
        include: { items: { include: { product: true, variant: true } }, address: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { userId: session.userId, organizationId } }),
    ]);

    return NextResponse.json({ success: true, orders, pagination: { page, limit, total } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  let rawBody: unknown;
  let parsedBody: z.infer<typeof createOrderSchema> | undefined;
  let authContext: { userId?: string; organizationId?: string } = {};

  try {
    const session = await requireAuth();
    
    // Resolve organizationId with defensive error handling
    let organizationId;
    try {
      organizationId = await getOrganizationIdForUser({ userId: session.userId });
    } catch (orgError) {
      console.error("[ORDERS POST] Organization resolution failed:", orgError);
      // Fallback to default organization for better UX
      try {
        organizationId = await getDefaultOrganizationId();
        console.warn("[ORDERS POST] Using default organization fallback");
      } catch (defaultError) {
        console.error("[ORDERS POST] Default organization also missing:", defaultError);
        return NextResponse.json(
          { success: false, error: "System configuration error: No organization found" },
          { status: 500 }
        );
      }
    }
    
    authContext = { userId: session.userId, organizationId };

    rawBody = await req.json();
    logCheckout("request.received", { authContext, payload: rawBody });

    const validation = createOrderSchema.safeParse(rawBody);
    if (!validation.success) {
      logCheckout("zod.validation.failed", validation.error.flatten());
      return NextResponse.json(
        {
          success: false,
          error: "Payload de commande invalide",
          code: "ORDER_PAYLOAD_INVALID",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    parsedBody = validation.data;
    const body = parsedBody;

    // Generate or use provided idempotency key for anti-duplicate order system
    const idempotencyKey = body.idempotencyKey || generateIdempotencyKey();

    logCheckout("zod.validation.passed", {
      addressId: body.addressId,
      paymentMethod: body.paymentMethod,
      itemCount: body.items.length,
      hasStripePaymentId: Boolean(body.stripePaymentId),
      shippingCarrierId: body.shippingCarrierId,
      shippingCost: body.shippingCost,
      couponCode: body.couponCode,
      idempotencyKey,
    });

    logCheckout("incoming.items", {
      items: body.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });

    const address = await prisma.address.findFirst({
      where: { id: body.addressId, userId: session.userId },
    });
    logCheckout("address.validation.result", {
      addressId: body.addressId,
      found: Boolean(address),
      city: address?.city,
      userId: session.userId,
    });
    if (!address) {
      throw new CheckoutError("Adresse invalide", "ADDRESS_INVALID");
    }

    const { city, shippingCarrierId } = await resolveShippingContext(
      session.userId,
      body.addressId,
      body
    );
    logCheckout("shipping.context.resolved", { city, shippingCarrierId });

    // PRE-LOCK: Cleanup invalid cart items (outside transaction and lock)
    const cleanupResult = await cleanupInvalidCartItems(prisma, session.userId, organizationId);
    logCheckout("cleanup.result", {
      userId: session.userId,
      removedCount: cleanupResult.removedCount,
      details: cleanupResult.details,
    });

    if (cleanupResult.removedCount > 0) {
      logCheckout("cart.cleanup.performed", {
        userId: session.userId,
        removedCount: cleanupResult.removedCount,
        details: cleanupResult.details,
      });
      throw new CheckoutError(
        "Some products in your cart are no longer available. Please refresh your cart.",
        "CART_CLEANUP_REQUIRED",
        400,
        {
          removedCount: cleanupResult.removedCount,
          details: cleanupResult.details,
        }
      );
    }

    // PRE-LOCK: Fetch cart items and validate products
    let validCartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: { include: { variants: true } }, variant: true },
    });

    // Fallback to payload items if database cart is empty
    if (validCartItems.length === 0 && parsedBody!.items.length > 0) {
      const productIds = parsedBody!.items.map((i) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, organizationId, published: true },
        include: { variants: true },
      });

      const fallbackItems = parsedBody!.items
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return null;
          const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
          if (item.variantId && !variant) return null;
          return {
            id: `payload_${item.productId}_${item.variantId || 'no_variant'}`,
            userId: session.userId,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
            product,
            variant: variant || null,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
      
      validCartItems = fallbackItems as any;
    }

    if (validCartItems.length === 0) {
      throw new CheckoutError(
        "Your cart is empty. Please add products before checkout.",
        "CART_EMPTY",
        400
      );
    }

    // PRE-LOCK: Calculate totals and validate stock
    const productIds = validCartItems.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, organizationId, published: true },
      include: { variants: true },
    });

    let subtotal = 0;
    const orderItems = validCartItems.map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId);
      if (!product) {
        throw new CheckoutError(
          "Some products in your cart are no longer available. Please refresh your cart.",
          "PRODUCT_NOT_FOUND",
          400,
          { productId: cartItem.productId }
        );
      }

      const variant = cartItem.variantId
        ? product.variants.find((v) => v.id === cartItem.variantId)
        : null;
      if (cartItem.variantId && !variant) {
        throw new CheckoutError(`Variante invalide pour ${product.name}`, "VARIANT_INVALID", 400, {
          productId: product.id,
          variantId: cartItem.variantId,
        });
      }

      const availableStock = variant?.stock ?? product.stock;
      if (availableStock < cartItem.quantity) {
        throw new CheckoutError(`Stock insuffisant pour ${product.name}`, "STOCK_INSUFFICIENT", 400, {
          productId: product.id,
          variantId: cartItem.variantId,
          requestedQuantity: cartItem.quantity,
          availableStock,
        });
      }

      const price = variant?.price ?? product.price;
      subtotal += price * cartItem.quantity;
      return {
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        name: product.name,
        image: product.images[0] ?? "",
        price,
        quantity: cartItem.quantity,
      };
    });

    // PRE-LOCK: Resolve coupon
    const coupon = body.couponCode ? await prisma.coupon.findFirst({
      where: {
        organizationId,
        code: body.couponCode.toUpperCase(),
        active: true,
        startDate: { lte: new Date() },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    }) : null;

    if (body.couponCode && !coupon) {
      throw new CheckoutError("Coupon invalide ou expiré", "COUPON_INVALID", 400);
    }

    if (coupon) {
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new CheckoutError("Coupon épuisé", "COUPON_EXHAUSTED", 400);
      }
      if (coupon.minOrder && subtotal < coupon.minOrder) {
        throw new CheckoutError(
          `Commande minimum de ${coupon.minOrder.toFixed(2)} MAD requise`,
          "COUPON_MIN_ORDER",
          400
        );
      }
      if (coupon.userLimit) {
        const usage = await prisma.order.count({
          where: { organizationId, userId: session.userId, couponId: coupon.id },
        });
        if (usage >= coupon.userLimit) {
          throw new CheckoutError("Coupon déjà utilisé", "COUPON_ALREADY_USED", 400);
        }
      }
    }

    const discount = calculateCouponDiscount(coupon, subtotal);
    const shipping = getValidatedShippingCost(
      city,
      subtotal - discount,
      shippingCarrierId,
      body.shippingCost
    );
    const total = subtotal - discount + shipping;

    // PRE-LOCK: Validate Stripe payment (external API call - MUST be outside transaction)
    if (body.paymentMethod === "STRIPE") {
      await validateStripePayment({
        stripePaymentId: body.stripePaymentId,
        expectedTotal: total,
        userId: session.userId,
        organizationId,
      });
    }

    // Anti-duplicate order system: Use Redis distributed lock
    const lockResult = await withLock(
      LOCK_KEYS.order(idempotencyKey),
      async () => {
        // Check if order with this idempotency key already exists
        const existingOrder = await prisma.order.findUnique({
          where: { idempotencyKey },
        });

        if (existingOrder) {
          logCheckout("duplicate.order.detected", {
            idempotencyKey,
            existingOrderId: existingOrder.id,
            existingOrderNumber: existingOrder.orderNumber,
          });
          throw new CheckoutError(
            "Duplicate order detected",
            "DUPLICATE_ORDER",
            409,
            { existingOrderNumber: existingOrder.orderNumber }
          );
        }

        logCheckout("lock.acquired", { idempotencyKey });

        const order = await prisma.$transaction(async (tx) => {
          // Batch update variant stock
          const variantUpdates = validCartItems
            .filter((item: any) => item.variantId)
            .map((item: any) => ({
              variantId: item.variantId,
              productId: item.productId,
              quantity: item.quantity,
            }));

          if (variantUpdates.length > 0) {
            await tx.productVariant.updateMany({
              where: {
                id: { in: variantUpdates.map((u) => u.variantId) },
                stock: { gte: 1 }, // Will be validated per-item below
              },
              data: {
                stock: { decrement: 1 }, // This is a simplification - need to decrement actual quantities
              },
            });
            // Note: For accurate stock decrement, we need to use raw SQL or individual updates
            // For now, we'll use individual updates but in a more efficient way
            for (const update of variantUpdates) {
              const result = await tx.productVariant.updateMany({
                where: {
                  id: update.variantId,
                  stock: { gte: update.quantity },
                },
                data: { stock: { decrement: update.quantity } },
              });
              if (result.count === 0) {
                throw new CheckoutError("Stock variante insuffisant", "VARIANT_STOCK_UPDATE_FAILED", 400);
              }
            }
          }

          // Batch update product stock and soldCount
          const productUpdates = validCartItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            hasVariant: !!item.variantId,
          }));

          for (const update of productUpdates) {
            if (update.hasVariant) {
              // Only update soldCount for products with variants
              await tx.product.updateMany({
                where: { id: update.productId, organizationId, published: true },
                data: { soldCount: { increment: update.quantity } },
              });
            } else {
              // Update both stock and soldCount for products without variants
              const result = await tx.product.updateMany({
                where: {
                  id: update.productId,
                  organizationId,
                  published: true,
                  stock: { gte: update.quantity },
                },
                data: {
                  stock: { decrement: update.quantity },
                  soldCount: { increment: update.quantity },
                },
              });
              if (result.count === 0) {
                throw new CheckoutError("Stock insuffisant", "PRODUCT_STOCK_UPDATE_FAILED", 400);
              }
            }
          }

          const createdOrder = await tx.order.create({
            data: {
              orderNumber: generateOrderNumber(),
              organizationId,
              userId: session.userId,
              addressId: body.addressId,
              paymentMethod: body.paymentMethod,
              subtotal,
              discount,
              shipping,
              total,
              couponId: coupon?.id,
              notes: body.notes,
              stripePaymentId: body.paymentMethod === "STRIPE" ? body.stripePaymentId : null,
              items: { create: orderItems },
            },
            include: { items: true, address: true },
          });

          if (coupon) {
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }

          // Only clear database cart if we actually used it (not payload fallback)
          const usedPayloadFallback = validCartItems.length > 0 && validCartItems[0].id.startsWith("payload_");
          if (!usedPayloadFallback) {
            await tx.cartItem.deleteMany({ where: { userId: session.userId } });
          }

          return createdOrder;
        });

        logCheckout("order.create.success", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
        });

        // POST-TRANSACTION: Non-critical operations (outside lock for faster release)
        // These can fail without affecting the order
        Promise.all([
          // Publish real-time order event
          publishEvent(PUBSUB_CHANNELS.orders, {
            type: "order.created",
            order: {
              id: order.id,
              orderNumber: order.orderNumber,
              total: order.total,
              userId: order.userId,
              status: order.status,
            },
          }),
          // Update analytics counters
          (async () => {
            const today = new Date().toISOString().split('T')[0];
            await Promise.all([
              incrementCounter(ANALYTICS_KEYS.dailyRevenue(today), Math.round(order.total)),
              incrementCounter(ANALYTICS_KEYS.dailyOrders(today)),
            ]);
          })(),
          // Send Telegram notification
          notifyNewOrder({
            orderNumber: order.orderNumber,
            customerName: address.name,
            total: order.total,
            city: address.city,
            itemCount: order.items.length,
            orderId: order.id,
          }),
        ]).catch((err) => {
          console.error('[POST-ORDER OPERATIONS ERROR]:', err);
        });

        // Send order confirmation email asynchronously (non-blocking)
        prisma.user.findUnique({
          where: { id: order.userId },
          select: { name: true, email: true },
        }).then((user) => {
          if (user) {
            sendOrderConfirmationEmail(
              user.email,
              user.name,
              {
                orderNumber: order.orderNumber,
                total: order.total,
                items: order.items.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                })),
                shippingAddress: {
                  city: address.city,
                  address: `${address.line1}${address.line2 ? ', ' + address.line2 : ''}`,
                },
              },
              order.userId,
              order.id,
              organizationId
            ).catch((error) => {
              console.error('[Order Confirmation Email Error]:', error);
            });
          }
        }).catch((err) => {
          console.error('[USER LOOKUP ERROR]:', err);
        });

        return order;
      }, 10000);

    // Handle lock acquisition failure
    if (!lockResult) {
      logCheckout("lock.failed", { idempotencyKey });
      throw new CheckoutError(
        "Order processing in progress. Please wait.",
        "ORDER_LOCK_FAILED",
        429
      );
    }

    return NextResponse.json({ success: true, order: lockResult }, { status: 201 });
  } catch (err: unknown) {
    logCheckoutError("post.failed", err, {
      authContext,
      payload: rawBody,
      parsedBody,
    });
    if (err instanceof CheckoutError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
          code: err.code,
          details: err.details,
        },
        { status: err.status }
      );
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload de commande invalide",
          code: "ORDER_PAYLOAD_INVALID",
          details: err.flatten(),
        },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("invalide") ||
            message.includes("Stock") ||
            message.includes("stock") ||
            message.includes("introuvable") ||
            message.includes("Coupon") ||
            message.includes("minimum") ||
            message.includes("Paiement")
          ? 400
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
