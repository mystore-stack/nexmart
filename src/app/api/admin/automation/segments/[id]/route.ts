// src/app/api/admin/automation/segments/[id]/route.ts — Segment Management API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import {
  assignUsersToSegment,
  getSegmentStatistics,
} from '@/lib/automation/customer-segmentation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const stats = await getSegmentStatistics(params.id);

    if (!stats) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[Segment Stats Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch segment stats' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'assign') {
      const result = await assignUsersToSegment(params.id);
      return NextResponse.json({ success: true, assigned: result.count });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Segment Action Error]:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.marketingSegment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Delete Segment Error]:', error);
    return NextResponse.json({ error: 'Failed to delete segment' }, { status: 500 });
  }
}
