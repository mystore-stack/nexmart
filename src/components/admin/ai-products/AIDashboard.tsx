"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  Target,
  Zap,
  Activity
} from "lucide-react";

interface DashboardMetrics {
  creditsRemaining: number;
  productsGeneratedToday: number;
  queueCount: number;
  readyCount: number;
  needsReviewCount: number;
  publishedCount: number;
  averageQuality: number;
  averageSeoScore: number;
  processingJobs: number;
  failedJobs: number;
}

interface ChartData {
  dailyGenerated: Array<{ date: string; count: number }>;
  categories: Array<{ name: string; count: number }>;
  languages: Array<{ code: string; count: number }>;
  modelUsage: Array<{ model: string; count: number }>;
}

export function AIDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    creditsRemaining: 850,
    productsGeneratedToday: 24,
    queueCount: 12,
    readyCount: 8,
    needsReviewCount: 5,
    publishedCount: 156,
    averageQuality: 87,
    averageSeoScore: 82,
    processingJobs: 3,
    failedJobs: 1,
  });

  const [chartData, setChartData] = useState<ChartData>({
    dailyGenerated: [
      { date: "Mon", count: 18 },
      { date: "Tue", count: 24 },
      { date: "Wed", count: 32 },
      { date: "Thu", count: 28 },
      { date: "Fri", count: 35 },
      { date: "Sat", count: 22 },
      { date: "Sun", count: 24 },
    ],
    categories: [
      { name: "Electronics", count: 45 },
      { name: "Clothing", count: 32 },
      { name: "Home", count: 28 },
      { name: "Beauty", count: 21 },
      { name: "Sports", count: 15 },
    ],
    languages: [
      { code: "EN", count: 85 },
      { code: "FR", count: 62 },
      { code: "AR", count: 41 },
      { code: "ES", count: 18 },
    ],
    modelUsage: [
      { model: "GPT-4", count: 95 },
      { model: "GPT-3.5", count: 78 },
      { model: "Claude", count: 45 },
      { model: "Gemini", count: 32 },
    ],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 500);
  }, []);

  const MetricCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    trend,
    color = "text-brand-700" 
  }: { 
    icon: any; 
    title: string; 
    value: string | number; 
    subtitle?: string;
    trend?: number;
    color?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div className={`flex items-center mt-2 text-xs ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{trend >= 0 ? "+" : ""}{trend}% from yesterday</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-brand-50 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Product Studio Dashboard</h2>
          <p className="text-muted-foreground">Monitor your AI-powered product generation</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Credits: {metrics.creditsRemaining}/1000
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Sparkles}
          title="Generated Today"
          value={metrics.productsGeneratedToday}
          trend={12}
        />
        {!metrics.queueCount ? null : (
          <MetricCard
            icon={Clock}
            title="In Queue"
            value={metrics.queueCount}
            subtitle="Awaiting processing"
            color="text-amber-600"
          />
        )}
        <MetricCard
          icon={CheckCircle}
          title="Ready to Publish"
          value={metrics.readyCount}
          subtitle="Awaiting review"
          color="text-green-600"
        />
        <MetricCard
          icon={AlertCircle}
          title="Needs Review"
          value={metrics.needsReviewCount}
          subtitle="Action required"
          color="text-orange-600"
        />
        <MetricCard
          icon={Target}
          title="Published"
          value={metrics.publishedCount}
          trend={8}
          color="text-blue-600"
        />
        <MetricCard
          icon={BarChart3}
          title="Avg Quality Score"
          value={`${metrics.averageQuality}%`}
          subtitle="AI-generated content"
          color="text-purple-600"
        />
        <MetricCard
          icon={Zap}
          title="Avg SEO Score"
          value={`${metrics.averageSeoScore}%`}
          subtitle="Search optimization"
          color="text-cyan-600"
        />
        <MetricCard
          icon={Activity}
          title="Processing"
          value={metrics.processingJobs}
          subtitle={metrics.failedJobs > 0 ? `${metrics.failedJobs} failed` : "All systems go"}
          color={metrics.failedJobs > 0 ? "text-red-600" : "text-green-600"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Generated Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Generated Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-2">
              {chartData.dailyGenerated.map((item) => (
                <div key={item.date} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-brand-600 rounded-t transition-all hover:bg-brand-700"
                    style={{ height: `${(item.count / 40) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">{item.date}</span>
                  <span className="text-xs font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generated by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.categories.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-600 transition-all"
                        style={{ width: `${(item.count / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generated by Language</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.languages.map((item) => (
                <div key={item.code} className="flex items-center gap-3">
                  <Badge variant="outline" className="w-12 justify-center">
                    {item.code}
                  </Badge>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 transition-all"
                        style={{ width: `${(item.count / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Model Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Model Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.modelUsage.map((item) => (
                <div key={item.model} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.model}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-600 transition-all"
                        style={{ width: `${(item.count / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
