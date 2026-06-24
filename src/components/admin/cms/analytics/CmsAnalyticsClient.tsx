"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { MetricCard } from "@/components/admin/cms/shared/MetricCard";
import {
  BarChart3,
  ShoppingCart,
  Users,
  Target,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";
import type { CmsDashboardMetrics, HeroBannerMetrics } from "@/lib/cms/analytics";

interface CmsAnalyticsClientProps {
  metrics: CmsDashboardMetrics;
  revenueChart: { date: string; revenue: number }[];
  trafficChart: { date: string; visitors: number }[];
  topBanners: HeroBannerMetrics[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(value);
}

export function CmsAnalyticsClient({
  metrics,
  revenueChart,
  trafficChart,
  topBanners,
}: CmsAnalyticsClientProps) {
  return (
    <CmsShell title="CMS Analytics" description="Revenue, traffic, conversions, and content performance.">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard title="Revenue (30d)" value={formatCurrency(metrics.revenue)} icon={TrendingUp} />
          <MetricCard title="Orders" value={metrics.orders} icon={ShoppingCart} />
          <MetricCard title="Visitors" value={metrics.visitors.toLocaleString()} icon={Users} />
          <MetricCard title="Conversions" value={metrics.conversions} icon={Target} />
          <MetricCard title="CTR" value={`${metrics.ctr.toFixed(1)}%`} icon={MousePointerClick} />
          <MetricCard title="Banner Revenue" value={formatCurrency(metrics.bannerRevenue)} icon={BarChart3} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 font-semibold">Revenue Chart</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 font-semibold">Traffic Chart</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trafficChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="visitors" stroke="#22c55e" fill="#22c55e33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold">Top Banners by Performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topBanners.map((b) => ({ name: b.title.slice(0, 20), ctr: b.ctr, revenue: b.revenue }))}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="ctr" fill="hsl(var(--primary))" name="CTR %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </CmsShell>
  );
}
