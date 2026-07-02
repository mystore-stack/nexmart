// src/lib/automation/revenue-attribution.ts — Revenue Attribution
import { prisma } from '@/lib/prisma';

// Attribute revenue to email campaigns
export async function attributeRevenueToEmail(orderId: string, emailLogId?: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        total: true,
        userId: true,
        organizationId: true,
        couponId: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // If emailLogId is provided, attribute directly
    if (emailLogId) {
      await prisma.emailTracking.update({
        where: { emailLogId },
        data: {
          converted: true,
          convertedAt: new Date(),
          orderValue: order.total,
        },
      });

      // Update campaign revenue
      const emailLog = await prisma.emailLog.findUnique({
        where: { id: emailLogId },
        select: { campaignId: true } as any,
      });

      if (emailLog?.campaignId) {
        await prisma.emailCampaign.update({
          where: { id: emailLog.campaignId },
          data: {
            conversionCount: { increment: 1 },
            revenue: { increment: order.total },
          },
        } as any);
      }

      console.log(`[Revenue Attribution] Attributed ${order.total} DH to email ${emailLogId}`);
      return { success: true, attributed: true, source: 'direct' };
    }

    // If no emailLogId, try to find the most recent email sent to this user
    const recentEmail = await prisma.emailLog.findFirst({
      where: {
        userId: order.userId,
        organizationId: order.organizationId,
        status: 'SENT' as any,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, campaignId: true } as any,
    });

    if (recentEmail) {
      await prisma.emailTracking.upsert({
        where: { emailLogId: recentEmail.id },
        create: {
          emailLogId: recentEmail.id,
          converted: true,
          convertedAt: new Date(),
          orderValue: order.total,
        },
        update: {
          converted: true,
          convertedAt: new Date(),
          orderValue: order.total,
        },
      });

      // Update campaign revenue
      if (recentEmail.campaignId) {
        await prisma.emailCampaign.update({
          where: { id: recentEmail.campaignId },
          data: {
            conversionCount: { increment: 1 },
            revenue: { increment: order.total },
          },
        } as any);
      }

      console.log(`[Revenue Attribution] Attributed ${order.total} DH to recent email ${recentEmail.id}`);
      return { success: true, attributed: true, source: 'recent_email' };
    }

    // If coupon was used, attribute to coupon-based campaign
    if (order.couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: order.couponId },
        select: { code: true },
      });

      console.log(`[Revenue Attribution] Order used coupon ${coupon?.code}, but no email attribution`);
      return { success: true, attributed: false, source: 'coupon_only' };
    }

    console.log(`[Revenue Attribution] No email attribution found for order ${orderId}`);
    return { success: true, attributed: false, source: 'none' };
  } catch (error) {
    console.error('[Attribute Revenue To Email Error]:', error);
    return { success: false, error: 'Failed to attribute revenue' };
  }
}

// Get revenue attribution report
export async function getRevenueAttributionReport(organizationId: string, startDate?: Date, endDate?: Date) {
  try {
    const where: any = { organizationId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get total revenue from email conversions
    const emailTrackingRevenue = await prisma.emailTracking.aggregate({
      where: {
        emailLog: where as any,
        converted: true,
      },
      _sum: { orderValue: true },
      _count: true,
    });

    // Get campaign revenue
    const campaignRevenue = await prisma.emailCampaign.aggregate({
      where,
      _sum: { revenue: true },
      _count: true,
    });

    // Get total orders
    const totalOrders = await prisma.order.count({ where });

    // Get orders with email attribution
    const attributedOrders = await prisma.emailTracking.count({
      where: {
        emailLog: where as any,
        converted: true,
      },
    });

    // Get revenue by email type
    const emailLogs = await prisma.emailLog.findMany({
      where,
      select: { type: true, id: true },
    });

    const revenueByType: Record<string, { revenue: number; conversions: number }> = {};

    for (const log of emailLogs) {
      const tracking = await prisma.emailTracking.findUnique({
        where: { emailLogId: log.id },
        select: { orderValue: true, converted: true },
      });

      if (tracking?.converted && tracking.orderValue) {
        if (!revenueByType[log.type]) {
          revenueByType[log.type] = { revenue: 0, conversions: 0 };
        }
        revenueByType[log.type].revenue += tracking.orderValue;
        revenueByType[log.type].conversions += 1;
      }
    }

    return {
      totalRevenue: emailTrackingRevenue._sum?.orderValue || 0,
      totalConversions: emailTrackingRevenue._count,
      campaignRevenue: campaignRevenue._sum?.revenue || 0,
      campaignCount: campaignRevenue._count,
      totalOrders,
      attributedOrders,
      attributionRate: totalOrders > 0 ? (attributedOrders / totalOrders) * 100 : 0,
      revenueByType,
    };
  } catch (error) {
    console.error('[Get Revenue Attribution Report Error]:', error);
    return null;
  }
}

// Get top revenue-generating campaigns
export async function getTopRevenueCampaigns(organizationId: string, limit: number = 10) {
  try {
    const campaigns = await prisma.emailCampaign.findMany({
      where: { organizationId, sent: true },
      orderBy: { revenue: 'desc' },
      take: limit,
      include: {
        tracking: {
          where: { converted: true },
        },
      },
    });

    return campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      revenue: campaign.revenue,
      conversionCount: campaign.conversionCount,
      openCount: campaign.openCount,
      clickCount: campaign.clickCount,
      roi: campaign.revenue > 0 ? ((campaign.revenue / (campaign.recipientCount || 1)) * 100).toFixed(2) : '0',
    }));
  } catch (error) {
    console.error('[Get Top Revenue Campaigns Error]:', error);
    return [];
  }
}

// Get customer lifetime value by email engagement
export async function getCLVByEmailEngagement(organizationId: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId,
      } as any,
      include: {
        emailLogs: {
          where: { organizationId },
        },
        orders: {
          where: { organizationId },
        },
      } as any,
    });

    const segments = {
      highlyEngaged: { users: 0, totalRevenue: 0, avgRevenue: 0 },
      moderatelyEngaged: { users: 0, totalRevenue: 0, avgRevenue: 0 },
      lowEngagement: { users: 0, totalRevenue: 0, avgRevenue: 0 },
      noEngagement: { users: 0, totalRevenue: 0, avgRevenue: 0 },
    };

    for (const user of users as any[]) {
      const emailCount = user.emailLogs?.length || 0;
      const totalRevenue = user.orders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0;

      if (emailCount >= 10) {
        segments.highlyEngaged.users++;
        segments.highlyEngaged.totalRevenue += totalRevenue;
      } else if (emailCount >= 5) {
        segments.moderatelyEngaged.users++;
        segments.moderatelyEngaged.totalRevenue += totalRevenue;
      } else if (emailCount >= 1) {
        segments.lowEngagement.users++;
        segments.lowEngagement.totalRevenue += totalRevenue;
      } else {
        segments.noEngagement.users++;
        segments.noEngagement.totalRevenue += totalRevenue;
      }
    }

    // Calculate averages
    for (const key of Object.keys(segments)) {
      const segment = segments[key as keyof typeof segments];
      if (segment.users > 0) {
        segment.avgRevenue = segment.totalRevenue / segment.users;
      }
    }

    return segments;
  } catch (error) {
    console.error('[Get CLV By Email Engagement Error]:', error);
    return null;
  }
}
