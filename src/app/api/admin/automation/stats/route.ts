// src/app/api/admin/automation/stats/route.ts — Automation Statistics API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import { prisma } from '@/lib/prisma';
import { getEmailStatistics } from '@/lib/email';
import { getStockAlertStats } from '@/lib/automation/stock-alerts';
import { getCartRecoveryStats } from '@/lib/automation/cart-abandonment';
import { getDailyReportStats } from '@/lib/automation/daily-reports';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const organizationId = req.nextUrl.searchParams.get('organizationId') || undefined;

    const [emailStats, stockAlertStats, cartRecoveryStats, dailyReportStats] = await Promise.all([
      getEmailStatistics(organizationId),
      getStockAlertStats(organizationId),
      getCartRecoveryStats(organizationId),
      getDailyReportStats(organizationId),
    ]);

    return NextResponse.json({
      email: emailStats,
      stockAlerts: stockAlertStats,
      cartRecovery: cartRecoveryStats,
      dailyReports: dailyReportStats,
    });
  } catch (error) {
    console.error('[Automation Stats Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch automation stats' }, { status: 500 });
  }
}
