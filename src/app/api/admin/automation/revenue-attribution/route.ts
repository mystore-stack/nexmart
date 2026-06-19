// src/app/api/admin/automation/revenue-attribution/route.ts — Revenue Attribution API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import {
  getRevenueAttributionReport,
  getTopRevenueCampaigns,
  getCLVByEmailEngagement,
  attributeRevenueToEmail,
} from '@/lib/automation/revenue-attribution';

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
    const topCampaigns = req.nextUrl.searchParams.get('topCampaigns') === 'true';
    const clv = req.nextUrl.searchParams.get('clv') === 'true';
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    if (topCampaigns) {
      const campaigns = await getTopRevenueCampaigns(organizationId, limit);
      return NextResponse.json({ campaigns });
    }

    if (clv) {
      const clvData = await getCLVByEmailEngagement(organizationId);
      return NextResponse.json({ clvData });
    }

    const report = await getRevenueAttributionReport(organizationId, startDateObj, endDateObj);

    return NextResponse.json({ report });
  } catch (error) {
    console.error('[Revenue Attribution API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue attribution' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, emailLogId } = body;

    const result = await attributeRevenueToEmail(orderId, emailLogId);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[Attribute Revenue Error]:', error);
    return NextResponse.json({ error: 'Failed to attribute revenue' }, { status: 500 });
  }
}
