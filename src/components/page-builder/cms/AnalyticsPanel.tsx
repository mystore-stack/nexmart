'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3,
  X,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer2,
  ShoppingCart,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Flame,
  Eye,
  GitBranch,
  Split
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsPanel({ isOpen, onClose }: AnalyticsPanelProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics = [
    { name: 'Total Visitors', value: 24580, change: 12.5, trend: 'up' },
    { name: 'Page Views', value: 89450, change: 8.3, trend: 'up' },
    { name: 'Unique Visitors', value: 18230, change: 5.2, trend: 'up' },
    { name: 'Bounce Rate', value: 32.4, change: -2.1, trend: 'down', isPercentage: true },
    { name: 'Avg Session Duration', value: '4:32', change: 15.3, trend: 'up' },
    { name: 'Pages per Session', value: 3.6, change: 8.7, trend: 'up' },
  ];

  const conversionMetrics = [
    { name: 'Total Conversions', value: 1245, change: 18.2, trend: 'up' },
    { name: 'Conversion Rate', value: 5.1, change: 12.4, trend: 'up', isPercentage: true },
    { name: 'Total Revenue', value: 45230, change: 22.8, trend: 'up', isCurrency: true },
    { name: 'Average Order Value', value: 36.3, change: 4.2, trend: 'up', isCurrency: true },
    { name: 'Cart Abandonment', value: 68.4, change: -5.3, trend: 'down', isPercentage: true },
  ];

  const heatmapData = [
    { area: 'Hero Section', clicks: 3420, intensity: 95 },
    { area: 'Product Grid', clicks: 2890, intensity: 82 },
    { area: 'CTA Button', clicks: 1850, intensity: 65 },
    { area: 'Navigation', clicks: 1200, intensity: 45 },
    { area: 'Footer', clicks: 890, intensity: 32 },
  ];

  const scrollDepthData = [
    { depth: '25%', users: 24580, percentage: 100 },
    { depth: '50%', users: 18920, percentage: 77 },
    { depth: '75%', users: 12450, percentage: 51 },
    { depth: '100%', users: 8920, percentage: 36 },
  ];

  const funnelData = [
    { stage: 'Visitors', count: 24580, conversion: 100 },
    { stage: 'Product Views', count: 18230, conversion: 74 },
    { stage: 'Add to Cart', count: 8940, conversion: 36 },
    { stage: 'Checkout', count: 4520, conversion: 18 },
    { stage: 'Purchase', count: 1245, conversion: 5 },
  ];

  const abTests = [
    { name: 'Hero CTA Button', variant: 'A', conversion: 4.2, status: 'winner' },
    { name: 'Product Card Layout', variant: 'B', conversion: 5.8, status: 'running' },
    { name: 'Checkout Flow', variant: 'A', conversion: 3.9, status: 'running' },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-[520px] bg-background border-l border-border/40 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-semibold">Analytics Panel</h3>
                <Badge variant="outline" className="text-xs">
                  Real-time
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="h-8 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8">
                <Calendar className="w-4 h-4 mr-1" />
                Custom
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Overview Metrics */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">Overview</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {metrics.map((metric) => (
                    <div key={metric.name} className="p-3 rounded-lg border border-border/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{metric.name}</span>
                        {metric.trend === 'up' ? (
                          <ArrowUpRight className="w-3 h-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        {metric.isPercentage ? metric.value + '%' : metric.value}
                      </div>
                      <div className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="conversions" className="space-y-4">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="conversions" className="text-xs">
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Conversions
                  </TabsTrigger>
                  <TabsTrigger value="heatmap" className="text-xs">
                    <Flame className="w-3 h-3 mr-1" />
                    Heatmap
                  </TabsTrigger>
                  <TabsTrigger value="scroll" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Scroll
                  </TabsTrigger>
                  <TabsTrigger value="funnel" className="text-xs">
                    <GitBranch className="w-3 h-3 mr-1" />
                    Funnel
                  </TabsTrigger>
                </TabsList>

                {/* Conversions Tab */}
                <TabsContent value="conversions" className="space-y-3">
                  <div className="space-y-3">
                    {conversionMetrics.map((metric) => (
                      <div key={metric.name} className="p-3 rounded-lg border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{metric.name}</span>
                          <div className={`flex items-center gap-1 text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </div>
                        </div>
                        <div className="text-2xl font-bold">
                          {metric.isCurrency ? '$' + metric.value.toLocaleString() : metric.isPercentage ? metric.value + '%' : metric.value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-brand-500/10 to-brand-600/10 border border-brand-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-brand-500" />
                      <span className="text-sm font-medium">Revenue Trend</span>
                    </div>
                    <div className="text-3xl font-bold text-brand-600">$45,230</div>
                    <div className="text-xs text-muted-foreground mt-1">+22.8% from last period</div>
                  </div>
                </TabsContent>

                {/* Heatmap Tab */}
                <TabsContent value="heatmap" className="space-y-3">
                  <div className="space-y-3">
                    {heatmapData.map((area) => (
                      <div key={area.area} className="p-3 rounded-lg border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{area.area}</span>
                          <span className="text-xs text-muted-foreground">{area.clicks.toLocaleString()} clicks</span>
                        </div>
                        <Progress value={area.intensity} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">{area.intensity}% intensity</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <MousePointer2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Click Insights</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>• Hero section gets most engagement</div>
                      <div>• CTA button has 65% click-through rate</div>
                      <div>• Navigation used by 45% of visitors</div>
                    </div>
                  </div>
                </TabsContent>

                {/* Scroll Depth Tab */}
                <TabsContent value="scroll" className="space-y-3">
                  <div className="space-y-3">
                    {scrollDepthData.map((depth) => (
                      <div key={depth.depth} className="p-3 rounded-lg border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{depth.depth} Scroll Depth</span>
                          <span className="text-xs text-muted-foreground">{depth.users.toLocaleString()} users</span>
                        </div>
                        <Progress value={depth.percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">{depth.percentage}% of visitors</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Engagement Insights</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>• 36% of visitors scroll to bottom</div>
                      <div>• Average scroll depth: 68%</div>
                      <div>• Peak engagement at 50% depth</div>
                    </div>
                  </div>
                </TabsContent>

                {/* Funnel Tab */}
                <TabsContent value="funnel" className="space-y-3">
                  <div className="space-y-3">
                    {funnelData.map((stage, index) => (
                      <div key={stage.stage} className="p-3 rounded-lg border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <Badge variant="outline" className="text-xs">
                            {stage.conversion}%
                          </Badge>
                        </div>
                        <div className="text-lg font-bold">{stage.count.toLocaleString()}</div>
                        <Progress value={stage.conversion} className="h-2 mt-2" />
                        {index < funnelData.length - 1 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Drop-off: {((funnelData[index].count - funnelData[index + 1].count) / funnelData[index].count * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Overall Conversion</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">5.1%</div>
                    <div className="text-xs text-muted-foreground mt-1">+12.4% from last period</div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* A/B Testing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Split className="w-4 h-4" />
                    <span className="text-sm font-medium">A/B Tests</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-7">
                    <GitBranch className="w-3 h-3 mr-1" />
                    New Test
                  </Button>
                </div>
                <div className="space-y-2">
                  {abTests.map((test) => (
                    <div key={test.name} className="p-3 rounded-lg border border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{test.name}</span>
                        <Badge variant={test.status === 'winner' ? 'default' : 'secondary'} className="text-xs">
                          {test.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Variant {test.variant}</span>
                          <span className="text-sm font-bold">{test.conversion}%</span>
                        </div>
                        {test.status === 'winner' && (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-500">
                            Winner
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border/40">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last updated: Just now</span>
              <Button variant="ghost" size="sm" className="h-7">
                <Download className="w-3 h-3 mr-1" />
                Export Report
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
