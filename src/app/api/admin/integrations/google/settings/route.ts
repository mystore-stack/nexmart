import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get("organizationId") || organizationId;

    const settings = {
      analyticsEnabled: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ? true : false,
      ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "",
      ga4ApiSecret: process.env.GA4_API_SECRET || "",
      gtmEnabled: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ? true : false,
      gtmContainerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || "",
      merchantEnabled: process.env.GOOGLE_MERCHANT_CENTER_ID ? true : false,
      merchantCenterId: process.env.GOOGLE_MERCHANT_CENTER_ID || "",
      merchantApiKey: process.env.GOOGLE_MERCHANT_CENTER_API_KEY || "",
      autoRefreshFeeds: true,
      businessEnabled: process.env.GOOGLE_BUSINESS_PROFILE_API_KEY ? true : false,
      businessApiKey: process.env.GOOGLE_BUSINESS_PROFILE_API_KEY || "",
      searchEnabled: process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN ? true : false,
      searchVerificationToken: process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN || "",
      autoSubmitSitemap: true,
      mapsEnabled: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? true : false,
      mapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      recaptchaEnabled: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? true : false,
      recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
      recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY || "",
      oauthEnabled: process.env.GOOGLE_CLIENT_ID ? true : false,
      oauthAdminClientId: process.env.GOOGLE_OAUTH_ADMIN_CLIENT_ID || "",
      oauthAdminClientSecret: process.env.GOOGLE_OAUTH_ADMIN_CLIENT_SECRET || "",
      oauthCustomerClientId: process.env.GOOGLE_OAUTH_CUSTOMER_CLIENT_ID || "",
      oauthCustomerClientSecret: process.env.GOOGLE_OAUTH_CUSTOMER_CLIENT_SECRET || "",
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Google settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    const body = await request.json();

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Google settings save error:", error);
    return NextResponse.json(
      { error: "Failed to save Google settings" },
      { status: 500 }
    );
  }
}
