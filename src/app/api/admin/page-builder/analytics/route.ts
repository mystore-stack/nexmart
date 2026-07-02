import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, badRequest, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch analytics for a page
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");
    const days = parseInt(searchParams.get("days") || "30");

    if (!pageId) {
      return badRequest("pageId is required");
    }

    // Verify page belongs to organization
    const page = await prisma.pageBuilderPage.findFirst({
      where: { id: pageId, organizationId },
    });

    if (!page) {
      return notFound("Page not found");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await prisma.pageAnalytics.findMany({
      where: {
        pageId,
        date: { gte: startDate },
      },
      orderBy: { date: "desc" },
    });

    // Calculate aggregates
    const totals = analytics.reduce(
      (acc, curr) => ({
        views: acc.views + curr.views,
        clicks: acc.clicks + curr.clicks,
        orders: acc.orders + curr.orders,
        revenue: acc.revenue + curr.revenue,
      }),
      { views: 0, clicks: 0, orders: 0, revenue: 0 }
    );

    const ctr = totals.views > 0 ? (totals.clicks / totals.views) * 100 : 0;
    const conversionRate = totals.clicks > 0 ? (totals.orders / totals.clicks) * 100 : 0;

    return ok({
      analytics,
      totals: {
        ...totals,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      },
    });
  } catch (err) {
    console.error("[PAGE_BUILDER_ANALYTICS] GET error:", err);
    return serverError("Failed to fetch analytics");
  }
}

// POST - Track page view
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId, type = "view" } = body;

    if (!pageId) {
      return badRequest("pageId is required");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await prisma.pageAnalytics.upsert({
      where: {
        pageId_date: {
          pageId,
          date: today,
        },
      },
      create: {
        pageId,
        date: today,
        views: type === "view" ? 1 : 0,
        clicks: type === "click" ? 1 : 0,
        orders: type === "order" ? 1 : 0,
        revenue: type === "order" ? (body.revenue || 0) : 0,
      },
      update: {
        ...(type === "view" && { views: { increment: 1 } }),
        ...(type === "click" && { clicks: { increment: 1 } }),
        ...(type === "order" && { orders: { increment: 1 } }),
        ...(type === "order" && { revenue: { increment: body.revenue || 0 } }),
      },
    });

    return ok(analytics);
  } catch (err) {
    console.error("[PAGE_BUILDER_ANALYTICS] POST error:", err);
    return serverError("Failed to track analytics");
  }
}
