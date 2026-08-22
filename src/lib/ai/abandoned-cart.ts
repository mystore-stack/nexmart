// src/lib/ai/abandoned-cart.ts
import { prisma } from "@/lib/prisma";
import { addAbandonedCartJob } from "@/lib/queue";
import { redis, setCache, CACHE_TTL, CACHE_KEYS } from "@/lib/redis";
import { calculateConversionScore } from "./conversion-scoring";

/**
 * Abandoned Cart AI System
 * Detects abandoned carts and triggers recovery actions
 */

export interface CartActivity {
  userId: string;
  cartItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    productName: string;
    productImage: string;
  }>;
  cartValue: number;
  lastActivity: Date;
  sessionId?: string;
}

export interface AbandonedCartTrigger {
  userId: string;
  triggerTime: Date;
  cartValue: number;
  itemCount: number;
  conversionScore: number;
  recommendedAction: "email" | "whatsapp" | "push" | "discount";
  discountValue?: number;
}

/**
 * Check for abandoned carts and trigger recovery actions
 * Run this as a scheduled job (e.g., every 5 minutes)
 */
export async function checkAbandonedCarts() {
  const ABANDONMENT_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds
  const now = new Date();
  const threshold = new Date(now.getTime() - ABANDONMENT_THRESHOLD);

  try {
    // Find users with active carts but no recent activity
    const recentCarts = await prisma.cartItem.groupBy({
      by: ["userId"],
      where: {
        updatedAt: {
          lt: threshold,
        },
      },
      having: {
        userId: {
          _count: {
            gt: 0,
          },
        },
      },
    });

    const triggers: AbandonedCartTrigger[] = [];

    for (const { userId } of recentCarts) {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true,
              published: true,
            },
          },
          variant: {
            select: {
              id: true,
              price: true,
              stock: true,
            },
          },
        },
      });

      // Filter only published and in-stock products
      const validCartItems = cartItems.filter(
        (item) => item.product.published && (item.product.stock > 0 || (item.variant && item.variant.stock > 0))
      );

      if (validCartItems.length === 0) continue;

      const cartValue = validCartItems.reduce(
        (sum, item) => sum + (item.variant?.price || item.product.price) * item.quantity,
        0
      );

      const lastActivity = validCartItems.reduce(
        (latest, item) => (item.updatedAt > latest ? item.updatedAt : latest),
        validCartItems[0].updatedAt
      );

      // Calculate conversion score to determine best action
      const scoreResult = await calculateConversionScore({
        userId,
        cartValue,
        cartItemCount: validCartItems.length,
        lastActivity,
      });

      // Determine recommended action based on score
      const recommendedAction = getRecommendedAction(scoreResult.score, cartValue);

      const trigger: AbandonedCartTrigger = {
        userId,
        triggerTime: now,
        cartValue,
        itemCount: validCartItems.length,
        conversionScore: scoreResult.score,
        recommendedAction,
        discountValue: recommendedAction === "discount" ? getDiscountValue(scoreResult.score) : undefined,
      };

      triggers.push(trigger);

      // Add to background job queue
      await addAbandonedCartJob({
        userId,
        cartItems: validCartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.variant?.price || item.product.price,
        })),
        cartValue,
        lastActivity,
      });

      // Cache trigger to prevent duplicate processing
      const cacheKey = `abandoned_cart:${userId}:${now.getTime()}`;
      await setCache(cacheKey, trigger, CACHE_TTL.HOUR);
    }

    return triggers;
  } catch (error) {
    console.error("[ABANDONED_CART] Error checking abandoned carts:", error);
    return [];
  }
}

/**
 * Track cart activity for abandonment detection
 * Call this whenever user interacts with cart
 */
export async function trackCartActivity(userId: string, sessionId?: string) {
  const activityKey = CACHE_KEYS.cart(userId);
  const activityData = {
    lastActivity: new Date().toISOString(),
    sessionId,
  };

  await setCache(activityKey, activityData, CACHE_TTL.HOUR);
}

