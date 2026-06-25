"use client";

import { useEffect, useState } from "react";
import { MarketingShell } from "./MarketingShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AD_PLACEMENT_LABELS } from "@/lib/marketing/types";
import type { MarketingAnalyticsSummary } from "@/lib/marketing/types";
import { Eye, MousePointer, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { formatPrice } from "@/utils/format";

export function MarketingAnalyticsDashboard() {
  const [data, setData] = useState<MarketingAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/marketing/analytics", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => { if (json.success) setData(json.data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <MarketingShell title="Marketing Analytics" description="Track ad performance across your store.">
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" /></div>
      </MarketingShell>
    );
  }

  if (!data) return null;

  return (
    <MarketingShell title="Marketing Analytics" description="Views, clicks, CTR, conversions, and revenue.">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Views</CardTitle><Eye className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.totalViews.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Clicks</CardTitle><MousePointer className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.totalClicks.toLocaleString()}</div><p className="text-xs text-muted-foreground">CTR {data.ctr}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Conversions</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.totalConversions.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatPrice(data.totalRevenue)}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Top Performing Ads</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topAds.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{ad.title}</p>
                    <p className="text-xs text-muted-foreground">{AD_PLACEMENT_LABELS[ad.placement]}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p>{ad.impressions} views · {ad.clicks} clicks</p>
                    <p className="text-muted-foreground">CTR {ad.ctr}% · {formatPrice(ad.revenue)}</p>
                  </div>
                </div>
              ))}
              {data.topAds.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>By Placement</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.byPlacement.map((p) => (
                <div key={p.placement} className="flex justify-between text-sm">
                  <span>{AD_PLACEMENT_LABELS[p.placement]}</span>
                  <span className="text-muted-foreground">{p.views} views · {p.clicks} clicks</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
