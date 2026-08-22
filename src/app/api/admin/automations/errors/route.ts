import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { getQueueJobs, getQueueStatistics } from '@/lib/services/queue-jobs.service';
import { JobStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const queueName = searchParams.get('queueName') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get failed jobs
    const result = await getQueueJobs({
      queueName,
      status: JobStatus.FAILED,
      page,
      limit,
    });

    // Get error statistics
    const stats = await getQueueStatistics(queueName);

    return NextResponse.json({
      ...result,
      statistics: stats,
    });
  } catch (error) {
    console.error('[AUTOMATION_ERRORS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch errors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