/**
 * Get recommended action based on conversion score and cart value
 */
function getRecommendedAction(score: number, cartValue: number): "email" | "whatsapp" | "push" | "discount" {
  // High value carts get priority actions
  if (cartValue > 1000) {
    if (score < 40) return "discount"; // Low score + high value = strong discount
    if (score < 60) return "whatsapp"; // Medium score + high value = personal outreach
    return "email"; // High score = standard email
  }

  // Medium value carts
  if (cartValue > 500) {
    if (score < 40) return "discount";
    return "email";
  }

  // Low value carts
  if (score < 30) return "push"; // Low score + low value = push notification
  return "email";
}

/**
 * Get discount value based on conversion score
 */
function getDiscountValue(score: number): number {
  if (score < 30) return 20; // Very low score = 20% discount
  if (score < 50) return 15; // Low score = 15% discount
  if (score < 70) return 10; // Medium score = 10% discount
  return 5; // High score = 5% discount
}

/**
 * Get abandoned cart statistics for dashboard
 */
export async function getAbandonedCartStats() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [totalCarts, dayCarts, weekCarts, totalValue] = await Promise.all([
      prisma.cartItem.groupBy({
        by: ["userId"],
        _count: true,
      }),
      prisma.cartItem.groupBy({
        by: ["userId"],
        where: { updatedAt: { gte: dayAgo } },
        _count: true,
      }),
      prisma.cartItem.groupBy({
        by: ["userId"],
        where: { updatedAt: { gte: weekAgo } },
        _count: true,
      }),
      prisma.cartItem.aggregate({
        _sum: { quantity: true },
      }),
    ]);

    return {
      totalCarts: totalCarts.length,
      dayCarts: dayCarts.length,
      weekCarts: weekCarts.length,
      totalItems: totalValue._sum.quantity || 0,
    };
  } catch (error) {
    console.error("[ABANDONED_CART] Error getting stats:", error);
    return {
      totalCarts: 0,
      dayCarts: 0,
      weekCarts: 0,
      totalItems: 0,
    };
  }
}

/**
 * Send abandoned cart recovery message
 * This would be called by the BullMQ worker
 */
export async function sendAbandonedCartRecovery(
  userId: string,
  cartItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>,
  cartValue: number,
  action: "email" | "whatsapp" | "push" | "discount",
  discountValue?: number
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, phone: true },
    });

    if (!user) return;

    const message = buildRecoveryMessage(user.name, cartItems, cartValue, discountValue);

    switch (action) {
      case "email":
        // TODO: Send email via your email service
        console.log(`[ABANDONED_CART] Email to ${user.email}:`, message);
        break;

      case "whatsapp":
        // TODO: Send WhatsApp message via your WhatsApp service
        if (user.phone) {
          console.log(`[ABANDONED_CART] WhatsApp to ${user.phone}:`, message);
        }
        break;

      case "push":
        // TODO: Send push notification via your push service
        console.log(`[ABANDONED_CART] Push to ${userId}:`, message);
        break;

      case "discount":
        // TODO: Send discount code via email
        console.log(`[ABANDONED_CART] Discount email to ${user.email}:`, message);
        break;
    }
  } catch (error) {
    console.error("[ABANDONED_CART] Error sending recovery:", error);
  }
}

/**
 * Build personalized recovery message
 */
function buildRecoveryMessage(
  userName: string,
  cartItems: Array<{ productId: string; quantity: number; price: number }>,
  cartValue: number,
  discountValue?: number
): string {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const formattedValue = cartValue.toFixed(2);

  if (discountValue) {
    return `Hi ${userName}, you left ${itemCount} item(s) worth ${formattedValue} MAD in your cart. Complete your order now with ${discountValue}% off!`;
  }

  return `Hi ${userName}, you left ${itemCount} item(s) worth ${formattedValue} MAD in your cart. Don't miss out - complete your order now!`;
}
