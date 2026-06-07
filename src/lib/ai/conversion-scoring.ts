// src/lib/ai/conversion-scoring.ts
import { prisma } from "@/lib/prisma";
import { redis, getCache, setCache, CACHE_TTL, CACHE_KEYS } from "@/lib/redis";

/**
 * AI Conversion Scoring Engine
 * Predicts purchase probability based on user behavior and session data
 */

export interface ConversionScoreInput {
  userId?: string;
  sessionId?: string;
  sessionDuration?: number; // in seconds
  cartValue?: number;
  cartItemCount?: number;
  device?: string;
  source?: string;
  pastOrders?: number;
  pastOrderValue?: number;
  productViews?: number;
  lastActivity?: Date;
}

export interface ConversionScoreResult {
  score: number; // 0-100
  probability: number; // 0-1
  tier: "low" | "medium" | "high" | "very_high";
  factors: {
    sessionEngagement: number;
    cartValue: number;
    purchaseHistory: number;
    productInterest: number;
    recency: number;
  };
  recommendations: string[];
}

/**
 * Calculate conversion score based on multiple factors
 */
export async function calculateConversionScore(
  input: ConversionScoreInput
): Promise<ConversionScoreResult> {
  // Check cache first
  const cacheKey = input.userId
    ? CACHE_KEYS.user(input.userId)
    : input.sessionId
    ? `session:score:${input.sessionId}`
    : null;

  if (cacheKey) {
    const cached = await getCache<ConversionScoreResult>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Calculate individual factors
  const sessionEngagement = calculateSessionEngagement(input);
  const cartValue = calculateCartValueScore(input);
  const purchaseHistory = await calculatePurchaseHistoryScore(input);
  const productInterest = calculateProductInterestScore(input);
  const recency = calculateRecencyScore(input);

  // Weighted average of all factors
  const weights = {
    sessionEngagement: 0.25,
    cartValue: 0.20,
    purchaseHistory: 0.25,
    productInterest: 0.15,
    recency: 0.15,
  };

  const score =
    sessionEngagement * weights.sessionEngagement +
    cartValue * weights.cartValue +
    purchaseHistory * weights.purchaseHistory +
    productInterest * weights.productInterest +
    recency * weights.recency;

  const probability = score / 100;
  const tier = getScoreTier(score);
  const recommendations = generateRecommendations(tier, input);

  const result: ConversionScoreResult = {
    score: Math.round(score),
    probability,
    tier,
    factors: {
      sessionEngagement: Math.round(sessionEngagement),
      cartValue: Math.round(cartValue),
      purchaseHistory: Math.round(purchaseHistory),
      productInterest: Math.round(productInterest),
      recency: Math.round(recency),
    },
    recommendations,
  };

  // Cache result for 5 minutes
  if (cacheKey) {
    await setCache(cacheKey, result, CACHE_TTL.MEDIUM);
  }

  return result;
}

/**
 * Calculate session engagement score (0-100)
 */
function calculateSessionEngagement(input: ConversionScoreInput): number {
  let score = 0;

  // Session duration (max 30 points)
  if (input.sessionDuration) {
    const durationScore = Math.min(input.sessionDuration / 300, 1) * 30; // 5 min = full score
    score += durationScore;
  }

  // Device type (max 10 points)
  if (input.device === "desktop") {
    score += 10;
  } else if (input.device === "mobile") {
    score += 7;
  } else {
    score += 5;
  }

  // Source (max 10 points)
  if (input.source === "direct") {
    score += 10;
  } else if (input.source === "email") {
    score += 8;
  } else if (input.source === "social") {
    score += 6;
  } else {
    score += 4;
  }

  return Math.min(score, 100);
}

/**
 * Calculate cart value score (0-100)
 */
function calculateCartValueScore(input: ConversionScoreInput): number {
  let score = 0;

  // Cart value (max 50 points)
  if (input.cartValue) {
    const valueScore = Math.min(input.cartValue / 1000, 1) * 50; // 1000 MAD = full score
    score += valueScore;
  }

  // Cart item count (max 50 points)
  if (input.cartItemCount) {
    const itemScore = Math.min(input.cartItemCount / 5, 1) * 50; // 5 items = full score
    score += itemScore;
  }

  return Math.min(score, 100);
}

/**
 * Calculate purchase history score (0-100)
 */
async function calculatePurchaseHistoryScore(input: ConversionScoreInput): Promise<number> {
  if (!input.userId) return 30; // Default for anonymous users

  try {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: {
        orders: {
          where: { status: "DELIVERED" },
          select: { total: true, createdAt: true },
        },
      },
    });

    if (!user || user.orders.length === 0) {
      return 20; // New customer
    }

    const totalOrders = user.orders.length;
    const totalValue = user.orders.reduce((sum, order) => sum + order.total, 0);
    const lastOrder = user.orders[0];
    const daysSinceLastOrder = lastOrder
      ? (Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    let score = 0;

    // Order count (max 40 points)
    const orderScore = Math.min(totalOrders / 10, 1) * 40;
    score += orderScore;

    // Total value (max 30 points)
    const valueScore = Math.min(totalValue / 5000, 1) * 30;
    score += valueScore;

    // Recency (max 30 points) - recent purchases = higher score
    if (daysSinceLastOrder < 7) {
      score += 30;
    } else if (daysSinceLastOrder < 30) {
      score += 20;
    } else if (daysSinceLastOrder < 90) {
      score += 10;
    }

    return Math.min(score, 100);
  } catch (error) {
    console.error("[AI_CONVERSION] Error calculating purchase history:", error);
    return 30; // Default on error
  }
}

