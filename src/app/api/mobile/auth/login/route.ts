// src/app/api/mobile/auth/login/route.ts
// Mobile login endpoint - Bearer token authentication
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobile-auth';
import { requireMobileAuth } from '@/lib/mobile-auth-api';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Simple in-memory rate limiting (production should use Redis)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return false;
  }

  attempts.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true, role: true },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Get organizationId
    const { getOrganizationIdForUser } = await import('@/lib/tenant');
    const organizationId = await getOrganizationIdForUser({ userId: user.id });

    // Generate JWT Bearer token
    const token = await signMobileToken(user.id, user.email, user.role, organizationId);

    console.log('[MOBILE AUTH] Login successful:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId,
      },
    });
  } catch (error) {
    console.error('[MOBILE AUTH] Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
