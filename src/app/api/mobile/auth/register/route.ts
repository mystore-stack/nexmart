// src/app/api/mobile/auth/register/route.ts
// Mobile registration endpoint - Bearer token authentication
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobile-auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Simple in-memory rate limiting
const registerAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = registerAttempts.get(ip);

  if (!attempts || now > attempts.resetAt) {
    registerAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
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
        { success: false, error: 'Too many registration attempts. Please try again later.', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid registration data', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default organization
    const { getDefaultOrganizationId } = await import('@/lib/tenant');
    const organizationId = await getDefaultOrganizationId();

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'USER',
        emailVerified: false, // Require email verification if needed
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Create membership
    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId,
        role: 'MEMBER',
      },
    });

    // Generate JWT Bearer token
    const token = await signMobileToken(user.id, user.email, user.role, organizationId);

    console.log('[MOBILE AUTH] Registration successful:', {
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
    console.error('[MOBILE AUTH] Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
