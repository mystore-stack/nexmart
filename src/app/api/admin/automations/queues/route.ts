import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { getQueueJobs, getQueueStatistics } from '@/lib/services/queue-jobs.service';
import { JobStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const queueName = searchParams.get('queueName') || undefined;
    const status = searchParams.get('status') as JobStatus | undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await getQueueJobs({
      queueName,
      status,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[AUTOMATION_QUEUES] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
