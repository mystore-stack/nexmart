// src/app/api/admin/automation/newsletter/route.ts — Newsletter API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import {
  createWeeklyNewsletter,
  getNewsletterStatistics,
} from '@/lib/automation/newsletter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const organizationId = req.nextUrl.searchParams.get('organizationId') || undefined;
    const stats = req.nextUrl.searchParams.get('stats') === 'true';

    if (stats) {
      const statistics = await getNewsletterStatistics(organizationId);
      return NextResponse.json({ statistics });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('[Newsletter API Error]:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { organizationId, subject, promoBanner } = body;

    const result = await createWeeklyNewsletter({
      organizationId,
      subject: subject || 'Newsletter Hebdomadaire',
      promoBanner,
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error('[Send Newsletter Error]:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
}
