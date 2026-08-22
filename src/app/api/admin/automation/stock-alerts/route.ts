// src/app/api/admin/automation/stock-alerts/route.ts — Stock Alerts API
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { getStockAlerts, acknowledgeStockAlert, resolveStockAlert } from '@/lib/automation/stock-alerts';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const organizationId = req.nextUrl.searchParams.get('organizationId') || undefined;
    const includeResolved = req.nextUrl.searchParams.get('includeResolved') === 'true';

    const alerts = await getStockAlerts(organizationId, includeResolved);

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('[Stock Alerts Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch stock alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const { alertId, action } = body;

    if (action === 'acknowledge') {
      await acknowledgeStockAlert(alertId, session.userId);
    } else if (action === 'resolve') {
      await resolveStockAlert(alertId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Stock Alerts Action Error]:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}
