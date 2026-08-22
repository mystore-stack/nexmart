// src/lib/automation/email-analytics.ts — Email Analytics Dashboard
import { prisma } from '@/lib/prisma';

// Track email open
export async function trackEmailOpen(emailLogId: string, ipAddress?: string, userAgent?: string) {
  try {
    const tracking = await prisma.emailTracking.findUnique({
      where: { emailLogId },
    });

    if (tracking) {
      await prisma.emailTracking.update({
        where: { emailLogId },
        data: {
          opened: true,
          openedAt: new Date(),
          ipAddress,
          userAgent,
        },
      });
    } else {
      await prisma.emailTracking.create({
        data: {
          emailLogId,
          opened: true,
          openedAt: new Date(),
          ipAddress,
          userAgent,
        },
      });
    }

    // Update email log status
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        openedAt: new Date(),
      },
    });

    console.log(`[Email Analytics] Tracked open for email ${emailLogId}`);
    return { success: true };
  } catch (error) {
    console.error('[Track Email Open Error]:', error);
    return { success: false };
  }
}

// Track email click
export async function trackEmailClick(emailLogId: string, linkUrl: string, ipAddress?: string, userAgent?: string) {
  try {
    const tracking = await prisma.emailTracking.findUnique({
      where: { emailLogId },
    });

    if (tracking) {
      await prisma.emailTracking.update({
        where: { emailLogId },
        data: {
          clicked: true,
          clickedAt: new Date(),
          clickCount: { increment: 1 },
          linkUrl,
          ipAddress,
          userAgent,
        },
      });
    } else {
      await prisma.emailTracking.create({
        data: {
          emailLogId,
          clicked: true,
          clickedAt: new Date(),
          clickCount: 1,
          linkUrl,
          ipAddress,
          userAgent,
        },
      });
    }

    // Update email log status
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        clickedAt: new Date(),
      },
    });

    console.log(`[Email Analytics] Tracked click for email ${emailLogId}`);
    return { success: true };
  } catch (error) {
    console.error('[Track Email Click Error]:', error);
    return { success: false };
  }
}

// Track conversion (order placed after email)
export async function trackConversion(emailLogId: string, orderValue: number, orderId: string) {
  try {
    const tracking = await prisma.emailTracking.findUnique({
      where: { emailLogId },
    });

    if (tracking) {
      await prisma.emailTracking.update({
        where: { emailLogId },
        data: {
          converted: true,
          convertedAt: new Date(),
          orderValue,
        },
      });
    } else {
      await prisma.emailTracking.create({
        data: {
          emailLogId,
          converted: true,
          convertedAt: new Date(),
          orderValue,
        },
      });
    }

    // Update campaign conversion count if linked
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
      select: { campaignId: true },
    });

    if (emailLog?.campaignId) {
      await prisma.emailCampaign.update({
        where: { id: emailLog.campaignId },
        data: {
          conversionCount: { increment: 1 },
          revenue: { increment: orderValue },
        },
      });
    }

    console.log(`[Email Analytics] Tracked conversion for email ${emailLogId}, value: ${orderValue}`);
    return { success: true };
  } catch (error) {
    console.error('[Track Conversion Error]:', error);
    return { success: false };
  }
}

