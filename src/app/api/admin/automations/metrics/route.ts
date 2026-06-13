import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { getAutomationMetrics, getRealTimeStatus } from '@/lib/services/automation-metrics.service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const organizationId = searchParams.get('organizationId') || undefined;

    const metrics = await getAutomationMetrics({
      organizationId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    const realTimeStatus = await getRealTimeStatus(organizationId);

    return NextResponse.json({
      metrics,
      realTimeStatus,
    });
  } catch (error) {
    console.error('[AUTOMATION_METRICS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
