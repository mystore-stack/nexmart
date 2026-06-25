import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import { getHomeMarketingData } from "@/lib/marketing/data";
import { trackEventSchema } from "@/lib/marketing/schemas";

export async function GET() {
  try {
    const organizationId = await getOptionalDefaultOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ success: true, data: null });
    }

    const data = await getHomeMarketingData(organizationId);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: true, data: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = trackEventSchema.parse(await req.json());

    if (body.adId) {
      const field = body.eventType === "view" ? "impressions" : body.eventType === "click" ? "clicks" : "conversions";
      await prisma.advertisement.update({
        where: { id: body.adId },
        data: {
          [field]: { increment: 1 },
          ...(body.eventType === "conversion" && body.revenue ? { revenue: { increment: body.revenue } } : {}),
        },
      });
      await prisma.advertisementAnalytics.create({
        data: {
          adId: body.adId,
          eventType: body.eventType,
          deviceType: body.deviceType,
          country: body.country,
          sessionId: body.sessionId,
          revenue: body.revenue,
        },
      });
    }

    if (body.flashDealId) {
      const field = body.eventType === "view" ? "impressions" : body.eventType === "click" ? "clicks" : "conversions";
      await prisma.flashDeal.update({
        where: { id: body.flashDealId },
        data: {
          [field]: { increment: 1 },
          ...(body.eventType === "conversion" && body.revenue ? { revenue: { increment: body.revenue } } : {}),
        },
      });
    }

    if (body.sponsoredProductId) {
      const field = body.eventType === "view" ? "impressions" : body.eventType === "click" ? "clicks" : "conversions";
      await prisma.sponsoredProduct.update({
        where: { id: body.sponsoredProductId },
        data: {
          [field]: { increment: 1 },
          ...(body.eventType === "conversion" && body.revenue ? { revenue: { increment: body.revenue } } : {}),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
