import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { headers } from "next/headers";

export type EventType =
  | "page_view"
  | "product_view"
  | "search"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_started"
  | "payment_success"
  | "order_completed"
  | "banner_click"
  | "category_click";

export interface EventData {
  type: EventType;
  sessionId: string;
  userId?: string;
  productId?: string;
  orderId?: string;
  categoryId?: string;
  bannerId?: string;
  metadata?: Record<string, any>;
}

// Get or create session ID from cookies
export function getSessionId(): string {
  // This would typically use cookies-next
  // For now, we'll generate a session ID
  if (typeof window !== "undefined") {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  }
  return crypto.randomUUID();
}

// Extract device info from user agent
export async function getDeviceInfo() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  
  let deviceType = "desktop";
  if (/mobile/i.test(userAgent)) deviceType = "mobile";
  else if (/tablet/i.test(userAgent)) deviceType = "tablet";

  let browser = "unknown";
  if (/chrome/i.test(userAgent)) browser = "chrome";
  else if (/firefox/i.test(userAgent)) browser = "firefox";
  else if (/safari/i.test(userAgent)) browser = "safari";
  else if (/edge/i.test(userAgent)) browser = "edge";

  let os = "unknown";
  if (/windows/i.test(userAgent)) os = "windows";
  else if (/mac/i.test(userAgent)) os = "macos";
  else if (/linux/i.test(userAgent)) os = "linux";
  else if (/android/i.test(userAgent)) os = "android";
  else if (/ios/i.test(userAgent)) os = "ios";

  return { deviceType, browser, os };
}

// Extract UTM parameters from URL
export function getUTMParams(searchParams: URLSearchParams) {
  return {
    utmSource: searchParams.get("utm_source") || undefined,
    utmMedium: searchParams.get("utm_medium") || undefined,
    utmCampaign: searchParams.get("utm_campaign") || undefined,
    utmContent: searchParams.get("utm_content") || undefined,
    utmTerm: searchParams.get("utm_term") || undefined,
  };
}

// Track an analytics event
export async function trackEvent(data: EventData) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const deviceInfo = await getDeviceInfo();
    const headersList = await headers();
    const referrer = headersList.get("referer") || undefined;

    await prisma.analyticsEvent.create({
      data: {
        organizationId,
        type: data.type,
        sessionId: data.sessionId,
        userId: data.userId,
        productId: data.productId,
        orderId: data.orderId,
        categoryId: data.categoryId,
        bannerId: data.bannerId,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        country: headersList.get("cf-ipcountry") || undefined, // Cloudflare country header
        referrer,
        metadata: data.metadata,
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] Failed to track event:", error);
    // Don't throw - analytics failures shouldn't break the app
  }
}

// Batch track multiple events for performance
export async function trackBatchEvents(events: EventData[]) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const deviceInfo = await getDeviceInfo();
    const headersList = await headers();
    const referrer = headersList.get("referer") || undefined;

    await prisma.analyticsEvent.createMany({
      data: events.map((event) => ({
        organizationId,
        type: event.type,
        sessionId: event.sessionId,
        userId: event.userId,
        productId: event.productId,
        orderId: event.orderId,
        categoryId: event.categoryId,
        bannerId: event.bannerId,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        country: headersList.get("cf-ipcountry") || undefined,
        referrer,
        metadata: event.metadata,
      })),
    });
  } catch (error) {
    console.error("[ANALYTICS] Failed to track batch events:", error);
  }
}

// Track page view (called from middleware or page components)
export async function trackPageView(pathname: string, sessionId: string, userId?: string) {
  await trackEvent({
    type: "page_view",
    sessionId,
    userId,
    metadata: { pathname },
  });
}

// Track product view
export async function trackProductView(productId: string, sessionId: string, userId?: string) {
  await trackEvent({
    type: "product_view",
    sessionId,
    userId,
    productId,
  });
}

// Track add to cart
export async function trackAddToCart(productId: string, sessionId: string, userId?: string) {
  await trackEvent({
    type: "add_to_cart",
    sessionId,
    userId,
    productId,
  });
}

// Track checkout started
export async function trackCheckoutStarted(sessionId: string, userId?: string) {
  await trackEvent({
    type: "checkout_started",
    sessionId,
    userId,
  });
}

// Track order completed
export async function trackOrderCompleted(orderId: string, sessionId: string, userId?: string, revenue?: number) {
  await trackEvent({
    type: "order_completed",
    sessionId,
    userId,
    orderId,
    metadata: { revenue },
  });
}
