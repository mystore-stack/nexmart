// src/app/api/admin/automation/analytics/campaigns/[id]/route.ts — Campaign Performance API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import { getCampaignPerformance } from '@/lib/automation/email-analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const performance = await getCampaignPerformance(params.id);

    if (!performance) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ performance });
  } catch (error) {
    console.error('[Campaign Performance Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign performance' }, { status: 500 });
  }
}
