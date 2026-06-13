// src/lib/automation/loyalty-automation.ts
// Loyalty automation: points system, calculation, redemption, VIP progression

import { prisma } from '../prisma';
import { logSuccess, logFailure, logPending } from './logger';
import { AutomationType, LoyaltyTier } from '@prisma/client';

/**
 * Architecture:
 * - Loyalty automation manages customer rewards program
 * - Points earned on purchases (1 point per 1 DH)
 * - Points can be redeemed for discounts
 * - VIP tiers based on points (Bronze, Silver, Gold, Platinum, Diamond)
 * - Automatic tier progression
 * - Points expiration (optional)
 */

/**
 * Calculate points for an order
 * - 1 point per 1 DH spent
 * - Bonus points for VIP tiers
 * - Bonus points for first order
 */
export async function calculateOrderPoints(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            loyaltyPoints: true,
          },
        },
        Organization: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Base points: 1 point per 1 DH
    let points = Math.floor(order.total);

    // Check if first order
    const orderCount = await prisma.order.count({
      where: {
        userId: order.userId,
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    if (orderCount === 1) {
      points += 50; // Bonus 50 points for first order
    }

    // VIP tier bonus
    if (order.user.loyaltyPoints && order.user.loyaltyPoints.length > 0) {
      const loyalty = order.user.loyaltyPoints[0];
      const tierBonus = {
        [LoyaltyTier.BRONZE]: 0,
        [LoyaltyTier.SILVER]: 0.1,
        [LoyaltyTier.GOLD]: 0.15,
        [LoyaltyTier.PLATINUM]: 0.2,
        [LoyaltyTier.DIAMOND]: 0.25,
      };
      points = Math.floor(points * (1 + tierBonus[loyalty.tier]));
    }

    return points;
  } catch (error) {
    console.error('[Calculate Order Points] Failed:', error);
    throw error;
  }
}

/**
 * Award points to customer
 * - Called after successful order completion
 * - Updates loyalty points record
 * - Checks for tier progression
 */
export async function awardPoints(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            loyaltyPoints: true,
          },
        },
        Organization: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate points
    const points = await calculateOrderPoints(orderId);

    // Get or create loyalty points record
    let loyaltyPoints = order.user.loyaltyPoints?.[0];
    
    if (!loyaltyPoints) {
      loyaltyPoints = await prisma.loyaltyPoints.create({
        data: {
          userId: order.userId,
          organizationId: order.organizationId,
          points: 0,
          pointsEarned: 0,
          pointsRedeemed: 0,
          tier: LoyaltyTier.BRONZE,
          lifetimeValue: 0,
          orderCount: 0,
        },
      });
    }

    const previousTier = loyaltyPoints.tier;
    const newPoints = loyaltyPoints.points + points;
    const newTier = calculateLoyaltyTier(newPoints);

    // Update loyalty points
    await prisma.loyaltyPoints.update({
      where: { id: loyaltyPoints.id },
      data: {
        points: newPoints,
        pointsEarned: loyaltyPoints.pointsEarned + points,
        lifetimeValue: loyaltyPoints.lifetimeValue + order.total,
        orderCount: loyaltyPoints.orderCount + 1,
        tier: newTier,
      },
    });

    // Log tier progression
    if (newTier !== previousTier) {
      await logSuccess(
        order.organizationId,
        AutomationType.LOYALTY_POINTS,
        'User',
        order.userId,
        `Customer tier progressed from ${previousTier} to ${newTier}`,
        {
          previousTier,
          newTier,
          points: newPoints,
        }
      );
    }

    // Log points awarded
    await logSuccess(
      order.organizationId,
      AutomationType.LOYALTY_POINTS,
      'Order',
      orderId,
      'Points awarded',
      {
        points,
        newTotal: newPoints,
        tier: newTier,
      }
    );

    return {
      points,
      newTotal: newPoints,
      tier: newTier,
      tierProgressed: newTier !== previousTier,
    };
  } catch (error) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      await logFailure(
        order.organizationId,
        AutomationType.LOYALTY_POINTS,
        'Order',
        orderId,
        'Points award failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    throw error;
  }
}

/**
 * Redeem points for discount
 * - Convert points to discount amount
 * - Deduct points from balance
 * - Return discount value
 */
