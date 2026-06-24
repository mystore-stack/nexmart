import { NextResponse } from "next/server";
import { requireCmsPermission } from "@/lib/cms/auth";
import { CmsPermission } from "@/lib/cms/rbac";
import {
  getCmsDashboardMetrics,
  getTopBanners,
  getRevenueChartData,
  getTrafficChartData,
} from "@/lib/cms/analytics";

export async function GET() {
  try {
    await requireCmsPermission(CmsPermission.CMS_ANALYTICS);

    const [metrics, topBanners, revenueChart, trafficChart] = await Promise.all([
      getCmsDashboardMetrics(),
      getTopBanners(10),
      getRevenueChartData(),
      getTrafficChartData(),
    ]);

    return NextResponse.json({
      success: true,
      metrics,
      topBanners,
      revenueChart,
      trafficChart,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch analytics";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
