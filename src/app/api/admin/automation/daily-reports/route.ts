// src/app/api/admin/automation/daily-reports/route.ts — Daily Reports API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import { getDailyReports } from '@/lib/automation/daily-reports';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const organizationId = req.nextUrl.searchParams.get('organizationId') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30');

    const reports = await getDailyReports(organizationId, limit);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('[Daily Reports Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch daily reports' }, { status: 500 });
  }
}
