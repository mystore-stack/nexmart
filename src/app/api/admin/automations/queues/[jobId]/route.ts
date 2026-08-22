import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { getQueueJobByJobId, retryJob, deleteJob } from '@/lib/services/queue-jobs.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { jobId } = await params;

    const job = await getQueueJobByJobId(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('[QUEUE_JOB_DETAIL] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job detail', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { jobId } = await params;

    const body = await req.json();
    const action = body.action;

    if (action === 'retry') {
      const result = await retryJob(jobId);
      return NextResponse.json(result);
    }

    if (action === 'delete') {
      const result = await deleteJob(jobId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[QUEUE_JOB_ACTION] Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { jobId } = await params;

    const result = await deleteJob(jobId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[QUEUE_JOB_DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
