// src/lib/automation/review-automation.ts
// Review automation: 7-day review request, storage, duplicate prevention

import { prisma } from '../prisma';
import { addEmailJob } from '../queue';
import { logSuccess, logFailure, logPending } from './logger';
import { AutomationType, ReviewRequestStatus } from '@prisma/client';

/**
 * Architecture:
 * - Review automation triggers 7 days after order delivery
 * - Sends review request email
 * - Prevents duplicate reviews
 * - Stores product reviews
 * - Uses queue system for scheduled requests
 * - Logs all review automation actions
 */

/**
 * Trigger review request for delivered order
 * - Check if 7 days have passed since delivery
 * - Verify no review request already sent
 * - Send review request email
 * - Create review request record
 */
export async function triggerReviewRequest(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        Organization: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'DELIVERED') {
      return { success: false, message: 'Order not delivered yet' };
    }

    // Check if review request already exists
    const existingRequest = await prisma.reviewRequest.findFirst({
      where: {
        orderId,
        status: ReviewRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      return { success: false, message: 'Review request already sent' };
    }

    // Log pending automation
    await logPending(
      order.organizationId,
      AutomationType.REVIEW_REQUEST,
      'Order',
      orderId,
      'Review request initiated'
    );

    // Create review requests for each product
    for (const item of order.items) {
      // Check if user already reviewed this product
      const existingReview = await prisma.review.findUnique({
        where: {
          productId_userId: {
            productId: item.productId,
            userId: order.userId,
          },
        },
      });

      if (existingReview) {
        continue; // Skip if already reviewed
      }

      // Create review request
      await prisma.reviewRequest.create({
        data: {
          orderId: order.id,
          userId: order.userId,
          productId: item.productId,
          status: ReviewRequestStatus.PENDING,
          emailSent: false,
        },
      });

      // Queue review request email
      await addEmailJob({
        type: 'order_confirmation' as any, // Using existing type for now
        to: order.user.email,
        subject: `⭐ Votre avis compte : Avez-vous aimé ${item.product.name} ?`,
        template: 'review-request',
        data: {
          name: order.user.name,
          productName: item.product.name,
          productImage: item.product.images[0],
          orderId: order.orderNumber,
          reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/products/${item.product.slug}/review`,
        },
      });

      // Update email sent status
      await prisma.reviewRequest.updateMany({
        where: {
          orderId: order.id,
          productId: item.productId,
          userId: order.userId,
        },
        data: { emailSent: true },
      });

      // Log success
      await logSuccess(
        order.organizationId,
        AutomationType.REVIEW_REQUEST,
        'Product',
        item.productId,
        'Review request sent',
        {
          userId: order.userId,
          productId: item.productId,
          orderId: order.id,
        }
      );
    }

    return { success: true };
  } catch (error) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      await logFailure(
        order.organizationId,
        AutomationType.REVIEW_REQUEST,
        'Order',
        orderId,
        'Review request failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    throw error;
  }
}

/**
 * Find orders eligible for review requests
 * - Orders delivered 7+ days ago
 * - No review request sent yet
 * - Run via cron job
 */
export async function findEligibleReviewRequests() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deliveredOrders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        updatedAt: {
          lte: sevenDaysAgo,
        },
      },
      include: {
        items: true,
      },
    });

    const eligibleOrders = [];

    for (const order of deliveredOrders) {
      // Check if review request already sent
      const existingRequests = await prisma.reviewRequest.findMany({
        where: {
          orderId: order.id,
        },
      });

      // Only include orders where not all products have been reviewed
      const reviewedProductIds = existingRequests.map(r => r.productId);
      const unreviewedItems = order.items.filter(
        item => !reviewedProductIds.includes(item.productId)
      );

      if (unreviewedItems.length > 0) {
        eligibleOrders.push(order);
      }
    }

    return {
      total: eligibleOrders.length,
      orders: eligibleOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId,
        deliveredAt: o.updatedAt,
      })),
    };
  } catch (error) {
    console.error('[Find Eligible Review Requests] Failed:', error);
    throw error;
  }
}

/**
 * Process review response
 * - Called when user submits a review
 * - Update review request status
 * - Mark as verified purchase
 * - Update product rating
 */
export async function processReviewResponse(
  reviewRequestId: string,
  rating: number,
  title: string,
  body: string,
  images?: string[]
) {
  try {
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { id: reviewRequestId },
      include: {
        user: true,
        product: true,
        order: true,
      },
    });

    if (!reviewRequest) {
      throw new Error('Review request not found');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: reviewRequest.productId,
        userId: reviewRequest.userId,
        orderId: reviewRequest.orderId,
        rating,
        title,
        body,
        images: images || [],
        verifiedPurchase: true,
      },
    });

    // Update review request status
    await prisma.reviewRequest.update({
      where: { id: reviewRequestId },
      data: {
        status: ReviewRequestStatus.RESPONDED,
        respondedAt: new Date(),
      },
    });

    // Update product rating
    await updateProductRating(reviewRequest.productId);

    // Log success
    await logSuccess(
      'system',
      AutomationType.REVIEW_REQUEST,
      'Product',
      reviewRequest.productId,
      'Review processed',
      {
        reviewId: review.id,
        rating,
        userId: reviewRequest.userId,
      }
    );

    return { success: true, review };
  } catch (error) {
    console.error('[Process Review Response] Failed:', error);
    throw error;
  }
}

/**
 * Update product rating based on reviews
 */
async function updateProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
  });

  if (reviews.length === 0) {
    return;
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: averageRating,
      reviewCount: reviews.length,
    },
  });
}

/**
 * Check for duplicate reviews
 * - Prevent users from reviewing the same product twice
 */
export async function checkDuplicateReview(userId: string, productId: string) {
  const existingReview = await prisma.review.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });

  return existingReview !== null;
}

/**
 * Get review statistics
 * - Return review metrics and trends
 */
export async function getReviewStatistics(organizationId?: string) {
  const whereClause = organizationId
    ? { product: { organizationId } }
    : {};

  const [
    totalReviews,
    averageRating,
    ratingDistribution,
    recentReviews,
  ] = await Promise.all([
    prisma.review.count({ where: whereClause }),
    prisma.review.aggregate({
      where: whereClause,
      _avg: { rating: true },
    }),
    prisma.review.groupBy({
      by: ['rating'],
      where: whereClause,
      _count: true,
    }),
    prisma.review.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    totalReviews,
    averageRating: averageRating._avg.rating || 0,
    ratingDistribution: ratingDistribution.reduce((acc, item) => {
      acc[item.rating] = item._count;
      return acc;
    }, {} as Record<number, number>),
    recentReviews,
  };
}

/**
 * Process review automation queue job
 * - Called by worker to process queued review automation
 */
export async function processReviewAutomationJob(jobData: any) {
  const { type, orderId, reviewRequestId } = jobData;

  switch (type) {
    case 'review_request':
      return await triggerReviewRequest(orderId);
    case 'find_eligible':
      return await findEligibleReviewRequests();
    case 'process_response':
      return await processReviewResponse(
        reviewRequestId,
        jobData.rating,
        jobData.title,
        jobData.body,
        jobData.images
      );
    default:
      throw new Error(`Unknown review automation type: ${type}`);
  }
}