/**
 * Calculate product interest score (0-100)
 */
function calculateProductInterestScore(input: ConversionScoreInput): number {
  let score = 0;

  // Product views (max 60 points)
  if (input.productViews) {
    const viewScore = Math.min(input.productViews / 10, 1) * 60;
    score += viewScore;
  }

  // Cart items (max 40 points)
  if (input.cartItemCount) {
    const cartScore = Math.min(input.cartItemCount / 3, 1) * 40;
    score += cartScore;
  }

  return Math.min(score, 100);
}

/**
 * Calculate recency score (0-100)
 */
function calculateRecencyScore(input: ConversionScoreInput): number {
  if (!input.lastActivity) return 30;

  const minutesSinceActivity = (Date.now() - input.lastActivity.getTime()) / (1000 * 60);

  if (minutesSinceActivity < 5) {
    return 100; // Very recent
  } else if (minutesSinceActivity < 15) {
    return 80;
  } else if (minutesSinceActivity < 30) {
    return 60;
  } else if (minutesSinceActivity < 60) {
    return 40;
  } else if (minutesSinceActivity < 120) {
    return 20;
  } else {
    return 10; // Old activity
  }
}

/**
 * Get score tier based on score value
 */
function getScoreTier(score: number): "low" | "medium" | "high" | "very_high" {
  if (score >= 80) return "very_high";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Generate recommendations based on score tier
 */
function generateRecommendations(
  tier: "low" | "medium" | "high" | "very_high",
  input: ConversionScoreInput
): string[] {
  const recommendations: string[] = [];

  switch (tier) {
    case "low":
      recommendations.push("Offer 10-15% discount to incentivize purchase");
      recommendations.push("Show social proof (reviews, testimonials)");
      recommendations.push("Highlight free shipping threshold");
      recommendations.push("Send abandoned cart email after 30 minutes");
      break;

    case "medium":
      recommendations.push("Offer 5-10% discount or free shipping");
      recommendations.push("Show related products");
      recommendations.push("Display limited-time offer countdown");
      recommendations.push("Send abandoned cart email after 15 minutes");
      break;

    case "high":
      recommendations.push("Upsell premium products");
      recommendations.push("Show bundle deals");
      recommendations.push("Highlight fast delivery options");
      recommendations.push("Send abandoned cart email after 10 minutes");
      break;

    case "very_high":
      recommendations.push("Cross-sell complementary products");
      recommendations.push("Show premium payment options");
      recommendations.push("Highlight loyalty program benefits");
      recommendations.push("Send order confirmation immediately");
      break;
  }

  // Add specific recommendations based on input
  if (input.cartValue && input.cartValue > 500) {
    recommendations.push("Offer premium packaging for high-value orders");
  }

  if (input.cartItemCount && input.cartItemCount > 3) {
    recommendations.push("Suggest bundle discount for multiple items");
  }

  return recommendations;
}

/**
 * Get smart action based on conversion score
 */
export async function getSmartAction(input: ConversionScoreInput): Promise<{
  action: "discount" | "upsell" | "cross_sell" | "social_proof" | "urgency";
  value?: number;
  message: string;
}> {
  const score = await calculateConversionScore(input);

  switch (score.tier) {
    case "low":
      return {
        action: "discount",
        value: 15,
        message: "Get 15% off your first order!",
      };

    case "medium":
      return {
        action: "discount",
        value: 10,
        message: "Complete your order now and save 10%!",
      };

    case "high":
      return {
        action: "upsell",
        message: "Add a premium item to unlock free shipping!",
      };

    case "very_high":
      return {
        action: "cross_sell",
        message: "Customers who bought this also loved...",
      };

    default:
      return {
        action: "social_proof",
        message: "Join 10,000+ happy customers!",
      };
  }
}
