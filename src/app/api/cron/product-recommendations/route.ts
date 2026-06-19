// src/app/api/cron/product-recommendations/route.ts — Product Recommendations Cron Job
import { NextRequest, NextResponse } from 'next/server';
import { sendRecommendationsToInactiveUsers } from '@/lib/automation/product-recommendations';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await sendRecommendationsToInactiveUsers();

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('[Product Recommendations Cron Error]:', error);
    return NextResponse.json({ error: 'Failed to send recommendations' }, { status: 500 });
  }
}
