// src/app/api/nexplay/coupons/route.ts
// GET /api/nexplay/coupons - List available coupons for user
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth } from '@/lib/mobile-auth-api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);

    // Get available coupons
    const coupons = await prisma.nexPlayCoupon.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] },
        ],
      },
    });

    // Get user's redeemed coupons
    const redemptions = await prisma.nexPlayCouponRedemption.findMany({
      where: { userId: session.userId },
      select: { couponId: true },
    });

    const redeemedIds = new Set(redemptions.map((r) => r.couponId));
    const availableCoupons = coupons
      .filter((c) => !redeemedIds.has(c.id))
      .map((c) => ({
        id: c.id,
        code: c.code,
        label: c.label,
        description: c.description,
        type: c.type,
        value: c.value,
        cost: c.cost,
        validUntil: c.validUntil,
      }));

    return NextResponse.json({
      success: true,
      coupons: availableCoupons,
    });
  } catch (error: any) {
    console.error('[NEXPLAY COUPONS]', error);
    if (error.code === 'UNAUTHORIZED' || error.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}
