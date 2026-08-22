import { prisma } from "@/lib/prisma";
import { AnalyticsEventType } from "@prisma/client";

export async function trackSectionEvent(
  sectionId: string,
  eventType: AnalyticsEventType,
  metadata: any = {}
) {
  try {
    await prisma.sectionAnalytics.create({
      data: {
        sectionId,
        eventType,
        metadata,
        sessionId: crypto.randomUUID(),
        userId: metadata.userId || null,
        deviceInfo: metadata.deviceInfo || {},
        referrer: metadata.referrer || null,
      },
    });
  } catch (error) {
    console.error("Error tracking section event:", error);
  }
}

export async function trackHomepageEvent(
  homepageBuilderId: string,
  eventType: AnalyticsEventType,
  metadata: any = {}
) {
  try {
    await prisma.homepageAnalytics.create({
      data: {
        homepageBuilderId,
        eventType,
        metadata,
        sessionId: crypto.randomUUID(),
        userId: metadata.userId || null,
        deviceInfo: metadata.deviceInfo || {},
        referrer: metadata.referrer || null,
      },
    });
  } catch (error) {
    console.error("Error tracking homepage event:", error);
  }
}

export async function getSectionAnalytics(sectionId: string, startDate?: Date, endDate?: Date) {
  try {
    const where: any = { sectionId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const analytics = await prisma.sectionAnalytics.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    // Calculate metrics
    const views = analytics.filter((a) => a.eventType === "VIEW").length;
    const clicks = analytics.filter((a) => a.eventType === "CLICK").length;
    const conversions = analytics.filter((a) => a.eventType === "CONVERSION").length;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

    return {
      analytics,
      metrics: {
        views,
        clicks,
        conversions,
        ctr: ctr.toFixed(2),
        conversionRate: conversionRate.toFixed(2),
      },
    };
  } catch (error) {
    console.error("Error fetching section analytics:", error);
    throw error;
  }
}

export async function getHomepageAnalytics(
  homepageBuilderId: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const where: any = { homepageBuilderId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const analytics = await prisma.homepageAnalytics.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    // Calculate metrics
    const pageViews = analytics.filter((a) => a.eventType === "PAGE_VIEW").length;
    const uniqueVisitors = new Set(analytics.map((a) => a.sessionId)).size;
    const bounceRate = calculateBounceRate(analytics);
    const avgSessionDuration = calculateAvgSessionDuration(analytics);

    return {
      analytics,
      metrics: {
        pageViews,
        uniqueVisitors,
        bounceRate: bounceRate.toFixed(2),
        avgSessionDuration: avgSessionDuration.toFixed(2),
      },
    };
  } catch (error) {
    console.error("Error fetching homepage analytics:", error);
    throw error;
  }
}

function calculateBounceRate(analytics: any[]): number {
  const sessions = new Set(analytics.map((a) => a.sessionId));
  let bounceCount = 0;

  sessions.forEach((sessionId) => {
    const sessionEvents = analytics.filter((a) => a.sessionId === sessionId);
    if (sessionEvents.length === 1) bounceCount++;
  });

  return sessions.size > 0 ? (bounceCount / sessions.size) * 100 : 0;
}

function calculateAvgSessionDuration(analytics: any[]): number {
  const sessions = new Set(analytics.map((a) => a.sessionId));
  const durations: number[] = [];

  sessions.forEach((sessionId) => {
    const sessionEvents = analytics.filter((a) => a.sessionId === sessionId);
    if (sessionEvents.length > 1) {
      const firstEvent = sessionEvents[0];
      const lastEvent = sessionEvents[sessionEvents.length - 1];
      const duration = new Date(lastEvent.createdAt).getTime() - new Date(firstEvent.createdAt).getTime();
      durations.push(duration / 1000); // Convert to seconds
    }
  });

  return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
}

// A/B Testing Functions
export async function createABTest(
  homepageBuilderId: string,
  name: string,
  description: string,
  variants: any[],
  trafficSplit: number[]
) {
  try {
    const abTest = await prisma.homepageABTest.create({
      data: {
        homepageBuilderId,
        name,
        description,
        status: "ACTIVE",
        startDate: new Date(),
        trafficSplit,
        minSampleSize: 1000,
        confidenceLevel: 95,
      },
    });

    // Create variants
    for (let i = 0; i < variants.length; i++) {
      await prisma.homepageABTestVariant.create({
        data: {
          abTestId: abTest.id,
          name: variants[i].name,
          description: variants[i].description,
          config: variants[i].config,
          trafficAllocation: trafficSplit[i],
          metrics: {
            views: 0,
            clicks: 0,
            conversions: 0,
          },
        },
      });
    }

    return abTest;
  } catch (error) {
    console.error("Error creating A/B test:", error);
    throw error;
  }
}

export async function assignUserToVariant(abTestId: string, userId?: string) {
  try {
    const abTest = await prisma.homepageABTest.findUnique({
      where: { id: abTestId },
      include: { variants: true },
    });

    if (!abTest || abTest.status !== "ACTIVE") {
      return null;
    }

    // Simple random assignment based on traffic split
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedVariant = abTest.variants[0];

    for (const variant of abTest.variants) {
      cumulative += variant.trafficAllocation;
      if (random <= cumulative) {
        selectedVariant = variant;
        break;
      }
    }

    // Track assignment
    await prisma.homepageABTestAssignment.create({
      data: {
        abTestId,
        variantId: selectedVariant.id,
        userId: userId || null,
        sessionId: crypto.randomUUID(),
      },
    });

    return selectedVariant;
  } catch (error) {
    console.error("Error assigning user to variant:", error);
    return null;
  }
}

export async function trackABTestEvent(
  assignmentId: string,
  eventType: "CLICK" | "CONVERSION"
) {
  try {
    const assignment = await prisma.homepageABTestAssignment.findUnique({
      where: { id: assignmentId },
      include: { variant: true },
    });

    if (!assignment) return;

    // Update variant metrics
    const currentMetrics = assignment.variant.metrics as any;
    const updatedMetrics = {
      ...currentMetrics,
      [eventType.toLowerCase() + "s"]: (currentMetrics[eventType.toLowerCase() + "s"] || 0) + 1,
    };

    await prisma.homepageABTestVariant.update({
      where: { id: assignment.variantId },
      data: { metrics: updatedMetrics },
    });
  } catch (error) {
    console.error("Error tracking A/B test event:", error);
  }
}

export async function getABTestResults(abTestId: string) {
  try {
    const abTest = await prisma.homepageABTest.findUnique({
      where: { id: abTestId },
      include: { variants: true },
    });

    if (!abTest) return null;

    const results = abTest.variants.map((variant) => {
      const metrics = variant.metrics as any;
      const views = metrics.views || 0;
      const clicks = metrics.clicks || 0;
      const conversions = metrics.conversions || 0;
      const ctr = views > 0 ? (clicks / views) * 100 : 0;
      const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

      return {
        ...variant,
        metrics: {
          ...metrics,
          ctr: ctr.toFixed(2),
          conversionRate: conversionRate.toFixed(2),
        },
      };
    });

    // Calculate statistical significance
    const winner = calculateWinner(results);

    return {
      abTest,
      variants: results,
      winner,
    };
  } catch (error) {
    console.error("Error fetching A/B test results:", error);
    throw error;
  }
}

function calculateWinner(variants: any[]): any {
  if (variants.length < 2) return null;

  const sorted = [...variants].sort((a, b) => {
    const aRate = parseFloat(a.metrics.conversionRate);
    const bRate = parseFloat(b.metrics.conversionRate);
    return bRate - aRate;
  });

  return sorted[0];
}
