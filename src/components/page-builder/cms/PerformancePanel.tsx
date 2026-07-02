'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gauge,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Zap,
  FileText,
  Image as ImageIcon,
  Code,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PerformancePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Metric {
  name: string;
  value: number;
  max: number;
  status: 'good' | 'needs-improvement' | 'poor';
  description: string;
}

export function PerformancePanel({ isOpen, onClose }: PerformancePanelProps) {
  const [isScanning, setIsScanning] = useState(false);

  const lighthouseMetrics: Metric[] = [
    { name: 'Performance', value: 92, max: 100, status: 'good', description: 'Fast load time and smooth interactions' },
    { name: 'Accessibility', value: 88, max: 100, status: 'needs-improvement', description: 'Screen reader and keyboard navigation' },
    { name: 'Best Practices', value: 95, max: 100, status: 'good', description: 'Modern web standards and security' },
    { name: 'SEO', value: 90, max: 100, status: 'good', description: 'Search engine optimization' },
  ];

  const coreWebVitals: Metric[] = [
    { name: 'LCP', value: 1.2, max: 2.5, status: 'good', description: 'Largest Contentful Paint (2.5s)' },
    { name: 'FID', value: 45, max: 100, status: 'good', description: 'First Input Delay (100ms)' },
    { name: 'CLS', value: 0.05, max: 0.1, status: 'good', description: 'Cumulative Layout Shift (0.1)' },
    { name: 'INP', value: 85, max: 200, status: 'good', description: 'Interaction to Next Paint (200ms)' },
  ];

  const bundleMetrics = [
    { name: 'Total Bundle Size', value: 245, max: 500, status: 'good', unit: 'KB' },
    { name: 'JavaScript Size', value: 180, max: 300, status: 'good', unit: 'KB' },
    { name: 'CSS Size', value: 45, max: 100, status: 'good', unit: 'KB' },
    { name: 'Unused CSS', value: 12, max: 50, status: 'good', unit: 'KB' },
    { name: 'Unused JS', value: 35, max: 100, status: 'good', unit: 'KB' },
  ];

  const imageMetrics = [
    { name: 'Total Images', value: 15, max: 50, status: 'good', unit: '' },
    { name: 'Unoptimized Images', value: 2, max: 10, status: 'needs-improvement', unit: '' },
    { name: 'Lazy Loaded', value: 12, max: 15, status: 'good', unit: '' },
    { name: 'WebP Format', value: 10, max: 15, status: 'good', unit: '' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'needs-improvement':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'poor':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'needs-improvement':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-[480px] bg-background border-l border-border/40 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                <h3 className="font-semibold">Performance Panel</h3>
                <Badge variant="outline" className="text-xs">
                  Lighthouse
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Performance Audit
                </>
              )}
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Overall Score */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-brand-500/10 to-brand-600/10 border border-brand-500/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge className={getScoreColor(91) + ' bg-transparent border-current'}>
                    91
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {lighthouseMetrics.map((metric) => (
                    <div key={metric.name} className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                        {metric.value}
                      </div>
                      <div className="text-xs text-muted-foreground">{metric.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="vitals" className="space-y-4">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="vitals" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Vitals
                  </TabsTrigger>
                  <TabsTrigger value="bundle" className="text-xs">
                    <Code className="w-3 h-3 mr-1" />
                    Bundle
                  </TabsTrigger>
                  <TabsTrigger value="images" className="text-xs">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Images
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Tips
                  </TabsTrigger>
                </TabsList>

                {/* Core Web Vitals */}
                <TabsContent value="vitals" className="space-y-3">
                  <div className="space-y-3">
                    {coreWebVitals.map((metric) => (
                      <div key={metric.name} className="p-3 rounded-lg border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(metric.status)}
                            <span className="text-sm font-medium">{metric.name}</span>
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor((metric.value / metric.max) * 100)}`}>
                            {metric.value}
                          </span>
                        </div>
                        <Progress 
                          value={(metric.value / metric.max) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Bundle Size */}
                <TabsContent value="bundle" className="space-y-3">
                  <div className="space-y-3">
                    {bundleMetrics.map((metric) => (
                      <div key={metric.name} className="p-3 rounded-lg border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(metric.status)}
                            <span className="text-sm font-medium">{metric.name}</span>
                          </div>
                          <span className="text-sm font-bold">
                            {metric.value}{metric.unit}
                          </span>
                        </div>
                        <Progress 
                          value={(metric.value / metric.max) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Optimization Opportunities</span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Minify JavaScript (saves ~15KB)</li>
                  <li>• Tree-shake unused dependencies (saves ~20KB)</li>
                  <li>• Enable code splitting (improves initial load)</li>
                </ul>
              </div>
                </TabsContent>

                {/* Images */}
                <TabsContent value="images" className="space-y-3">
                  <div className="space-y-3">
                    {imageMetrics.map((metric) => (
                      <div key={metric.name} className="p-3 rounded-lg border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(metric.status)}
                            <span className="text-sm font-medium">{metric.name}</span>
                          </div>
                          <span className="text-sm font-bold">
                            {metric.value}{metric.unit}
                          </span>
                        </div>
                        <Progress 
                          value={(metric.value / metric.max) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">Image Optimization</span>
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• Convert remaining images to WebP</li>
                      <li>• Implement responsive images with srcset</li>
                      <li>• Add lazy loading to above-the-fold images</li>
                    </ul>
                  </div>
                </TabsContent>

                {/* Recommendations */}
                <TabsContent value="recommendations" className="space-y-3">
                  <div className="space-y-3">
                    {[
                      {
                        icon: <TrendingUp className="w-4 h-4 text-green-500" />,
                        title: 'Enable Text Compression',
                        impact: 'high',
                        description: 'Compress text resources with gzip or brotli'
                      },
                      {
                        icon: <Zap className="w-4 h-4 text-yellow-500" />,
                        title: 'Reduce JavaScript Execution Time',
                        impact: 'medium',
                        description: 'Minimize main-thread work'
                      },
                      {
                        icon: <Upload className="w-4 h-4 text-blue-500" />,
                        title: 'Preload Critical Resources',
                        impact: 'medium',
                        description: 'Preload key CSS and fonts'
                      },
                      {
                        icon: <Code className="w-4 h-4 text-purple-500" />,
                        title: 'Remove Unused CSS',
                        impact: 'low',
                        description: 'Eliminate unused styles from bundle'
                      },
                      {
                        icon: <ImageIcon className="w-4 h-4 text-orange-500" />,
                        title: 'Serve Images in Next-Gen Formats',
                        impact: 'high',
                        description: 'Use WebP or AVIF formats'
                      },
                    ].map((rec, index) => (
                      <div key={index} className="p-3 rounded-lg border border-border/40">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted/50">
                            {rec.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{rec.title}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  rec.impact === 'high' ? 'border-red-500 text-red-500' :
                                  rec.impact === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                  'border-blue-500 text-blue-500'
                                }`}
                              >
                                {rec.impact}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{rec.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border/40">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last scan: 2 minutes ago</span>
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
