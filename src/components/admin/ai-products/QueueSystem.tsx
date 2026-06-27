"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Layers,
  Filter,
  ArrowUp,
  ArrowDown
} from "lucide-react";

type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled" | "retrying";
type JobPriority = "low" | "normal" | "high" | "urgent";

interface QueueJob {
  id: string;
  type: "product_generation" | "bulk_import" | "image_analysis" | "seo_analysis" | "price_analysis";
  status: JobStatus;
  priority: JobPriority;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
  estimatedTime?: number;
  actualTime?: number;
}

interface QueueSystemProps {
  onJobAction?: (jobId: string, action: string) => void;
  disabled?: boolean;
}

export function QueueSystem({ onJobAction, disabled = false }: QueueSystemProps) {
  const [jobs, setJobs] = useState<QueueJob[]>([
    {
      id: "1",
      type: "product_generation",
      status: "processing",
      priority: "high",
      progress: 45,
      createdAt: new Date(Date.now() - 300000),
      startedAt: new Date(Date.now() - 240000),
      retryCount: 0,
      maxRetries: 3,
      estimatedTime: 120,
    },
    {
      id: "2",
      type: "bulk_import",
      status: "queued",
      priority: "urgent",
      progress: 0,
      createdAt: new Date(Date.now() - 60000),
      retryCount: 0,
      maxRetries: 3,
      estimatedTime: 300,
    },
    {
      id: "3",
      type: "image_analysis",
      status: "queued",
      priority: "normal",
      progress: 0,
      createdAt: new Date(Date.now() - 120000),
      retryCount: 0,
      maxRetries: 3,
      estimatedTime: 60,
    },
    {
      id: "4",
      type: "seo_analysis",
      status: "failed",
      priority: "normal",
      progress: 75,
      createdAt: new Date(Date.now() - 600000),
      startedAt: new Date(Date.now() - 540000),
      completedAt: new Date(Date.now() - 120000),
      retryCount: 1,
      maxRetries: 3,
      error: "API rate limit exceeded",
      estimatedTime: 45,
      actualTime: 60,
    },
  ]);

  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"priority" | "date" | "status">("priority");

  useEffect(() => {
    // Simulate job progress
    const interval = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.status === "processing" && job.progress < 100) {
          const newProgress = Math.min(job.progress + Math.random() * 5, 100);
          if (newProgress >= 100) {
            return {
              ...job,
              progress: 100,
              status: "completed" as JobStatus,
              completedAt: new Date(),
              actualTime: Math.floor((Date.now() - (job.startedAt?.getTime() || Date.now())) / 1000),
            };
          }
          return { ...job, progress: newProgress };
        }
        return job;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleJobAction = (jobId: string, action: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      
      switch (action) {
        case "pause":
          return { ...job, status: "queued" as JobStatus };
        case "resume":
          return { ...job, status: "processing" as JobStatus, startedAt: new Date() };
        case "cancel":
          return { ...job, status: "cancelled" as JobStatus };
        case "retry":
          return { 
            ...job, 
            status: "retrying" as JobStatus, 
            retryCount: job.retryCount + 1,
            progress: 0,
            startedAt: new Date(),
          };
        default:
          return job;
      }
    }));
    onJobAction?.(jobId, action);
  };

  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case "urgent": return "bg-red-600";
      case "high": return "bg-orange-600";
      case "normal": return "bg-blue-600";
      case "low": return "bg-gray-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case "processing": return "text-blue-600";
      case "completed": return "text-green-600";
      case "failed": return "text-red-600";
      case "cancelled": return "text-gray-600";
      case "retrying": return "text-amber-600";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case "processing": return <Clock className="h-4 w-4 animate-spin" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      case "retrying": return <RotateCcw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product_generation": return "Product Generation";
      case "bulk_import": return "Bulk Import";
      case "image_analysis": return "Image Analysis";
      case "seo_analysis": return "SEO Analysis";
      case "price_analysis": return "Price Analysis";
      default: return type;
    }
  };

  const filteredJobs = filter === "all" 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === "date") {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    return 0;
  });

  const stats = {
    total: jobs.length,
    queued: jobs.filter(j => j.status === "queued" || j.status === "retrying").length,
    processing: jobs.filter(j => j.status === "processing").length,
    completed: jobs.filter(j => j.status === "completed").length,
    failed: jobs.filter(j => j.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Layers className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-amber-600" />
            <p className="text-2xl font-bold">{stats.queued}</p>
            <p className="text-xs text-muted-foreground">Queued</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{stats.processing}</p>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold">{stats.failed}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Job Queue
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "priority" ? "date" : "priority")}
              >
                {sortBy === "priority" ? <ArrowDown className="h-4 w-4 mr-1" /> : <ArrowUp className="h-4 w-4 mr-1" />}
                {sortBy === "priority" ? "Priority" : "Date"}
              </Button>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as JobStatus | "all")}
                className="px-3 py-2 border rounded-md text-sm"
                disabled={disabled}
              >
                <option value="all">All Status</option>
                <option value="queued">Queued</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedJobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={getStatusColor(job.status)}>
                      {getStatusIcon(job.status)}
                    </div>
                    <div>
                      <p className="font-medium">{getTypeLabel(job.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.createdAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(job.priority)}>
                      {job.priority}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </div>

                {job.status === "processing" && (
                  <Progress value={job.progress} className="h-2" />
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Progress: {Math.round(job.progress)}%
                    </span>
                    {job.estimatedTime && (
                      <span className="text-muted-foreground">
                        Est: {job.estimatedTime}s
                      </span>
                    )}
                    {job.actualTime && (
                      <span className="text-muted-foreground">
                        Actual: {job.actualTime}s
                      </span>
                    )}
                  </div>
                  {job.retryCount > 0 && (
                    <Badge variant="outline" className="text-amber-600">
                      Retry {job.retryCount}/{job.maxRetries}
                    </Badge>
                  )}
                </div>

                {job.error && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-red-700 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{job.error}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {job.status === "processing" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJobAction(job.id, "pause")}
                      disabled={disabled}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {(job.status === "queued" || job.status === "retrying") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJobAction(job.id, "resume")}
                      disabled={disabled}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  {(job.status === "queued" || job.status === "processing" || job.status === "retrying") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJobAction(job.id, "cancel")}
                      disabled={disabled}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  {job.status === "failed" && job.retryCount < job.maxRetries && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJobAction(job.id, "retry")}
                      disabled={disabled}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sortedJobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No jobs in queue</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
