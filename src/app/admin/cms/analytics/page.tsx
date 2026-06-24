import { prisma } from "@/lib/prisma";
import { requireCmsAccess } from "@/lib/cms/auth";
import { getCmsDashboardMetrics, getRevenueChartData, getTrafficChartData, getTopBanners } from "@/lib/cms/analytics";
import { CmsAnalyticsClient } from "@/components/admin/cms/analytics/CmsAnalyticsClient";

export default async function CmsAnalyticsPage() {
  await requireCmsAccess();

  const [metrics, revenueChart, trafficChart, topBanners] = await Promise.all([
    getCmsDashboardMetrics(),
    getRevenueChartData(),
    getTrafficChartData(),
    getTopBanners(10),
  ]);

  return (
    <CmsAnalyticsClient
      metrics={metrics}
      revenueChart={revenueChart}
      trafficChart={trafficChart}
      topBanners={topBanners}
    />
  );
}
