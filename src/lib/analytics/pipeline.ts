// src/lib/analytics/pipeline.ts
import { prisma } from "@/lib/prisma";
import { redis, incrementCounter, getCounter, ANALYTICS_KEYS, publishEvent, PUBSUB_CHANNELS } from "@/lib/redis";
import { addAnalyticsJob } from "@/lib/queue";

/**
 * Real-time Analytics Pipeline
 * Processes user events and updates analytics in real-time
 */

export interface AnalyticsEvent {
  type: "page_view" | "product_view" | "add_to_cart" | "checkout_start" | "purchase" | "search";
  userId?: string;
  sessionId?: string;
  productId?: string;
  categoryId?: string;
  orderId?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Process analytics event in real-time
 */
export async function processAnalyticsEvent(event: AnalyticsEvent) {
  const today = new Date().toISOString().split("T")[0];

  try {
    // Update counters in Redis (fast, real-time)
    switch (event.type) {
      case "product_view":
        if (event.productId) {
          await incrementCounter(ANALYTICS_KEYS.productViews(event.productId));
        }
        break;

      case "purchase":
        if (event.value) {
          await incrementCounter(ANALYTICS_KEYS.dailyRevenue(today), Math.round(event.value));
          await incrementCounter(ANALYTICS_KEYS.dailyOrders(today));
        }
        break;

      case "add_to_cart":
        await incrementCounter(`analytics:add_to_cart:${today}`);
        break;

      case "checkout_start":
        await incrementCounter(`analytics:checkout_start:${today}`);
        break;

      case "search":
        await incrementCounter(`analytics:search:${today}`);
        break;
    }

    // Publish event to real-time dashboard
    await publishEvent(PUBSUB_CHANNELS.analytics, {
      type: event.type,
      timestamp: event.timestamp,
      userId: event.userId,
      sessionId: event.sessionId,
      productId: event.productId,
      value: event.value,
    });

    // Add to background job for deeper analysis
    await addAnalyticsJob({
      type: "event_tracking",
      data: event,
    });

    return { success: true };
  } catch (error) {
    console.error("[ANALYTICS] Error processing event:", error);
    return { success: false, error };
  }
}

/**
 * Get real-time analytics for dashboard
 */
export async function getRealtimeAnalytics() {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    const [
      todayRevenue,
      yesterdayRevenue,
      todayOrders,
      yesterdayOrders,
      todayPageViews,
      todayAddToCart,
      todayCheckoutStart,
    ] = await Promise.all([
      getCounter(ANALYTICS_KEYS.dailyRevenue(today)),
      getCounter(ANALYTICS_KEYS.dailyRevenue(yesterday)),
      getCounter(ANALYTICS_KEYS.dailyOrders(today)),
      getCounter(ANALYTICS_KEYS.dailyOrders(yesterday)),
      getCounter(`analytics:page_views:${today}`),
      getCounter(`analytics:add_to_cart:${today}`),
      getCounter(`analytics:checkout_start:${today}`),
    ]);

    const revenueGrowth =
      yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
    const ordersGrowth =
      yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;

    const conversionRate =
      todayCheckoutStart > 0 ? (todayOrders / todayCheckoutStart) * 100 : 0;

    return {
      revenue: {
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        growth: revenueGrowth.toFixed(2),
      },
      orders: {
        today: todayOrders,
        yesterday: yesterdayOrders,
        growth: ordersGrowth.toFixed(2),
      },
      pageViews: todayPageViews,
      addToCart: todayAddToCart,
      checkoutStart: todayCheckoutStart,
      conversionRate: conversionRate.toFixed(2),
    };
  } catch (error) {
    console.error("[ANALYTICS] Error getting realtime data:", error);
    return null;
  }
}

/**
 * Get product analytics
 */
export async function getProductAnalytics(productId: string) {
  try {
    const views = await getCounter(ANALYTICS_KEYS.productViews(productId));

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        soldCount: true,
        price: true,
        name: true,
      },
    });

    if (!product) return null;

    const conversionRate = views > 0 ? (product.soldCount / views) * 100 : 0;

    return {
      productId,
      productName: product.name,
      views,
      soldCount: product.soldCount,
      conversionRate: conversionRate.toFixed(2),
      revenue: product.soldCount * product.price,
    };
  } catch (error) {
    console.error("[ANALYTICS] Error getting product analytics:", error);
    return null;
  }
}

