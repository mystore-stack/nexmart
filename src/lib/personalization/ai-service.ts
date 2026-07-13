import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const recommendationSchema = z.object({
  productIds: z.array(z.string()),
  reasoning: z.string(),
  confidenceScore: z.number().min(0).max(1),
});

/**
 * Generate AI-powered product recommendations
 * Uses the Vercel AI SDK with OpenAI
 */
export async function generateAIRecommendations(
  organizationId: string,
  context: {
    userBehavior?: string;
    recentlyViewed?: string[];
    purchaseHistory?: string[];
    browseBehavior?: string;
  }
) {
  try {
    const model = process.env.AI_MODEL || "gpt-4-turbo";

    const prompt = `You are a product recommendation engine for an e-commerce store in Morocco (NexMart).
    
Context:
- User browsing behavior: ${context.browseBehavior || "Not provided"}
- Recently viewed products: ${context.recentlyViewed?.join(", ") || "None"}
- Purchase history: ${context.purchaseHistory?.join(", ") || "None"}

Based on this context, provide recommendations for products that would be most relevant to this user.
Consider cultural preferences, seasonal trends, and Moroccan market trends.
Return a JSON object with productIds (empty if unable to generate), reasoning, and confidenceScore.`;

    const result = await generateObject({
      model,
      schema: recommendationSchema,
      prompt,
      system:
        "You are an expert product recommendation engine. Always provide structured JSON responses.",
    });

    return result.object;
  } catch (error) {
    console.error("[AI_SERVICE] Recommendation generation failed:", error);
    return {
      productIds: [],
      reasoning: "Failed to generate recommendations",
      confidenceScore: 0,
    };
  }
}

/**
 * Get AI recommendations for display on homepage
 */
export async function getAIRecommendationsForHomepage(
  organizationId: string
) {
  try {
    const rules = await prisma.aIRecommendationRule.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: { displayPriority: "desc" },
      take: 3, // Top 3 rules
    });

    if (rules.length === 0) {
      return [];
    }

    // Get products for each rule
    const recommendations = await Promise.all(
      rules.map(async (rule) => {
        // If productIds are specified, use them
        if (rule.productIds.length > 0) {
          const products = await prisma.product.findMany({
            where: {
              id: {
                in: rule.productIds,
              },
              organizationId,
            },
            take: rule.maxResults,
          });

          return {
            rule,
            products,
            type: rule.strategy,
          };
        }

        // If categoryIds are specified, get products from those categories
        if (rule.categoryIds.length > 0) {
          const products = await prisma.product.findMany({
            where: {
              categoryId: {
                in: rule.categoryIds,
              },
              organizationId,
              published: true,
            },
            orderBy: {
              rating: "desc",
            },
            take: rule.maxResults,
          });

          return {
            rule,
            products,
            type: rule.strategy,
          };
        }

        // Default: get top-rated products
        const products = await prisma.product.findMany({
          where: {
            organizationId,
            published: true,
          },
          orderBy: {
            rating: "desc",
          },
          take: rule.maxResults,
        });

        return {
          rule,
          products,
          type: rule.strategy,
        };
      })
    );

    return recommendations.filter((rec) => rec.products.length > 0);
  } catch (error) {
    console.error("[AI_SERVICE] Homepage recommendations failed:", error);
    return [];
  }
}

/**
 * Calculate recommendation score for a product based on user context
 */
export function calculateRecommendationScore(
  product: any,
  context: {
    rating?: number;
    reviews?: number;
    soldCount?: number;
    recentlyViewedCount?: number;
    purchaseFrequency?: number;
  }
): number {
  let score = 0;

  // Rating component (0-25 points)
  if (context.rating) {
    score += (context.rating / 5) * 25;
  }

  // Popularity component (0-30 points)
  const maxSales = 10000;
  if (context.soldCount) {
    score += Math.min((context.soldCount / maxSales) * 30, 30);
  }

  // Reviews component (0-20 points)
  const maxReviews = 500;
  if (context.reviews) {
    score += Math.min((context.reviews / maxReviews) * 20, 20);
  }

  // Recent visibility component (0-15 points)
  if (context.recentlyViewedCount) {
    score += Math.min(context.recentlyViewedCount * 5, 15);
  }

  // Purchase frequency component (0-10 points)
  if (context.purchaseFrequency) {
    score += Math.min(context.purchaseFrequency * 2, 10);
  }

  return Math.min(score, 100);
}

/**
 * Get trending products using simple popularity metrics
 */
export async function getTrendingProducts(
  organizationId: string,
  limit = 5
) {
  try {
    const products = await prisma.product.findMany({
      where: {
        organizationId,
        published: true,
      },
      orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      recommendationScore: (product.rating / 5) * 100,
      trend: "rising",
    }));
  } catch (error) {
    console.error("[AI_SERVICE] Trending products failed:", error);
    return [];
  }
}
