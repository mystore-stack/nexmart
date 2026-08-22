"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, MousePointerClick, Download, BarChart3, PieChart, Filter } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from "recharts";
import { formatPrice } from "@/utils/format";

const COLORS = ["#14b8a6", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#22c55e"];

export default function MarketingAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/marketing?range=${range}`, {
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
    
    const headers = ["Channel", "Impressions", "Clicks", "Conversions", "Revenue", "ROAS"];
    const rows = data.attribution.map((item: any) => [
      item.channel,
      item.impressions,
      item.clicks,
      item.conversions,
      item.revenue.toFixed(2),
      item.roas.toFixed(2),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-analytics-${new Date().toISOString().split("T")[0]}.csv`;
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

  const { overview, attribution, funnelMetrics, campaignPerformance, chartData } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">ROAS, CPA, and attribution insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{overview.totalOrders} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">ROAS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.roas.toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground mt-1">Return on ad spend</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">CPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(overview.cpa)}</div>
            <p className="text-xs text-muted-foreground mt-1">Cost per acquisition</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.newCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Acquired this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Attribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Attribution by Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={attribution.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.channel.split("/")[0]}: ${((entry.revenue / overview.totalRevenue) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {attribution.slice(0, 6).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Page Views", value: funnelMetrics.pageViews, rate: 100 },
                { label: "Product Views", value: funnelMetrics.productViews, rate: funnelMetrics.viewToProductRate },
                { label: "Add to Cart", value: funnelMetrics.addToCart, rate: funnelMetrics.productToCartRate },
                { label: "Checkout Started", value: funnelMetrics.checkoutStarted, rate: funnelMetrics.cartToCheckoutRate },
                { label: "Purchases", value: funnelMetrics.purchases, rate: funnelMetrics.checkoutToPurchaseRate },
              ].map((step, index) => (
                <div key={step.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{step.label}</span>
                    <span className="text-muted-foreground">{step.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${step.rate}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{step.rate.toFixed(1)}% conversion</div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Overall Conversion Rate</span>
                  <span>{funnelMetrics.overallConversionRate.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attribution Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Channel Attribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attribution.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.channel}</TableCell>
                  <TableCell className="text-right">{item.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.conversions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatPrice(item.revenue)}</TableCell>
                  <TableCell className="text-right">
                    <span className={item.roas >= 1 ? "text-green-600" : "text-red-500"}>
                      {item.roas.toFixed(2)}x
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignPerformance.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.campaign}</TableCell>
                  <TableCell className="text-right">{item.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.ctr.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{item.conversions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.conversionRate.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Marketing Metrics Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pageViews" stroke="#14b8a6" name="Page Views" />
              <Line type="monotone" dataKey="addToCart" stroke="#f59e0b" name="Add to Cart" />
              <Line type="monotone" dataKey="checkoutStarted" stroke="#8b5cf6" name="Checkout Started" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
