// src/app/api/cron/daily-sales-report/route.ts — Daily Sales Report Cron Job
import { NextRequest, NextResponse } from 'next/server';
import { generateDailySalesReport } from '@/lib/automation/daily-reports';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Vercel Cron Job: Run daily at midnight UTC
export async function GET(req: NextRequest) {
  try {
    // Verify CRON_SECRET for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting daily sales report generation...');

    await generateDailySalesReport();

    console.log('[Cron] Daily sales report generation completed');

    return NextResponse.json(
      { success: true, message: 'Daily sales report generated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cron] Daily sales report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate daily sales report' },
      { status: 500 }
    );
  }
}
