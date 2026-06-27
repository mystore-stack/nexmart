"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Target,
  Zap,
  Download,
  Calendar,
  Filter
} from "lucide-react";

interface AnalyticsData {
  generationTime: number;
  averageQuality: number;
  mostGeneratedCategories: Array<{ name: string; count: number }>;
  aiUsage: {
    totalRequests: number;
    costPerProduct: number;
    totalCost: number;
  };
  modelUsage: Array<{ model: string; count: number; percentage: number }>;
  languageUsage: Array<{ language: string; count: number; percentage: number }>;
  topPerformingProducts: Array<{
    id: string;
    name: string;
    views: number;
    conversions: number;
    revenue: number;
  }>;
}

interface AnalyticsDashboardProps {
  dateRange?: "7d" | "30d" | "90d" | "1y";
  onDateRangeChange?: (range: string) => void;
  disabled?: boolean;
}

export function AnalyticsDashboard({ 
  dateRange = "30d", 
  onDateRangeChange, 
  disabled = false 
}: AnalyticsDashboardProps) {
  const [data] = useState<AnalyticsData>({
    generationTime: 45,
    averageQuality: 87,
    mostGeneratedCategories: [
      { name: "Electronics", count: 156 },
      { name: "Clothing", count: 124 },
      { name: "Home & Garden", count: 98 },
      { name: "Beauty", count: 76 },
      { name: "Sports", count: 54 },
    ],
    aiUsage: {
      totalRequests: 508,
      costPerProduct: 0.15,
      totalCost: 76.20,
    },
    modelUsage: [
      { model: "GPT-4", count: 245, percentage: 48 },
      { model: "GPT-3.5 Turbo", count: 156, percentage: 31 },
      { model: "Claude 3", count: 76, percentage: 15 },
      { model: "Gemini", count: 31, percentage: 6 },
    ],
    languageUsage: [
      { language: "English", count: 245, percentage: 48 },
      { language: "French", count: 156, percentage: 31 },
      { language: "Arabic", count: 76, percentage: 15 },
      { language: "Spanish", count: 31, percentage: 6 },
    ],
    topPerformingProducts: [
      { id: "1", name: "Moroccan Ceramic Vase", views: 1245, conversions: 89, revenue: 8900 },
      { id: "2", name: "Leather Bag", views: 987, conversions: 67, revenue: 6700 },
      { id: "3", name: "Spice Set", views: 756, conversions: 54, revenue: 3240 },
      { id: "4", name: "Traditional Rug", views: 634, conversions: 45, revenue: 4500 },
      { id: "5", name: "Argan Oil", views: 523, conversions: 38, revenue: 1900 },
    ],
  });

  const exportData = () => {
    // Simulate export
    console.log("Exporting analytics data...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track AI-powered product generation performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={onDateRangeChange} disabled={disabled}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData} disabled={disabled}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Generation Time</p>
                <p className="text-3xl font-bold mt-1">{data.generationTime}s</p>
                <p className="text-xs text-green-600 mt-1">↓ 12% from last period</p>
              </div>
              <Clock className="h-10 w-10 text-blue-600 bg-blue-50 p-2 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Quality Score</p>
                <p className="text-3xl font-bold mt-1">{data.averageQuality}%</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% from last period</p>
              </div>
              <Target className="h-10 w-10 text-green-600 bg-green-50 p-2 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total AI Requests</p>
                <p className="text-3xl font-bold mt-1">{data.aiUsage.totalRequests}</p>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </div>
              <Zap className="h-10 w-10 text-purple-600 bg-purple-50 p-2 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total AI Cost</p>
                <p className="text-3xl font-bold mt-1">${data.aiUsage.totalCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">${data.aiUsage.costPerProduct}/product</p>
              </div>
              <DollarSign className="h-10 w-10 text-amber-600 bg-amber-50 p-2 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Most Generated Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Most Generated Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.mostGeneratedCategories.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-muted-foreground">{category.count} products</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-600 transition-all"
                      style={{ width: `${(category.count / 156) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Model Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Model Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.modelUsage.map((model) => (
                <div key={model.model} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{model.model}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{model.count} requests</span>
                      <Badge variant="outline">{model.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 transition-all"
                      style={{ width: `${model.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Generation by Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.languageUsage.map((lang) => (
                <div key={lang.language} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{lang.language}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{lang.count} products</span>
                      <Badge variant="outline">{lang.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-600 transition-all"
                      style={{ width: `${lang.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Total Products Generated</span>
                <span className="font-semibold">{data.aiUsage.totalRequests}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Cost per Product</span>
                <span className="font-semibold">${data.aiUsage.costPerProduct.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Total Cost</span>
                <span className="font-semibold text-green-600">${data.aiUsage.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm text-green-900 font-medium">Estimated Savings</span>
                <span className="font-semibold text-green-700">$234.50</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing AI-Generated Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topPerformingProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.views} views • {product.conversions} conversions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${product.revenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
