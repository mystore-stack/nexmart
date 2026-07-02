'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobStatus } from '@prisma/client';
import Link from 'next/link';

interface QueueJob {
  id: string;
  jobId: string;
  queueName: string;
  name: string;
  data: unknown;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  failedReason: string | null;
  stacktrace: string | null;
  processedOn: Date | null;
  finishedOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface QueueStatistics {
  total: number;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  successRate: number;
}

interface PaginatedQueueJobs {
  jobs: QueueJob[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ErrorResponse {
  jobs: QueueJob[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  statistics: QueueStatistics;
}

export default function AutomationErrorsPage() {
  const [data, setData] = useState<ErrorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<QueueJob | null>(null);
  const [filters, setFilters] = useState({
    queueName: '',
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    fetchErrors();
  }, [filters]);

  const fetchErrors = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.queueName) params.append('queueName', filters.queueName);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/admin/automations/errors?${params.toString()}`);
      const responseData = await response.json();
      setData(responseData);
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/automations/queues/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry' }),
      });

      if (response.ok) {
        fetchErrors();
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Failed to retry job:', error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this failed job?')) return;

    try {
      const response = await fetch(`/api/admin/automations/queues/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchErrors();
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const handleRetryAll = async () => {
    if (!confirm(`Are you sure you want to retry all ${data?.jobs.length} failed jobs?`)) return;

    try {
      const promises = data?.jobs.map(job => 
        fetch(`/api/admin/automations/queues/${job.jobId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'retry' }),
        })
      ) || [];

      await Promise.all(promises);
      fetchErrors();
    } catch (error) {
      console.error('Failed to retry all jobs:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
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
          <h1 className="text-3xl font-bold">Failed Jobs</h1>
          <p className="text-gray-600 mt-1">View and manage failed queue jobs</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/automations">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          {data?.jobs.length && data.jobs.length > 0 && (
            <Button onClick={handleRetryAll}>
              Retry All ({data.jobs.length})
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {data?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.statistics.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{data.statistics.failed}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Waiting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{data.statistics.waiting}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{data.statistics.active}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{data.statistics.completed}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.statistics.successRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Queue</label>
              <Select value={filters.queueName || "all"} onValueChange={(value) => setFilters({ ...filters, queueName: value === "all" ? "" : value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="All queues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All queues</SelectItem>
                  <SelectItem value="email-queue">Email Queue</SelectItem>
                  <SelectItem value="analytics-queue">Analytics Queue</SelectItem>
                  <SelectItem value="notifications-queue">Notifications Queue</SelectItem>
                  <SelectItem value="inventory-sync-queue">Inventory Sync Queue</SelectItem>
                  <SelectItem value="ai-scoring-queue">AI Scoring Queue</SelectItem>
                  <SelectItem value="abandoned-cart-queue">Abandoned Cart Queue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={() => setFilters({ queueName: '', page: 1, limit: 50 })}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Failed Jobs ({data?.pagination.total || 0})</CardTitle>
            <Select value={filters.limit.toString()} onValueChange={(value) => setFilters({ ...filters, limit: parseInt(value), page: 1 })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Queue</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Job Name</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Attempts</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Failed At</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Error</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.jobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm capitalize">{job.queueName.replace('-', ' ')}</td>
                    <td className="py-3 px-4 text-sm">{job.name}</td>
                    <td className="py-3 px-4 text-sm">
                      {job.attempts} / {job.maxAttempts}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {job.finishedOn ? new Date(job.finishedOn).toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm max-w-md truncate">
                      <span className="text-red-600">{job.failedReason || 'Unknown error'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedJob(job)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(job.jobId)}
                        >
                          Retry
                        </Button>
                        <Button
                          variant={"outline" as any}
                          size="sm"
                          onClick={() => handleDelete(job.jobId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.jobs.length === 0 && (
            <div className="text-center py-12 text-gray-500">No failed jobs found</div>
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {filters.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Failed Job Details</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Job ID</p>
                  <p className="text-sm">{selectedJob.jobId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Queue</p>
                  <p className="text-sm capitalize">{selectedJob.queueName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-sm">{selectedJob.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Attempts</p>
                  <p className="text-sm">{selectedJob.attempts} / {selectedJob.maxAttempts}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created At</p>
                  <p className="text-sm">{new Date(selectedJob.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed At</p>
                  <p className="text-sm">{selectedJob.finishedOn ? new Date(selectedJob.finishedOn).toLocaleString() : '-'}</p>
                </div>
              </div>

              {selectedJob.failedReason && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Failed Reason</p>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{selectedJob.failedReason}</p>
                </div>
              )}

              {selectedJob.stacktrace && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Stacktrace</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-40">{selectedJob.stacktrace}</pre>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Job Data</p>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-40">{JSON.stringify(selectedJob.data, null, 2)}</pre>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleRetry(selectedJob.jobId)}>
                  Retry Job
                </Button>
                <Button variant={"destructive" as any} onClick={() => handleDelete(selectedJob.jobId)}>
                  Delete Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