/**
 * Track page view
 */
export async function trackPageView(userId?: string, sessionId?: string, path?: string) {
  const today = new Date().toISOString().split("T")[0];

  await Promise.all([
    incrementCounter(`analytics:page_views:${today}`),
    incrementCounter(`analytics:page_views:${path}:${today}`),
  ]);

  await processAnalyticsEvent({
    type: "page_view",
    userId,
    sessionId,
    metadata: { path },
    timestamp: new Date(),
  });
}

/**
 * Track product view
 */
export async function trackProductView(productId: string, userId?: string, sessionId?: string) {
  await incrementCounter(ANALYTICS_KEYS.productViews(productId));

  await processAnalyticsEvent({
    type: "product_view",
    productId,
    userId,
    sessionId,
    timestamp: new Date(),
  });
}

/**
 * Track add to cart
 */
export async function trackAddToCart(
  productId: string,
  userId?: string,
  sessionId?: string,
  value?: number
) {
  await processAnalyticsEvent({
    type: "add_to_cart",
    productId,
    userId,
    sessionId,
    value,
    timestamp: new Date(),
  });
}

/**
 * Track checkout start
 */
export async function trackCheckoutStart(userId?: string, sessionId?: string, cartValue?: number) {
  await processAnalyticsEvent({
    type: "checkout_start",
    userId,
    sessionId,
    value: cartValue,
    timestamp: new Date(),
  });
}

/**
 * Track purchase
 */
export async function trackPurchase(
  orderId: string,
  userId?: string,
  value?: number,
  metadata?: Record<string, any>
) {
  await processAnalyticsEvent({
    type: "purchase",
    orderId,
    userId,
    value,
    metadata,
    timestamp: new Date(),
  });
}

/**
 * Track search
 */
export async function trackSearch(query: string, userId?: string, sessionId?: string) {
  await incrementCounter(`analytics:search:${query.toLowerCase()}`);

  await processAnalyticsEvent({
    type: "search",
    userId,
    sessionId,
    metadata: { query },
    timestamp: new Date(),
  });
}

/**
 * Get top products by views
 */
export async function getTopProductsByViews(limit: number = 10) {
  try {
    const products = await prisma.product.findMany({
      where: { published: true },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        soldCount: true,
      },
      orderBy: { soldCount: "desc" },
      take: limit,
    });

    const productsWithViews = await Promise.all(
      products.map(async (product) => {
        const views = await getCounter(ANALYTICS_KEYS.productViews(product.id));
        return {
          ...product,
          views,
          conversionRate: views > 0 ? ((product.soldCount / views) * 100).toFixed(2) : "0",
        };
      })
    );

    return productsWithViews.sort((a, b) => b.views - a.views);
  } catch (error) {
    console.error("[ANALYTICS] Error getting top products:", error);
    return [];
  }
}

/**
 * Get funnel analytics
 */
export async function getFunnelAnalytics() {
  const today = new Date().toISOString().split("T")[0];

  try {
    const [pageViews, addToCart, checkoutStart, orders] = await Promise.all([
      getCounter(`analytics:page_views:${today}`),
      getCounter(`analytics:add_to_cart:${today}`),
      getCounter(`analytics:checkout_start:${today}`),
      getCounter(ANALYTICS_KEYS.dailyOrders(today)),
    ]);

    const addToCartRate = pageViews > 0 ? (addToCart / pageViews) * 100 : 0;
    const checkoutRate = addToCart > 0 ? (checkoutStart / addToCart) * 100 : 0;
    const purchaseRate = checkoutStart > 0 ? (orders / checkoutStart) * 100 : 0;
    const overallRate = pageViews > 0 ? (orders / pageViews) * 100 : 0;

    return {
      pageViews,
      addToCart,
      checkoutStart,
      orders,
      rates: {
        addToCart: addToCartRate.toFixed(2),
        checkout: checkoutRate.toFixed(2),
        purchase: purchaseRate.toFixed(2),
        overall: overallRate.toFixed(2),
      },
    };
  } catch (error) {
    console.error("[ANALYTICS] Error getting funnel data:", error);
    return null;
  }
}
