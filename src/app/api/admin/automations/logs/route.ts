import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { getAutomationLogs, getLogStatistics } from '@/lib/services/automation-logs.service';
import { AutomationType, AutomationStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId') || undefined;
    const type = searchParams.get('type') as AutomationType | undefined;
    const status = searchParams.get('status') as AutomationStatus | undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const entityId = searchParams.get('entityId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await getAutomationLogs({
      organizationId,
      type,
      status,
      entityType,
      entityId,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[AUTOMATION_LOGS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
