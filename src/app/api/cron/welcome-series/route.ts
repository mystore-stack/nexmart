// src/app/api/cron/welcome-series/route.ts — Welcome Series Cron Job
import { NextRequest, NextResponse } from 'next/server';
import { processWelcomeSeries } from '@/lib/automation/welcome-series';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await processWelcomeSeries();

    return NextResponse.json({ success: true, message: 'Welcome series processed' });
  } catch (error) {
    console.error('[Welcome Series Cron Error]:', error);
    return NextResponse.json({ error: 'Failed to process welcome series' }, { status: 500 });
  }
}
