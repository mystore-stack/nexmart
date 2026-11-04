// CMS Adapters - Connect CMS to real product, review, and order data
import { prisma } from '@/lib/prisma';
import { toAppProduct as toAppProductCore, toAppProducts, AppProduct as CoreAppProduct } from './product-adapter';

// Re-export for backward compatibility
export type AppProduct = CoreAppProduct;

export interface AppReview {
  id: string;
  user: string;
  rating: number;
  text: string;
  at: number;
  product: AppProduct;
}

// Re-export the standardized toAppProduct function
export { toAppProduct as toAppProductCore, toAppProducts };

/**
 * Convert Product model to AppProduct format expected by mobile app
 * This is now a wrapper around the centralized product-adapter
 */
export function toAppProduct(product: any, reviews: any[] = []): AppProduct {
  return toAppProductCore(product, reviews, 'fr');
}

/**
 * Fetch products by IDs for flash sales with real ratings
 */
export async function getProductsByIds(ids: string[]): Promise<AppProduct[]> {
  if (!ids || ids.length === 0) return [];

  const products = await (prisma as any).product.findMany({
    where: {
      id: { in: ids },
      published: true,
      isVisible: true,
    },
    include: {
      brand: {
        select: {
          name: true,
        },
      },
      category: true,
    },
  });

  // Fetch reviews for all products in parallel
  const productIds = products.map((p: any) => p.id);
  const reviews = await (prisma as any).review.findMany({
    where: {
      productId: { in: productIds },
      verifiedPurchase: true,
    },
    select: {
      productId: true,
      rating: true,
      verifiedPurchase: true,
    },
  });

  // Group reviews by product
  const reviewsMap = new Map<string, any[]>();
  reviews.forEach((r: any) => {
    if (!reviewsMap.has(r.productId)) {
      reviewsMap.set(r.productId, []);
    }
    reviewsMap.get(r.productId)!.push(r);
  });

  return toAppProducts(products, reviewsMap, 'fr');
}

/**
 * Fetch verified reviews with rating >= 4
 */
export async function getVerifiedReviews(limit: number = 6): Promise<AppReview[]> {
  const reviews = await (prisma as any).review.findMany({
    where: {
      verifiedPurchase: true,
      rating: { gte: 4 },
    },
    include: {
      product: {
        include: {
          brand: {
            select: {
              name: true,
            },
          },
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { rating: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });

  return reviews.map((review: any) => ({
    id: review.id,
    user: review.user.name || 'Anonymous',
    rating: review.rating,
    text: review.body,
    at: review.createdAt.getTime(),
    product: toAppProduct(review.product),
  }));
}

/**
 * Count orders for a user (for audience filtering)
 */
export async function countUserOrders(userId: string): Promise<number> {
  if (!userId) return 0;

  return (prisma as any).order.count({
    where: { userId },
  });
}

/**
 * Fetch bundles with product details
 */
export async function getBundles(limit: number = 6): Promise<any[]> {
  // For now, return empty array - bundles logic can be implemented later
  // based on BundleConfig or similar table
  return [];
}
