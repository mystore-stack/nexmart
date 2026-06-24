import Link from "next/link";
import {
  Image,
  LayoutTemplate,
  BellRing,
  PanelBottom,
  FolderOpen,
  Menu,
  Award,
  Megaphone,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { CmsHero } from "@/components/admin/cms/shared/CmsHero";
import { MetricCard } from "@/components/admin/cms/shared/MetricCard";
import { getCmsDashboardMetrics, getTopBanners } from "@/lib/cms/analytics";
import { getCmsActivityLogs } from "@/lib/cms/audit";
import { CMS_MODULES } from "@/lib/cms/constants";
import { requireCmsAccess } from "@/lib/cms/auth";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  LayoutTemplate,
  BellRing,
  PanelBottom,
  FolderOpen,
  Menu,
  Award,
  Megaphone,
  BarChart3,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default async function CmsHubPage() {
  await requireCmsAccess();

  const [metrics, topBanners, activity] = await Promise.all([
    getCmsDashboardMetrics(),
    getTopBanners(5),
    getCmsActivityLogs({ limit: 8 }),
  ]);

  return (
    <CmsShell
      title="Gestion de contenu"
      description="Pilotez l'identité, le SEO et l'expérience client de votre boutique — mises à jour instantanées sur le site live."
    >
      <div className="space-y-8">
        <CmsHero />

        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Active Banners" value={metrics.activeBanners} icon="image" />
          <MetricCard title="Scheduled Banners" value={metrics.scheduledBanners} icon="activity" />
          <MetricCard title="Banner CTR" value={formatPercent(metrics.ctr)} icon="bar-chart" />
          <MetricCard
            title="Conversion Rate"
            value={formatPercent(metrics.conversionRate)}
            icon="bar-chart"
          />
          <MetricCard
            title="Banner Views"
            value={metrics.bannerViews.toLocaleString()}
            icon="image"
          />
          <MetricCard
            title="Revenue Generated"
            value={formatCurrency(metrics.bannerRevenue)}
            icon="megaphone"
          />
          <MetricCard
            title="Announcement CTR"
            value={formatPercent(metrics.announcementCtr)}
            icon="bell"
          />
          <MetricCard title="Store Revenue (30d)" value={formatCurrency(metrics.revenue)} icon="bar-chart" />
        </div>

        {/* Module Grid */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Modules CMS</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CMS_MODULES.filter((m) => m.id !== "analytics").map((mod) => {
              const Icon = ICON_MAP[mod.icon] ?? LayoutTemplate;
              return (
                <Link
                  key={mod.id}
                  href={mod.href}
                  className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{mod.label}</h3>
                  <span className="mt-auto flex items-center gap-1 pt-3 text-xs text-muted-foreground group-hover:text-primary">
                    Ouvrir <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Banners */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-semibold">Bannières les plus performantes</h2>
              <Link href="/admin/cms/analytics" className="text-xs text-primary hover:underline">
                Tout voir
              </Link>
            </div>
            <div className="divide-y divide-border">
              {topBanners.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No banner data yet.</p>
              ) : (
                topBanners.map((banner) => (
                  <div key={banner.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{banner.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {banner.impressions.toLocaleString()} views · {formatPercent(banner.ctr)} CTR
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-green-600">
                      {formatCurrency(banner.revenue)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-semibold">Activité CMS récente</h2>
              <Link href="/admin/audit" className="text-xs text-primary hover:underline">
                Journal d&apos;audit
              </Link>
            </div>
            <div className="divide-y divide-border">
              {activity.logs.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No activity recorded yet.</p>
              ) : (
                activity.logs.map((log) => (
                  <div key={log.id} className="px-4 py-3">
                    <p className="text-sm">
                      <span className="font-medium capitalize">{log.action.toLowerCase()}</span>{" "}
                      <span className="text-muted-foreground">{log.entityType.replace(/_/g, " ")}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </CmsShell>
  );
}
