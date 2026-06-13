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
    const organizationId = session.organizationId;
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
    const organizationId = session.organizationId;
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
      // Cleanup invalid cart items before processing order
      const cleanupResult = await cleanupInvalidCartItems(tx, session.userId, organizationId);
      
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
        
        // If cleanup removed items, prevent checkout and return user-friendly error
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

      // Rebuild order items from valid cart records instead of using stale parsedBody.items
      let validCartItems = await tx.cartItem.findMany({
        where: { userId: session.userId },
        include: { product: { include: { variants: true } }, variant: true },
      });

      // Product validation results for error reporting
      const productValidationResults: Array<{
        productId: string;
        exists: boolean;
        product: any;
        reason?: string;
      }> = [];

      console.log("[ORDERS API] Database cart items:", {
        userId: session.userId,
        itemCount: validCartItems.length,
        items: validCartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      console.log("[ORDERS API] Payload items:", {
        userId: session.userId,
        itemCount: parsedBody!.items.length,
        items: parsedBody!.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      logCheckout("database.cart.items", {
        userId: session.userId,
        itemCount: validCartItems.length,
        items: validCartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      logCheckout("payload.items", {
        userId: session.userId,
        itemCount: parsedBody!.items.length,
        items: parsedBody!.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      // Fallback to payload items if database cart is empty
      if (validCartItems.length === 0 && parsedBody!.items.length > 0) {
        console.log("[ORDERS API] Database cart empty, falling back to payload items");
        logCheckout("cart.fallback.to_payload", {
          userId: session.userId,
          reason: "database_cart_empty",
          payloadItemCount: parsedBody!.items.length,
        });

        const productIds = parsedBody!.items.map((i) => i.productId);
        
        console.log("[ORDER] Product IDs:", productIds);
        console.log("[ORDER] Product lookup filters", {
          productIds,
          organizationId,
          published: true,
        });
        
        // Phase 3: Verify product exists for each payload item
        for (const item of parsedBody!.items) {
          console.log("[ORDER] Validating Item", {
            productId: item.productId,
            quantity: item.quantity,
          });
          
          // STEP 1: Direct database verification
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { 
              id: true, 
              name: true, 
              organizationId: true, 
              published: true, 
              stock: true,
              lowStockAt: true,
            },
          });
          
          console.log("[PRODUCT LOOKUP]", product);
          console.log("[ORDER] Product Record:", product);
          
          if (!product) {
            console.log("[ORDER] Product does not exist in database", item.productId);
            productValidationResults.push({
              productId: item.productId,
              exists: false,
              product: null,
              reason: "PRODUCT_NOT_FOUND",
            });
            continue;
          }
          
          // STEP 4: Product state diagnostics
          console.log("[ORDER] Product state diagnostics:", {
            id: product.id,
            name: product.name,
            published: product.published,
            stock: product.stock,
            organizationId: product.organizationId,
          });
          
          // Phase 4: Verify organization (STEP 3)
          console.log("[ORDER] Organization comparison:", {
            checkoutOrganizationId: organizationId,
            productOrganizationId: product.organizationId,
            match: product.organizationId === organizationId,
          });
          
          // Phase 5: Verify published status
          console.log("[ORDER] Published status:", {
            productId: product.id,
            published: product.published,
          });
          
          // Phase 6: Verify stock rules
          console.log("[ORDER] Stock comparison:", {
            stock: product.stock,
            requestedQuantity: item.quantity,
            sufficient: product.stock >= item.quantity,
          });
          
          const validationReason = !product.published
            ? "PRODUCT_UNPUBLISHED"
            : product.organizationId !== organizationId
            ? "ORGANIZATION_MISMATCH"
            : product.stock < item.quantity
            ? "INSUFFICIENT_STOCK"
            : "UNKNOWN";
          
          productValidationResults.push({
            productId: item.productId,
            exists: true,
            product,
            reason: validationReason,
          });
        }
        
        // STEP 2: Validation query audit
        console.log("[CHECKOUT FILTERS]", {
          productIds,
          organizationId,
          published: true,
        });
        
        const products = await tx.product.findMany({
          where: { id: { in: productIds }, organizationId, published: true },
          include: { variants: true },
        });

        console.log("[ORDER] Products Found:", products);
        console.log("[ORDERS API] Found products for payload:", {
          productIds,
          foundCount: products.length,
        });

        const fallbackItems = parsedBody!.items
          .map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
              console.log("[ORDERS API] Product not found in filtered results:", item.productId);
              return null;
            }
            const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
            if (item.variantId && !variant) {
              console.log("[ORDERS API] Variant not found:", item.variantId);
              return null;
            }
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

        console.log("[ORDERS API] Valid fallback items:", {
          validItemCount: validCartItems.length,
        });

        logCheckout("payload.items.validated", {
          userId: session.userId,
          validItemCount: validCartItems.length,
          items: validCartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        });
      }

      logCheckout("final.items.used", {
        source: validCartItems.length > 0 && validCartItems[0].id.startsWith("payload_") ? "payload_fallback" : "database_cart",
        itemCount: validCartItems.length,
        items: validCartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      if (validCartItems.length === 0) {
        console.error("[ORDERS API] Cart empty error:", {
          userId: session.userId,
          databaseCartCount: validCartItems.length,
          payloadItemCount: parsedBody!.items.length,
        });
        
        // STEP 6: Auto cleanup - remove invalid cart items
        // STEP 7: Error reporting
        if (parsedBody!.items.length > 0) {
          const firstInvalidItem = parsedBody!.items[0];
          
          // Get validation result for this item
          const validationResult = productValidationResults.find(
            (r: any) => r.productId === firstInvalidItem.productId
          );
          
          let errorReason = "UNKNOWN";
          if (validationResult) {
            if (!validationResult.exists) {
              errorReason = "PRODUCT_NOT_FOUND";
            } else if (!validationResult.product.published) {
              errorReason = "PRODUCT_UNPUBLISHED";
            } else if (validationResult.product.organizationId !== organizationId) {
              errorReason = "ORGANIZATION_MISMATCH";
            } else if (validationResult.product.stock < firstInvalidItem.quantity) {
              errorReason = "INSUFFICIENT_STOCK";
            }
          }
          
          console.error("[ORDER] Validation failure details:", {
            productId: firstInvalidItem.productId,
            variantId: firstInvalidItem.variantId,
            errorReason,
            validationResult,
          });
          
          // STEP 6: Auto cleanup for invalid cart items
          if (errorReason === "PRODUCT_NOT_FOUND") {
            // Remove invalid item from database cart
            await tx.cartItem.deleteMany({
              where: {
                userId: session.userId,
                productId: firstInvalidItem.productId,
              },
            });
            
            console.log("[ORDER] Removed invalid cart item:", {
              userId: session.userId,
              productId: firstInvalidItem.productId,
            });
            
            throw new CheckoutError(
              `Product not found. The item has been removed from your cart.`,
              "PRODUCT_NOT_FOUND",
              400,
              {
                code: "PRODUCT_NOT_FOUND",
                productId: firstInvalidItem.productId,
                variantId: firstInvalidItem.variantId,
                reason: "Product record not found during validation",
                action: "REMOVE_FROM_CART",
              }
            );
          }
          
          throw new CheckoutError(
            `Product validation failed: ${errorReason}. Please check your cart and try again.`,
            "PRODUCT_VALIDATION_FAILED",
            400,
            {
              code: "PRODUCT_VALIDATION_FAILED",
              productId: firstInvalidItem.productId,
              variantId: firstInvalidItem.variantId,
              reason: errorReason,
              details: validationResult,
            }
          );
        }
        
        throw new CheckoutError(
          "Your cart is empty. Please add products before checkout.",
          "CART_EMPTY",
          400
        );
      }

      const productIds = validCartItems.map((i) => i.productId);
      
      // First, check which products exist at all (regardless of published status)
      const allProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, organizationId: true, published: true, name: true },
      });
      
      logCheckout("products.existence.check", {
        requestedProductIds: productIds,
        foundProductIds: allProducts.map((p) => p.id),
        missingProductIds: productIds.filter(
          (productId) => !allProducts.some((p) => p.id === productId)
        ),
        organizationMismatch: allProducts
          .filter((p) => p.organizationId !== organizationId)
          .map((p) => ({ id: p.id, organizationId: p.organizationId })),
        unpublishedProducts: allProducts
          .filter((p) => !p.published)
          .map((p) => ({ id: p.id, name: p.name })),
      });

      // Now fetch only valid products for order processing
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, organizationId, published: true },
        include: { variants: true },
      });
      
      logCheckout("products.lookup.result", {
        requestedProductIds: productIds,
        foundProductIds: products.map((product) => product.id),
        missingProductIds: productIds.filter(
          (productId) => !products.some((product) => product.id === productId)
        ),
        variantsByProduct: products.map((product) => ({
          productId: product.id,
          stock: product.stock,
          variantIds: product.variants.map((variant) => ({
            id: variant.id,
            stock: variant.stock,
          })),
        })),
      });

      let subtotal = 0;
      const orderItems = validCartItems.map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId);
        if (!product) {
          // This should not happen since we already cleaned up invalid cart items
          // But as a safety check, log and throw error
          const productExists = allProducts.some((p) => p.id === cartItem.productId);
          const existingProduct = allProducts.find((p) => p.id === cartItem.productId);
          
          if (!productExists) {
            logCheckout("product.not_found", {
              productId: cartItem.productId,
              reason: "deleted",
            });
            throw new CheckoutError(
              "Some products in your cart are no longer available. Please refresh your cart.",
              "PRODUCT_NOT_FOUND",
              400,
              {
                productId: cartItem.productId,
                reason: "deleted",
              }
            );
          } else if (existingProduct && !existingProduct.published) {
            logCheckout("product.not_found", {
              productId: cartItem.productId,
              productName: existingProduct.name,
              reason: "unpublished",
            });
            throw new CheckoutError(
              "Some products in your cart are no longer available. Please refresh your cart.",
              "PRODUCT_NOT_FOUND",
              400,
              {
                productId: cartItem.productId,
                productName: existingProduct.name,
                reason: "unpublished",
              }
            );
          } else if (existingProduct && existingProduct.organizationId !== organizationId) {
            logCheckout("product.not_found", {
              productId: cartItem.productId,
              productOrganizationId: existingProduct.organizationId,
              requestedOrganizationId: organizationId,
              reason: "organization_mismatch",
            });
            throw new CheckoutError(
              "Some products in your cart are no longer available. Please refresh your cart.",
              "PRODUCT_NOT_FOUND",
              400,
              {
                productId: cartItem.productId,
                productOrganizationId: existingProduct.organizationId,
                requestedOrganizationId: organizationId,
                reason: "organization_mismatch",
              }
            );
          } else {
            logCheckout("product.not_found", {
              productId: cartItem.productId,
              reason: "unknown",
            });
            throw new CheckoutError(
              "Some products in your cart are no longer available. Please refresh your cart.",
              "PRODUCT_NOT_FOUND",
              400,
              {
                productId: cartItem.productId,
                reason: "unknown",
              }
            );
          }
        }

        const variant = cartItem.variantId
          ? product.variants.find((v) => v.id === cartItem.variantId)
          : null;
        if (cartItem.variantId && !variant) {
          throw new CheckoutError(`Variante invalide pour ${product.name}`, "VARIANT_INVALID", 400, {
            productId: product.id,
            variantId: cartItem.variantId,
            availableVariantIds: product.variants.map((v) => v.id),
          });
        }

        const availableStock = variant?.stock ?? product.stock;
        logCheckout("stock.validation.item", {
          productId: product.id,
          productName: product.name,
          variantId: cartItem.variantId,
          requestedQuantity: cartItem.quantity,
          availableStock,
          productStock: product.stock,
          variantStock: variant?.stock,
          ok: availableStock >= cartItem.quantity,
        });
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
      logCheckout("stock.validation.passed", { subtotal, itemCount: orderItems.length });

      const coupon = await resolveCoupon(
        tx,
        organizationId,
        session.userId,
        body.couponCode,
        subtotal
      );
      logCheckout("coupon.validation.result", {
        couponCode: body.couponCode,
        couponId: coupon?.id,
        couponType: coupon?.type,
        couponValue: coupon?.value,
      });

      const discount = calculateCouponDiscount(coupon, subtotal);
      const shipping = getValidatedShippingCost(
        city,
        subtotal - discount,
        shippingCarrierId,
        body.shippingCost
      );
      const total = subtotal - discount + shipping;
      logCheckout("totals.calculated", {
        subtotal,
        discount,
        shipping,
        total,
        claimedShippingCost: body.shippingCost,
      });

      if (body.paymentMethod === "STRIPE") {
        await validateStripePayment({
          stripePaymentId: body.stripePaymentId,
          expectedTotal: total,
          userId: session.userId,
          organizationId,
        });
      } else {
        logCheckout("payment.validation.result", {
          paymentMethod: body.paymentMethod,
          stripeSkipped: true,
        });
      }

      for (const cartItem of validCartItems) {
        if (cartItem.variantId) {
          const variantUpdate = await tx.productVariant.updateMany({
            where: {
              id: cartItem.variantId,
              productId: cartItem.productId,
              stock: { gte: cartItem.quantity },
            },
            data: { stock: { decrement: cartItem.quantity } },
          });
          logCheckout("stock.update.variant", {
            productId: cartItem.productId,
            variantId: cartItem.variantId,
            quantity: cartItem.quantity,
            updatedRows: variantUpdate.count,
          });
          if (variantUpdate.count !== 1) {
            throw new CheckoutError("Stock variante insuffisant", "VARIANT_STOCK_UPDATE_FAILED", 400, {
              productId: cartItem.productId,
              variantId: cartItem.variantId,
              quantity: cartItem.quantity,
              updatedRows: variantUpdate.count,
            });
          }

          const productUpdate = await tx.product.updateMany({
            where: {
              id: cartItem.productId,
              organizationId,
              published: true,
            },
            data: { soldCount: { increment: cartItem.quantity } },
          });
          logCheckout("stock.update.productSoldCount", {
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            updatedRows: productUpdate.count,
          });
          if (productUpdate.count !== 1) {
            throw new CheckoutError("Produit introuvable", "PRODUCT_SOLD_COUNT_UPDATE_FAILED", 400, {
              productId: cartItem.productId,
              updatedRows: productUpdate.count,
            });
          }
        } else {
          const productUpdate = await tx.product.updateMany({
            where: {
              id: cartItem.productId,
              organizationId,
              published: true,
              stock: { gte: cartItem.quantity },
            },
            data: {
              stock: { decrement: cartItem.quantity },
              soldCount: { increment: cartItem.quantity },
            },
          });
          logCheckout("stock.update.product", {
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            updatedRows: productUpdate.count,
          });
          if (productUpdate.count !== 1) {
            throw new CheckoutError("Stock insuffisant", "PRODUCT_STOCK_UPDATE_FAILED", 400, {
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              updatedRows: productUpdate.count,
            });
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
      logCheckout("order.create.success", {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        total: createdOrder.total,
        paymentMethod: createdOrder.paymentMethod,
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
        logCheckout("cart.clear.success", { userId: session.userId, source: "database_cart" });
      } else {
        logCheckout("cart.clear.skipped", { userId: session.userId, source: "payload_fallback" });
      }
      return createdOrder;
        });

        // Publish real-time order event
        await publishEvent(PUBSUB_CHANNELS.orders, {
          type: "order.created",
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            userId: order.userId,
            status: order.status,
          },
        });

        // Update analytics counters
        const today = new Date().toISOString().split('T')[0];
        await Promise.all([
          incrementCounter(ANALYTICS_KEYS.dailyRevenue(today), Math.round(order.total)),
          incrementCounter(ANALYTICS_KEYS.dailyOrders(today)),
        ]);

        // Send Telegram notification
        await notifyNewOrder({
          orderNumber: order.orderNumber,
          customerName: address.name,
          total: order.total,
          city: address.city,
          itemCount: order.items.length,
          orderId: order.id,
        });

        return order;
      },
      30 // Lock TTL in seconds
    );

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