export async function redeemPoints(userId: string, organizationId: string, pointsToRedeem: number) {
  try {
    const loyaltyPoints = await prisma.loyaltyPoints.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!loyaltyPoints) {
      throw new Error('Loyalty points not found');
    }

    if (loyaltyPoints.points < pointsToRedeem) {
      throw new Error('Insufficient points');
    }

    // Calculate discount: 100 points = 10 DH
    const discountValue = (pointsToRedeem / 100) * 10;

    // Update loyalty points
    await prisma.loyaltyPoints.update({
      where: { id: loyaltyPoints.id },
      data: {
        points: loyaltyPoints.points - pointsToRedeem,
        pointsRedeemed: loyaltyPoints.pointsRedeemed + pointsToRedeem,
      },
    });

    // Log redemption
    await logSuccess(
      organizationId,
      AutomationType.LOYALTY_POINTS,
      'User',
      userId,
      'Points redeemed',
      {
        pointsRedeemed: pointsToRedeem,
        discountValue,
        remainingPoints: loyaltyPoints.points - pointsToRedeem,
      }
    );

    return {
      pointsRedeemed: pointsToRedeem,
      discountValue,
      remainingPoints: loyaltyPoints.points - pointsToRedeem,
    };
  } catch (error) {
    await logFailure(
      organizationId,
      AutomationType.LOYALTY_POINTS,
      'User',
      userId,
      'Points redemption failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
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
 * Get tier benefits
 * - Return benefits for each tier
 */
export function getTierBenefits(tier: LoyaltyTier) {
  const benefits = {
    [LoyaltyTier.BRONZE]: {
      pointsMultiplier: 1,
      freeShippingThreshold: 500,
      birthdayBonus: 0,
      exclusiveAccess: false,
    },
    [LoyaltyTier.SILVER]: {
      pointsMultiplier: 1.1,
      freeShippingThreshold: 300,
      birthdayBonus: 100,
      exclusiveAccess: false,
    },
    [LoyaltyTier.GOLD]: {
      pointsMultiplier: 1.15,
      freeShippingThreshold: 200,
      birthdayBonus: 200,
      exclusiveAccess: true,
    },
    [LoyaltyTier.PLATINUM]: {
      pointsMultiplier: 1.2,
      freeShippingThreshold: 100,
      birthdayBonus: 300,
      exclusiveAccess: true,
    },
    [LoyaltyTier.DIAMOND]: {
      pointsMultiplier: 1.25,
      freeShippingThreshold: 0,
      birthdayBonus: 500,
      exclusiveAccess: true,
    },
  };

  return benefits[tier];
}

/**
 * Get customer loyalty status
 * - Return points, tier, and benefits
 */
export async function getCustomerLoyaltyStatus(userId: string, organizationId: string) {
  try {
    const loyaltyPoints = await prisma.loyaltyPoints.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!loyaltyPoints) {
      return {
        points: 0,
        tier: LoyaltyTier.BRONZE,
        benefits: getTierBenefits(LoyaltyTier.BRONZE),
        lifetimeValue: 0,
        orderCount: 0,
      };
    }

    return {
      points: loyaltyPoints.points,
      tier: loyaltyPoints.tier,
      benefits: getTierBenefits(loyaltyPoints.tier),
      lifetimeValue: loyaltyPoints.lifetimeValue,
      orderCount: loyaltyPoints.orderCount,
      pointsEarned: loyaltyPoints.pointsEarned,
      pointsRedeemed: loyaltyPoints.pointsRedeemed,
    };
  } catch (error) {
    console.error('[Get Customer Loyalty Status] Failed:', error);
    throw error;
  }
}

/**
 * Get loyalty program statistics
 * - Return program-wide metrics
 */
export async function getLoyaltyProgramStatistics(organizationId?: string) {
  try {
    const whereClause = organizationId ? { organizationId } : {};

    const [
      totalMembers,
      tierDistribution,
      totalPointsIssued,
      totalPointsRedeemed,
      averageLifetimeValue,
    ] = await Promise.all([
      prisma.loyaltyPoints.count({ where: whereClause }),
      prisma.loyaltyPoints.groupBy({
        by: ['tier'],
        where: whereClause,
        _count: true,
        _sum: { points: true },
      }),
      prisma.loyaltyPoints.aggregate({
        where: whereClause,
        _sum: { pointsEarned: true },
      }),
      prisma.loyaltyPoints.aggregate({
        where: whereClause,
        _sum: { pointsRedeemed: true },
      }),
      prisma.loyaltyPoints.aggregate({
        where: whereClause,
        _avg: { lifetimeValue: true },
      }),
    ]);

    return {
      totalMembers,
      tierDistribution: tierDistribution.reduce((acc, item) => {
        acc[item.tier] = {
          count: item._count,
          totalPoints: item._sum.points || 0,
        };
        return acc;
      }, {} as Record<string, { count: number; totalPoints: number }>),
      totalPointsIssued: totalPointsIssued._sum.pointsEarned || 0,
      totalPointsRedeemed: totalPointsRedeemed._sum.pointsRedeemed || 0,
      pointsRedemptionRate: totalPointsIssued._sum.pointsEarned && totalPointsRedeemed._sum.pointsRedeemed
        ? (totalPointsRedeemed._sum.pointsRedeemed / totalPointsIssued._sum.pointsEarned) * 100
        : 0,
      averageLifetimeValue: averageLifetimeValue._avg.lifetimeValue || 0,
    };
  } catch (error) {
    console.error('[Get Loyalty Program Statistics] Failed:', error);
    throw error;
  }
}

/**
 * Process loyalty automation queue job
 * - Called by worker to process queued loyalty automation
 */
export async function processLoyaltyAutomationJob(jobData: any) {
  const { type, userId, organizationId, orderId, pointsToRedeem } = jobData;

  switch (type) {
    case 'calculate_points':
      return await calculateOrderPoints(orderId);
    case 'award_points':
      return await awardPoints(orderId);
    case 'redeem_points':
      return await redeemPoints(userId, organizationId, pointsToRedeem);
    case 'get_status':
      return await getCustomerLoyaltyStatus(userId, organizationId);
    default:
      throw new Error(`Unknown loyalty automation type: ${type}`);
  }
}
