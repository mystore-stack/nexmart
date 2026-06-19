// src/app/api/cron/newsletter/route.ts — Weekly Newsletter Cron Job
import { NextRequest, NextResponse } from 'next/server';
import { scheduleWeeklyNewsletters } from '@/lib/automation/newsletter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await scheduleWeeklyNewsletters();

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('[Newsletter Cron Error]:', error);
    return NextResponse.json({ error: 'Failed to schedule newsletters' }, { status: 500 });
  }
}
