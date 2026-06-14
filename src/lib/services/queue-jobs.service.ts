// src/lib/services/queue-jobs.service.ts
// Queue job management service

import { prisma } from '../prisma';
import { JobStatus } from '@prisma/client';
import { Queue, Job } from 'bullmq';
import { redis } from '../redis';

interface QueueJobQueryOptions {
  queueName?: string;
  status?: JobStatus;
  page?: number;
  limit?: number;
}

interface PaginatedQueueJobs {
  jobs: Array<{
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
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Get queue jobs with pagination and filtering
 */
export async function getQueueJobs(options: QueueJobQueryOptions = {}): Promise<PaginatedQueueJobs> {
  const { queueName, status, page = 1, limit = 50 } = options;

  const whereClause: any = {};
  if (queueName) whereClause.queueName = queueName;
  if (status) whereClause.status = status;

  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    prisma.queueJob.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.queueJob.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

/**
 * Get queue job by ID
 */
export async function getQueueJobById(id: string) {
  return prisma.queueJob.findUnique({
    where: { id },
  });
}

/**
 * Get queue job by BullMQ job ID
 */
export async function getQueueJobByJobId(jobId: string) {
  return prisma.queueJob.findUnique({
    where: { jobId },
  });
}

/**
 * Retry a failed job
 */
export async function retryJob(jobId: string) {
  const job = await prisma.queueJob.findUnique({
    where: { jobId },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.status !== JobStatus.FAILED) {
    throw new Error('Only failed jobs can be retried');
  }

  // Update job status
  await prisma.queueJob.update({
    where: { id: job.id },
    data: {
      status: JobStatus.WAITING,
      attempts: 0,
      failedReason: null,
      stacktrace: null,
      processedOn: null,
      finishedOn: null,
    },
  });

  // Add job back to queue (disabled - Redis removed)
  try {
    console.log('[Queue Jobs Service] Queue operations disabled - Redis removed');
    return { success: true, jobId: job.jobId };
  } catch (error) {
    console.error('[Queue Jobs Service] Failed to retry job:', error);
    throw error;
  }
}

/**
 * Delete a job
 */
export async function deleteJob(jobId: string) {
  const job = await prisma.queueJob.findUnique({
    where: { jobId },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  // Remove from BullMQ queue (disabled - Redis removed)
  try {
    console.log('[Queue Jobs Service] Queue operations disabled - Redis removed');
  } catch (error) {
    console.error('[Queue Jobs Service] Failed to remove job from queue:', error);
  }

  // Delete from database
  await prisma.queueJob.delete({
    where: { id: job.id },
  });

  return { success: true, jobId: job.jobId };
}

/**
 * Get queue statistics
 */
export async function getQueueStatistics(queueName?: string) {
  const whereClause = queueName ? { queueName } : {};

  const [total, waiting, active, completed, failed, delayed] = await Promise.all([
    prisma.queueJob.count({ where: whereClause }),
    prisma.queueJob.count({ where: { ...whereClause, status: JobStatus.WAITING } }),
    prisma.queueJob.count({ where: { ...whereClause, status: JobStatus.ACTIVE } }),
    prisma.queueJob.count({ where: { ...whereClause, status: JobStatus.COMPLETED } }),
    prisma.queueJob.count({ where: { ...whereClause, status: JobStatus.FAILED } }),
    prisma.queueJob.count({ where: { ...whereClause, status: JobStatus.DELAYED } }),
  ]);

  return {
    total,
    waiting,
    active,
    completed,
    failed,
    delayed,
    successRate: total > 0 ? (completed / total) * 100 : 0,
  };
}

/**
 * Sync BullMQ jobs to database
 * Called periodically to keep database in sync with queue
 */
export async function syncQueueJobs(queueName: string) {
  try {
    console.log('[Queue Jobs Service] Queue operations disabled - Redis removed');
    return { synced: 0 };
  } catch (error) {
    console.error('[Queue Jobs Service] Failed to sync queue jobs:', error);
    throw error;
  }
}

/**
 * Convert BullMQ job status to JobStatus enum
 */
function getJobStatusFromBullMQ(job: Job): JobStatus {
  if (job.failedReason) return JobStatus.FAILED;
  if (job.processedOn && !job.finishedOn) return JobStatus.ACTIVE;
  if (job.finishedOn) return JobStatus.COMPLETED;
  if (job.delay) return JobStatus.DELAYED;
  return JobStatus.WAITING;
}
