// src/lib/automation/customer-automation.ts
// Customer automation: welcome email, discount coupon, classification, LTV tracking

import { prisma } from '../prisma';
import { sendWelcomeEmail } from '../email';
import { addEmailJob } from '../queue';
import { logSuccess, logFailure, logPending } from './logger';
import { AutomationType, CustomerSegmentType, LoyaltyTier } from '@prisma/client';

/**
 * Architecture:
 * - Customer automation triggers on user registration and order completion
 * - Sends welcome email with first-order discount coupon
 * - Automatically classifies customers (New, Regular, VIP)
 * - Tracks customer lifetime value (LTV)
 * - Uses queue system for async processing
 * - Logs all customer automation actions
 */

/**
 * Trigger welcome automation for new user
 * - Send welcome email
 * - Generate first-order discount coupon
 * - Classify as NEW customer
 * - Initialize loyalty points
 */
export async function triggerWelcomeAutomation(userId: string, organizationId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Log pending automation
    await logPending(
      organizationId,
      AutomationType.CUSTOMER_WELCOME,
      'User',
      userId,
      'Welcome automation initiated'
    );

    // Queue welcome email
    await addEmailJob({
      type: 'order_confirmation' as any, // Using existing type for now
      to: user.email,
      subject: `🎉 Bienvenue sur NexMart, ${user.name.split(' ')[0]} !`,
      template: 'welcome',
      data: {
        name: user.name,
      },
    });

    // Generate first-order discount coupon
    const couponCode = `WELCOME10-${Date.now().toString(36).toUpperCase()}`;
    const coupon = await prisma.coupon.create({
      data: {
        organizationId,
        code: couponCode,
        description: 'First order discount - 10% off',
        type: 'PERCENTAGE',
        value: 10,
        minOrder: 100,
        userLimit: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        active: true,
      },
    });

    // Initialize loyalty points
    await prisma.loyaltyPoints.create({
      data: {
        userId,
        organizationId,
        points: 0,
        pointsEarned: 0,
        pointsRedeemed: 0,
        tier: LoyaltyTier.BRONZE,
        lifetimeValue: 0,
        orderCount: 0,
      },
    });

    // Classify as NEW customer
    await prisma.customerSegment.create({
      data: {
        organizationId,
        userId,
        segment: CustomerSegmentType.NEW,
        criteria: {
          registrationDate: user.createdAt,
        },
        score: 0,
      },
    });

    // Log success
    await logSuccess(
      organizationId,
      AutomationType.CUSTOMER_WELCOME,
      'User',
      userId,
      'Welcome automation completed',
      {
        userEmail: user.email,
        couponCode,
      }
    );

    return { success: true, couponCode };
  } catch (error) {
    await logFailure(
      organizationId,
      AutomationType.CUSTOMER_WELCOME,
      'User',
      userId,
      'Welcome automation failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Update customer lifetime value after order
 * - Calculate total spent by customer
 * - Update loyalty points
 * - Re-classify customer segment
 * - Check for VIP progression
 */
export async function updateCustomerLTV(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        Organization: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate total lifetime value
    const orders = await prisma.order.findMany({
      where: {
        userId: order.userId,
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    const lifetimeValue = orders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;

    // Update loyalty points
    const pointsEarned = Math.floor(order.total); // 1 point per 1 DH
    const loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: {
        userId_organizationId: {
          userId: order.userId,
          organizationId: order.organizationId,
        },
      },
    });

    if (loyaltyPoints) {
      const newPoints = loyaltyPoints.points + pointsEarned;
      const newTier = calculateLoyaltyTier(newPoints);

      await prisma.loyaltyPoints.update({
        where: { id: loyaltyPoints.id },
        data: {
          points: newPoints,
          pointsEarned: loyaltyPoints.pointsEarned + pointsEarned,
          lifetimeValue,
          orderCount,
          tier: newTier,
        },
      });

      // Log tier progression
      if (newTier !== loyaltyPoints.tier) {
        await logSuccess(
          order.organizationId,
          AutomationType.LOYALTY_POINTS,
          'User',
          order.userId,
          `Customer tier progressed to ${newTier}`,
          {
            previousTier: loyaltyPoints.tier,
            newTier,
            points: newPoints,
          }
        );
      }
    }

    // Re-classify customer segment
    await classifyCustomer(order.userId, order.organizationId, {
      lifetimeValue,
      orderCount,
    });

    // Log LTV update
    await logSuccess(
      order.organizationId,
      AutomationType.CUSTOMER_SEGMENTATION,
      'User',
      order.userId,
      'Customer LTV updated',
      {
        lifetimeValue,
        orderCount,
        pointsEarned,
      }
    );

    return { success: true, lifetimeValue, orderCount };
  } catch (error) {
    console.error('[Customer LTV Update] Failed:', error);
    throw error;
  }
}

/**
 * Classify customer based on behavior
 * - NEW: First order or registered recently
 * - REGULAR: Multiple orders, moderate spending
 * - VIP: High spending, frequent orders
 * - INACTIVE: No orders in 90 days
 * - CHURNED: No orders in 180 days
 */
async function classifyCustomer(
  userId: string,
  organizationId: string,
  metrics: { lifetimeValue: number; orderCount: number }
) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const oneEightyDaysAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  const recentOrders = await prisma.order.count({
    where: {
      userId,
      createdAt: { gte: ninetyDaysAgo },
    },
  });

  let segment: CustomerSegmentType;
  let score: number;

  if (metrics.orderCount === 0) {
    segment = CustomerSegmentType.NEW;
    score = 0;
  } else if (recentOrders === 0 && metrics.orderCount > 0) {
    // Has orders but none in 90 days
    const veryRecentOrders = await prisma.order.count({
      where: {
        userId,
        createdAt: { gte: oneEightyDaysAgo },
      },
    });

    if (veryRecentOrders === 0) {
      segment = CustomerSegmentType.CHURNED;
      score = 0;
    } else {
      segment = CustomerSegmentType.INACTIVE;
      score = 20;
    }
  } else if (metrics.lifetimeValue > 10000 || metrics.orderCount > 10) {
    segment = CustomerSegmentType.VIP;
    score = 100;
  } else if (metrics.lifetimeValue > 2000 || metrics.orderCount > 3) {
    segment = CustomerSegmentType.REGULAR;
    score = 60;
  } else {
    segment = CustomerSegmentType.NEW;
    score = 30;
  }

  // Update or create customer segment
  const existingSegment = await prisma.customerSegment.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (existingSegment) {
    await prisma.customerSegment.update({
      where: { id: existingSegment.id },
      data: {
        segment,
        score,
        criteria: {
          lifetimeValue: metrics.lifetimeValue,
          orderCount: metrics.orderCount,
          recentOrders,
        },
      },
    });
  } else {
    await prisma.customerSegment.create({
      data: {
        organizationId,
        userId,
        segment,
        score,
        criteria: {
          lifetimeValue: metrics.lifetimeValue,
          orderCount: metrics.orderCount,
          recentOrders,
        },
      },
    });
  }

  return { segment, score };
}

/**
 * Calculate loyalty tier based on points
 */
function calculateLoyaltyTier(points: number): LoyaltyTier {
  if (points >= 10000) return LoyaltyTier.DIAMOND;
  if (points >= 5000) return LoyaltyTier.PLATINUM;
  if (points >= 2000) return LoyaltyTier.GOLD;
  if (points >= 500) return LoyaltyTier.SILVER;
  return LoyaltyTier.BRONZE;
}

/**
 * Get customer analytics
 * - Return customer segmentation stats
 * - LTV distribution
 * - Tier distribution
 */
export async function getCustomerAnalytics(organizationId?: string) {
  const whereClause = organizationId ? { organizationId } : {};

  const [
    totalCustomers,
    newCustomers,
    regularCustomers,
    vipCustomers,
    inactiveCustomers,
    churnedCustomers,
  ] = await Promise.all([
    prisma.customerSegment.count({ where: whereClause }),
    prisma.customerSegment.count({
      where: { ...whereClause, segment: CustomerSegmentType.NEW },
    }),
    prisma.customerSegment.count({
      where: { ...whereClause, segment: CustomerSegmentType.REGULAR },
    }),
    prisma.customerSegment.count({
      where: { ...whereClause, segment: CustomerSegmentType.VIP },
    }),
    prisma.customerSegment.count({
      where: { ...whereClause, segment: CustomerSegmentType.INACTIVE },
    }),
    prisma.customerSegment.count({
      where: { ...whereClause, segment: CustomerSegmentType.CHURNED },
    }),
  ]);

  const tierDistribution = await prisma.loyaltyPoints.groupBy({
    by: ['tier'],
    where: organizationId ? { organizationId } : undefined,
    _count: true,
  });

  const avgLTV = await prisma.loyaltyPoints.aggregate({
    where: whereClause,
    _avg: { lifetimeValue: true },
  });

  return {
    totalCustomers,
    segmentation: {
      new: newCustomers,
      regular: regularCustomers,
      vip: vipCustomers,
      inactive: inactiveCustomers,
      churned: churnedCustomers,
    },
    tierDistribution: tierDistribution.reduce((acc, item) => {
      acc[item.tier] = item._count;
      return acc;
    }, {} as Record<string, number>),
    averageLTV: avgLTV._avg.lifetimeValue || 0,
  };
}

/**
 * Process customer automation queue job
 * - Called by worker to process queued customer automation
 */
export async function processCustomerAutomationJob(jobData: any) {
  const { type, userId, organizationId, orderId } = jobData;

  switch (type) {
    case 'welcome':
      return await triggerWelcomeAutomation(userId, organizationId);
    case 'update_ltv':
      return await updateCustomerLTV(orderId);
    case 'classify':
      return await classifyCustomer(userId, organizationId, jobData.metrics);
    default:
      throw new Error(`Unknown customer automation type: ${type}`);
  }
}
