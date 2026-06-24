"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, MousePointerClick, TrendingUp, TrendingDown, Download, Calendar, BarChart3, PieChart } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Legend } from "recharts";

interface BannerMetric {
  id: string;
  title: string;
  badgeText?: string;
  impressions: number;
  primaryClicks: number;
  secondaryClicks: number;
  totalClicks: number;
  ctr: number;
  isActive: boolean;
  publishDate?: string;
  createdAt: string;
}

interface AnalyticsData {
  overview: {
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    bestPerforming: BannerMetric | null;
    worstPerforming: BannerMetric | null;
  };
  bannerMetrics: BannerMetric[];
  chartData: Array<{ date: string; impressions: number; clicks: number; ctr: string }>;
  topPerformers: {
    byCTR: BannerMetric[];
    byClicks: BannerMetric[];
    byImpressions: BannerMetric[];
  };
  deviceBreakdown: Record<string, number>;
}

const COLORS = ["#14b8a6", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1"];

export default function BannerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, customStart, customEnd]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange === "custom" && customStart && customEnd) {
        params.append("startDate", customStart);
        params.append("endDate", customEnd);
      } else if (dateRange !== "all") {
        const days = parseInt(dateRange);
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        params.append("startDate", start.toISOString());
        params.append("endDate", end.toISOString());
      }

      const response = await fetch(`/api/admin/analytics/banners?${params}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    
    const headers = ["Banner Name", "Badge", "Impressions", "Primary Clicks", "Secondary Clicks", "Total Clicks", "CTR %", "Status", "Publish Date"];
    const rows = data.bannerMetrics.map((b) => [
      b.title,
      b.badgeText || "",
      b.impressions,
      b.primaryClicks,
      b.secondaryClicks,
      b.totalClicks,
      b.ctr,
      b.isActive ? "Active" : "Inactive",
      b.publishDate ? new Date(b.publishDate).toLocaleDateString() : "N/A",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `banner-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) {
    return <div>No analytics data available</div>;
  }

  const { overview, bannerMetrics, chartData, topPerformers, deviceBreakdown } = data;

  const deviceData = Object.entries(deviceBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banner Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Track performance of your hero banners</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          {dateRange === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
          )}
          <Button onClick={exportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.averageCTR.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performing</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold truncate">{overview.bestPerforming?.title || "N/A"}</div>
            <div className="text-xs text-muted-foreground">{overview.bestPerforming?.ctr.toFixed(2)}% CTR</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worst Performing</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold truncate">{overview.worstPerforming?.title || "N/A"}</div>
            <div className="text-xs text-muted-foreground">{overview.worstPerforming?.ctr.toFixed(2)}% CTR</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Impressions & Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="impressions" stroke="#14b8a6" name="Impressions" />
                <Line type="monotone" dataKey="clicks" stroke="#f59e0b" name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Banner Table */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner Name</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Primary Clicks</TableHead>
                <TableHead>Secondary Clicks</TableHead>
                <TableHead>Total Clicks</TableHead>
                <TableHead>CTR %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bannerMetrics.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{banner.title}</div>
                      {banner.badgeText && (
                        <div className="text-xs text-muted-foreground">{banner.badgeText}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{banner.impressions.toLocaleString()}</TableCell>
                  <TableCell>{banner.primaryClicks.toLocaleString()}</TableCell>
                  <TableCell>{banner.secondaryClicks.toLocaleString()}</TableCell>
                  <TableCell>{banner.totalClicks.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={banner.ctr > 2 ? "text-green-500" : banner.ctr > 1 ? "text-yellow-500" : "text-red-500"}>
                      {banner.ctr.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      banner.isActive ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"
                    }`}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {banner.publishDate ? new Date(banner.publishDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top 5 by CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.byCTR.map((banner, index) => (
                <div key={banner.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm font-medium truncate">{banner.title}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-500">{banner.ctr.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="w-4 h-4" />
              Top 5 by Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.byClicks.map((banner, index) => (
                <div key={banner.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm font-medium truncate">{banner.title}</span>
                  </div>
                  <span className="text-sm font-semibold">{banner.totalClicks.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Top 5 by Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.byImpressions.map((banner, index) => (
                <div key={banner.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm font-medium truncate">{banner.title}</span>
                  </div>
                  <span className="text-sm font-semibold">{banner.impressions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
