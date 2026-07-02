// src/app/api/admin/automation/recommendations/route.ts — Product Recommendations API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import {
  getPersonalizedRecommendations,
  sendProductRecommendationEmail,
  getRecommendationStatistics,
} from '@/lib/automation/product-recommendations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const organizationId = req.nextUrl.searchParams.get('organizationId') || undefined;
    const userId = req.nextUrl.searchParams.get('userId');
    const stats = req.nextUrl.searchParams.get('stats') === 'true';

    if (stats) {
      const statistics = await getRecommendationStatistics(organizationId);
      return NextResponse.json({ statistics });
    }

    if (userId && organizationId) {
      const recommendations = await getPersonalizedRecommendations(userId, organizationId);
      return NextResponse.json({ recommendations });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('[Recommendations API Error]:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, organizationId } = body;

    const result = await sendProductRecommendationEmail(userId, organizationId);

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error('[Send Recommendation Error]:', error);
    return NextResponse.json({ error: 'Failed to send recommendation' }, { status: 500 });
  }
}
