import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { z } from "zod";

const eventTrackingSchema = z.object({
  eventType: z.enum([
    "PAGE_VIEW",
    "PRODUCT_VIEW",
    "SEARCH_QUERY",
    "ADD_TO_CART",
    "REMOVE_FROM_CART",
    "CHECKOUT_STARTED",
    "PAYMENT_SUCCESS",
    "ORDER_COMPLETED",
    "BANNER_CLICK",
    "CATEGORY_CLICK",
  ]),
  sessionId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  bannerId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  deviceType: z.enum(["mobile", "desktop", "tablet"]).optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  country: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  metadata: z.any().optional(),
});

// POST track analytics event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = eventTrackingSchema.parse(body);
    const organizationId = await getDefaultOrganizationId();

    // Get session ID from body or generate new one
    const sessionId = data.sessionId || crypto.randomUUID();

    // Extract UTM parameters from URL if not provided
    const url = new URL(req.url);
    const utmSource = data.utmSource || url.searchParams.get("utm_source") || undefined;
    const utmMedium = data.utmMedium || url.searchParams.get("utm_medium") || undefined;
    const utmCampaign = data.utmCampaign || url.searchParams.get("utm_campaign") || undefined;
    const utmTerm = data.utmTerm || url.searchParams.get("utm_term") || undefined;
    const utmContent = data.utmContent || url.searchParams.get("utm_content") || undefined;

    // Detect device type from user agent if not provided
    const userAgent = req.headers.get("user-agent") || "";
    let deviceType = data.deviceType;
    if (!deviceType) {
      if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
        deviceType = "mobile";
      } else if (/tablet|ipad/i.test(userAgent)) {
        deviceType = "tablet";
      } else {
        deviceType = "desktop";
      }
    }

    // Detect browser from user agent
    let browser = data.browser;
    if (!browser) {
      if (/chrome/i.test(userAgent)) browser = "chrome";
      else if (/firefox/i.test(userAgent)) browser = "firefox";
      else if (/safari/i.test(userAgent)) browser = "safari";
      else if (/edge/i.test(userAgent)) browser = "edge";
      else browser = "other";
    }

    // Detect OS from user agent
    let os = data.os;
    if (!os) {
      if (/windows/i.test(userAgent)) os = "windows";
      else if (/mac/i.test(userAgent)) os = "macos";
      else if (/linux/i.test(userAgent)) os = "linux";
      else if (/android/i.test(userAgent)) os = "android";
      else if (/ios/i.test(userAgent)) os = "ios";
      else os = "other";
    }

    // Get referrer if not provided
    const referrer = data.referrer || req.headers.get("referer") || undefined;

    await prisma.analyticsEvent.create({
      data: {
        organizationId,
        userId: data.userId,
        sessionId,
        eventType: data.eventType as any,
        eventSource: "web" as any,
        properties: {
          utmSource,
          utmMedium,
          utmCampaign,
          utmTerm,
          utmContent,
          ...data.metadata,
        },
        productId: data.productId,
        categoryId: data.categoryId,
        orderId: data.orderId,
        url: req.headers.get("referer")?.split("?")[0],
        referrer,
        userAgent,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || undefined,
        deviceType,
        browser,
        os,
        country: data.country || req.headers.get("cf-ipcountry") || undefined,
      },
    });

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error("[EVENT TRACKING ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to track event" },
      { status: 500 }
    );
  }
}