// Get email analytics for an organization
export async function getEmailAnalytics(organizationId: string, startDate?: Date, endDate?: Date) {
  try {
    const where: any = { organizationId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalEmails,
      sentEmails,
      openedEmails,
      clickedEmails,
      convertedEmails,
      totalRevenue,
    ] = await Promise.all([
      prisma.emailLog.count({ where }),
      prisma.emailLog.count({ where: { ...where, status: 'SENT' } }),
      prisma.emailLog.count({ where: { ...where, openedAt: { not: null } } }),
      prisma.emailLog.count({ where: { ...where, clickedAt: { not: null } } }),
      prisma.emailTracking.count({ where: { emailLog: { ...where }, converted: true } }),
      prisma.emailTracking.aggregate({
        where: { emailLog: { ...where }, converted: true },
        _sum: { orderValue: true },
      }),
    ]);

    const openRate = sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0;
    const clickRate = sentEmails > 0 ? (clickedEmails / sentEmails) * 100 : 0;
    const conversionRate = sentEmails > 0 ? (convertedEmails / sentEmails) * 100 : 0;

    return {
      totalEmails,
      sentEmails,
      openedEmails,
      clickedEmails,
      convertedEmails,
      totalRevenue: totalRevenue._sum.orderValue || 0,
      openRate,
      clickRate,
      conversionRate,
    };
  } catch (error) {
    console.error('[Get Email Analytics Error]:', error);
    return null;
  }
}

// Get email type breakdown
export async function getEmailTypeBreakdown(organizationId: string, startDate?: Date, endDate?: Date) {
  try {
    const where: any = { organizationId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const emailLogs = await prisma.emailLog.findMany({
      where,
      select: { type: true, status: true },
    });

    const breakdown: Record<string, { sent: number; opened: number; clicked: number }> = {};

    for (const log of emailLogs) {
      if (!breakdown[log.type]) {
        breakdown[log.type] = { sent: 0, opened: 0, clicked: 0 };
      }

      if (log.status === 'SENT') {
        breakdown[log.type].sent++;
      }
    }

    const tracking = await prisma.emailTracking.findMany({
      where: {
        emailLog: where,
      },
      select: { opened: true, clicked: true },
    });

    for (const track of tracking) {
      if (track.opened) {
        // Find the email type for this tracking record
        const emailLog = await prisma.emailLog.findUnique({
          where: { id: track.emailLogId },
          select: { type: true },
        });
        if (emailLog && breakdown[emailLog.type]) {
          breakdown[emailLog.type].opened++;
        }
      }
      if (track.clicked) {
        const emailLog = await prisma.emailLog.findUnique({
          where: { id: track.emailLogId },
          select: { type: true },
        });
        if (emailLog && breakdown[emailLog.type]) {
          breakdown[emailLog.type].clicked++;
        }
      }
    }

    return breakdown;
  } catch (error) {
    console.error('[Get Email Type Breakdown Error]:', error);
    return {};
  }
}

// Get campaign performance
export async function getCampaignPerformance(campaignId: string) {
  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      include: {
        tracking: true,
      },
    });

    if (!campaign) return null;

    const openCount = campaign.tracking.filter((t) => t.opened).length;
    const clickCount = campaign.tracking.filter((t) => t.clicked).length;
    const conversionCount = campaign.tracking.filter((t) => t.converted).length;

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      recipientCount: campaign.recipientCount,
      openCount,
      clickCount,
      conversionCount,
      revenue: campaign.revenue,
      openRate: campaign.recipientCount > 0 ? (openCount / campaign.recipientCount) * 100 : 0,
      clickRate: campaign.recipientCount > 0 ? (clickCount / campaign.recipientCount) * 100 : 0,
      conversionRate: campaign.recipientCount > 0 ? (conversionCount / campaign.recipientCount) * 100 : 0,
      status: campaign.status,
      sentAt: campaign.sentAt,
    };
  } catch (error) {
    console.error('[Get Campaign Performance Error]:', error);
    return null;
  }
}

// Get top performing campaigns
export async function getTopCampaigns(organizationId: string, limit: number = 10) {
  try {
    const campaigns = await prisma.emailCampaign.findMany({
      where: { organizationId, sent: true },
      orderBy: { revenue: 'desc' },
      take: limit,
    });

    const results = await Promise.all(
      campaigns.map((campaign) => getCampaignPerformance(campaign.id))
    );

    return results.filter((r) => r !== null);
  } catch (error) {
    console.error('[Get Top Campaigns Error]:', error);
    return [];
  }
}
