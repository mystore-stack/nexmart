// src/app/api/admin/automation/coupons/route.ts — Coupon Management API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import {
  createCoupon,
  generateWelcomeCoupon,
  generateBirthdayCoupon,
  generateReferralCoupon,
  generateFlashSaleCoupon,
  getCouponStatistics,
  validateCoupon,
} from '@/lib/automation/coupon-engine';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const organizationId = req.nextUrl.searchParams.get('organizationId') || undefined;
    const code = req.nextUrl.searchParams.get('code');
    const stats = req.nextUrl.searchParams.get('stats') === 'true';

    if (stats && organizationId) {
      const statistics = await getCouponStatistics(organizationId);
      return NextResponse.json({ statistics });
    }

    if (code && organizationId) {
      const validation = await validateCoupon(code, organizationId);
      return NextResponse.json({ validation });
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const coupons = await prisma.coupon.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('[Coupons Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { 
      organizationId, 
      code, 
      description, 
      type, 
      value, 
      minOrder, 
      maxDiscount, 
      usageLimit, 
      userLimit, 
      startDate, 
      endDate,
      generateType,
      userId,
    } = body;

    if (generateType) {
      let coupon;
      switch (generateType) {
        case 'welcome':
          coupon = await generateWelcomeCoupon(organizationId, userId);
          break;
        case 'birthday':
          if (!userId) {
            return NextResponse.json({ error: 'User ID required for birthday coupon' }, { status: 400 });
          }
          coupon = await generateBirthdayCoupon(organizationId, userId);
          break;
        case 'referral':
          if (!userId) {
            return NextResponse.json({ error: 'User ID required for referral coupon' }, { status: 400 });
          }
          coupon = await generateReferralCoupon(organizationId, userId);
          break;
        case 'flash':
          coupon = await generateFlashSaleCoupon(organizationId, value);
          break;
        default:
          return NextResponse.json({ error: 'Invalid generate type' }, { status: 400 });
      }
      return NextResponse.json({ coupon }, { status: 201 });
    }

    const coupon = await createCoupon({
      organizationId,
      code,
      description,
      type,
      value,
      minOrder,
      maxDiscount,
      usageLimit,
      userLimit,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('[Create Coupon Error]:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
