// src/app/api/mobile/addresses/route.ts
// Mobile addresses endpoint - Bearer token authentication
// Uses requireMobileAuth() - does NOT modify auth-api.ts or NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

const addressSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  line1: z.string().min(5).max(100),
  line2: z.string().max(100).optional(),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  country: z.string().min(2).max(50),
  zip: z.string().min(3).max(12),
  isDefault: z.boolean().default(false),
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/mobile/addresses
 * Get user's addresses
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, addresses });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    const status = err instanceof MobileAuthError ? err.statusCode : 401;
    console.error('[MOBILE ADDRESSES] GET error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

/**
 * POST /api/mobile/addresses
 * Create a new address
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const data = addressSchema.parse(await req.json());

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...data, userId: session.userId },
    });

    return NextResponse.json({ success: true, address }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE ADDRESSES] POST error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
