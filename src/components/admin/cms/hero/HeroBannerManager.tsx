"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Upload,
  Sparkles,
  Monitor,
  Smartphone,
} from "lucide-react";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { DragDropList } from "@/components/admin/cms/shared/DragDropList";
import { PreviewPanel } from "@/components/admin/cms/shared/PreviewPanel";
import { StatusBadge } from "@/components/admin/cms/shared/StatusBadge";
import { MetricCard } from "@/components/admin/cms/shared/MetricCard";
import {
  duplicateHeroBanner,
  publishHeroBanner,
  reorderHeroBanners,
  deleteHeroBanner,
} from "@/lib/cms/actions";
import type { CMSContentStatus } from "@prisma/client";

interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  desktopImageUrl?: string | null;
  mobileImageUrl?: string | null;
  primaryButtonText?: string | null;
  status: CMSContentStatus;
  isActive: boolean;
  displayOrder: number;
  impressions: number;
  primaryButtonClicks: number;
  secondaryButtonClicks: number;
  conversionCount: number;
  revenueGenerated: number;
  priorityScore: number;
  publishDate?: string | null;
  expireDate?: string | null;
}

export function HeroBannerManager() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile" | "tablet">("desktop");
  const [selected, setSelected] = useState<HeroBanner | null>(null);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/cms/hero?includeInactive=true");
      const data = await res.json();
      if (data.success) setBanners(data.banners);
    } catch {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const stats = {
    active: banners.filter((b) => b.status === "PUBLISHED" && b.isActive).length,
    scheduled: banners.filter((b) => b.status === "SCHEDULED").length,
    views: banners.reduce((s, b) => s + b.impressions, 0),
    clicks: banners.reduce((s, b) => s + b.primaryButtonClicks + b.secondaryButtonClicks, 0),
    revenue: banners.reduce((s, b) => s + b.revenueGenerated, 0),
  };

  const ctr = stats.views > 0 ? (stats.clicks / stats.views) * 100 : 0;
  const convRate =
    stats.views > 0
      ? (banners.reduce((s, b) => s + b.conversionCount, 0) / stats.views) * 100
      : 0;

  const handleReorder = async (reordered: HeroBanner[]) => {
    setBanners(reordered);
    const result = await reorderHeroBanners({
      items: reordered.map((b, i) => ({ id: b.id, displayOrder: i })),
    });
    if (!result.success) toast.error(result.error);
  };

  const handleDuplicate = async (id: string) => {
    const result = await duplicateHeroBanner(id);
    if (result.success) {
      toast.success("Banner duplicated");
      fetchBanners();
    } else toast.error(result.error);
  };

  const handlePublish = async (id: string) => {
    const result = await publishHeroBanner(id);
    if (result.success) {
      toast.success("Banner published");
      fetchBanners();
    } else toast.error(result.error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const result = await deleteHeroBanner(id);
    if (result.success) {
      toast.success("Banner deleted");
      fetchBanners();
    } else toast.error(result.error);
  };

  return (
    <CmsShell
      title="Hero Banner CMS"
      description="Drag-and-drop banners with scheduling, A/B testing, analytics, and live preview."
      actions={
        <a href="/admin/hero" className="btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm">
          <Plus className="h-4 w-4" /> Create Banner
        </a>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Active Banners" value={stats.active} />
        <MetricCard title="Scheduled" value={stats.scheduled} />
        <MetricCard title="CTR" value={`${ctr.toFixed(1)}%`} />
        <MetricCard title="Conversion Rate" value={`${convRate.toFixed(1)}%`} />
        <MetricCard title="Views" value={stats.views.toLocaleString()} />
        <MetricCard title="Revenue" value={`${stats.revenue.toFixed(0)} MAD`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading banners...</p>
          ) : banners.length === 0 ? (
            <p className="text-sm text-muted-foreground">No banners yet. Create your first hero banner.</p>
          ) : (
            <DragDropList
              items={banners}
              onReorder={handleReorder}
              renderItem={(banner) => (
                <div
                  className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2"
                  onClick={() => setSelected(banner)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{banner.title}</p>
                      <StatusBadge status={banner.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Priority {banner.priorityScore} · {banner.impressions} views
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handlePublish(banner.id); }} className="rounded p-1.5 hover:bg-muted" title="Publish">
                      <Upload className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleDuplicate(banner.id); }} className="rounded p-1.5 hover:bg-muted" title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </button>
                    <a href={`/admin/hero?edit=${banner.id}`} onClick={(e) => e.stopPropagation()} className="rounded p-1.5 hover:bg-muted" title="Edit">
                      <Edit className="h-4 w-4" />
                    </a>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(banner.id); }} className="rounded p-1.5 hover:bg-muted text-red-500" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </div>

        <PreviewPanel device={previewDevice} onDeviceChange={setPreviewDevice}>
          {selected ? (
            <div
              className="relative flex min-h-[320px] flex-col items-start justify-center bg-cover bg-center p-8"
              style={{
                backgroundImage: selected.desktopImageUrl
                  ? `url(${previewDevice === "mobile" && selected.mobileImageUrl ? selected.mobileImageUrl : selected.desktopImageUrl})`
                  : undefined,
                backgroundColor: "#1a1a2e",
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 text-white">
                {selected.badgeText && (
                  <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs">
                    {selected.badgeText}
                  </span>
                )}
                <h2 className="text-2xl font-bold">{selected.title}</h2>
                {selected.subtitle && <p className="mt-2 text-sm opacity-90">{selected.subtitle}</p>}
                {selected.primaryButtonText && (
                  <button type="button" className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">
                    {selected.primaryButtonText}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
              Select a banner to preview
            </div>
          )}
        </PreviewPanel>
      </div>
    </CmsShell>
  );
}
