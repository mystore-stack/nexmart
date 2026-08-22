'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface Metrics {
  totalExecutions: number;
  successRate: number;
  failureRate: number;
  averageDuration: number;
  executionsByType: Record<string, number>;
  executionsByStatus: Record<string, number>;
  executionsOverTime: Array<{ date: string; count: number }>;
  topErrors: Array<{ error: string; count: number }>;
  queueMetrics: Record<string, { waiting: number; active: number; failed: number }>;
}

interface RealTimeStatus {
  recentExecutions: number;
  activeErrors: number;
  timestamp: string;
}

export default function AutomationsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [realTimeStatus, setRealTimeStatus] = useState<RealTimeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/automations/metrics');
      const data = await response.json();
      setMetrics(data.metrics);
      setRealTimeStatus(data.realTimeStatus);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQueueStatus = (queue: any) => {
    if (queue.failed > 10) return 'bg-red-100 text-red-800';
    if (queue.waiting > 100) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automation Control Center</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all automation workflows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMetrics}>
            Refresh
          </Button>
          <Link href="/admin/automations/logs">
            <Button>View Logs</Button>
          </Link>
        </div>
      </div>

      {/* Real-time Status */}
      {realTimeStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-time Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Recent Executions (1h)</p>
                <p className="text-2xl font-bold">{realTimeStatus.recentExecutions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Errors</p>
                <p className="text-2xl font-bold text-red-600">{realTimeStatus.activeErrors}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium">
                  {new Date(realTimeStatus.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <Badge variant={realTimeStatus.activeErrors > 0 ? 'destructive' : 'default'}>
                  {realTimeStatus.activeErrors > 0 ? 'Issues Detected' : 'Healthy'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics?.totalExecutions || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${getStatusColor(metrics?.successRate || 0)}`}>
              {metrics?.successRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failure Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {metrics?.failureRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {metrics?.averageDuration ? `${metrics.averageDuration.toFixed(0)}ms` : '0ms'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Queue Overview</CardTitle>
            <Link href="/admin/automations/queues">
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics?.queueMetrics && Object.entries(metrics.queueMetrics).map(([name, queue]) => (
              <div key={name} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold capitalize">{name.replace('-', ' ')}</h3>
                  <Badge className={getQueueStatus(queue)}>
                    {queue.failed > 10 ? 'Critical' : queue.waiting > 100 ? 'High Load' : 'Healthy'}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Waiting</span>
                    <span className="font-medium">{queue.waiting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium">{queue.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Failed</span>
                    <span className="font-medium text-red-600">{queue.failed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="by-type">
        <TabsList>
          <TabsTrigger value="by-type">By Type</TabsTrigger>
          <TabsTrigger value="by-status">By Status</TabsTrigger>
          <TabsTrigger value="errors">Top Errors</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="by-type" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executions by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.executionsByType && Object.entries(metrics.executionsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type.toLowerCase().replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / metrics.totalExecutions) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executions by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.executionsByStatus && Object.entries(metrics.executionsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{status.toLowerCase()}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'COMPLETED' ? 'bg-green-600' : status === 'FAILED' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${(count / metrics.totalExecutions) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Top Errors</CardTitle>
                <Link href="/admin/automations/errors">
                  <Button variant="outline" size="sm">
                    View All Errors
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {metrics?.topErrors && metrics.topErrors.length > 0 ? (
                <div className="space-y-3">
                  {metrics.topErrors.map((error, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4">
                      <p className="text-sm font-medium text-red-600">{error.count} occurrences</p>
                      <p className="text-xs text-gray-600 mt-1 truncate">{error.error}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No errors recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution Trends (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {metrics?.executionsOverTime.map((item) => (
                  <div key={item.date} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-blue-600 rounded-t"
                      style={{
                        height: `${Math.max((item.count / Math.max(...metrics.executionsOverTime.map(d => d.count))) * 100, 5)}%`,
                      }}
                    />
                    <p className="text-xs text-gray-600 mt-2">{item.date.slice(5)}</p>
                    <p className="text-xs font-medium">{item.count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
