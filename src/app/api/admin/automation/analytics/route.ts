// src/app/api/admin/automation/analytics/route.ts — Email Analytics API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import {
  getEmailAnalytics,
  getEmailTypeBreakdown,
  getTopCampaigns,
} from '@/lib/automation/email-analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const organizationId = req.nextUrl.searchParams.get('organizationId') || undefined;
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');
    const breakdown = req.nextUrl.searchParams.get('breakdown') === 'true';
    const topCampaigns = req.nextUrl.searchParams.get('topCampaigns') === 'true';
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    if (breakdown) {
      const typeBreakdown = await getEmailTypeBreakdown(organizationId, startDateObj, endDateObj);
      return NextResponse.json({ typeBreakdown });
    }

    if (topCampaigns) {
      const campaigns = await getTopCampaigns(organizationId, limit);
      return NextResponse.json({ campaigns });
    }

    const analytics = await getEmailAnalytics(organizationId, startDateObj, endDateObj);

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('[Email Analytics API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
