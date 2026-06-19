// src/app/api/admin/automation/segments/route.ts — Marketing Segments API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import {
  createMarketingSegment,
  listOrganizationSegments,
  getSegmentTemplates,
  createPredefinedSegments,
} from '@/lib/automation/customer-segmentation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const organizationId = req.nextUrl.searchParams.get('organizationId') || undefined;
    const templates = req.nextUrl.searchParams.get('templates') === 'true';

    if (templates) {
      return NextResponse.json({ templates: getSegmentTemplates() });
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const segments = await listOrganizationSegments(organizationId);

    return NextResponse.json({ segments });
  } catch (error) {
    console.error('[Segments Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { organizationId, name, description, rules, createPredefined } = body;

    if (createPredefined) {
      const segments = await createPredefinedSegments(organizationId);
      return NextResponse.json({ segments }, { status: 201 });
    }

    const segment = await createMarketingSegment(organizationId, name, description, rules);

    return NextResponse.json({ segment }, { status: 201 });
  } catch (error) {
    console.error('[Create Segment Error]:', error);
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 });
  }
}
