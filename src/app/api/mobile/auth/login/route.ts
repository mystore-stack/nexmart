// src/app/api/mobile/auth/login/route.ts
// Mobile login endpoint - Bearer token authentication
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobile-auth';
import { requireMobileAuth } from '@/lib/mobile-auth-api';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { redis, isRedisEnabled } from '@/lib/redis';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check rate limit using Redis if available, otherwise in-memory fallback
 * NOTE: In-memory fallback is NOT production-safe for multi-instance deployments
 */
async function checkRateLimit(ip: string): Promise<boolean> {
  if (isRedisEnabled) {
    try {
      const key = `ratelimit:login:${ip}`;
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, WINDOW_MS / 1000);
      }
      return current <= MAX_ATTEMPTS;
    } catch (err) {
      console.error('[MOBILE AUTH] Redis rate limit check failed, falling back to in-memory:', err);
    }
  }

  // Fallback to in-memory (NOT production-safe for multi-instance)
  const loginAttempts = globalThis as unknown as {
    mobileLoginAttempts?: Map<string, { count: number; resetAt: number }>;
  };
  if (!loginAttempts.mobileLoginAttempts) {
    loginAttempts.mobileLoginAttempts = new Map();
  }

  const now = Date.now();
  const attempts = loginAttempts.mobileLoginAttempts.get(ip);

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.mobileLoginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
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

    if (!(await checkRateLimit(ip))) {
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
