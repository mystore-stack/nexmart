// src/lib/mobile-auth-api.ts
// Mobile authentication helpers - SEPARATE from auth-api.ts
// Does NOT modify web auth behavior or NextAuth
import { NextRequest } from 'next/server';
import { verifyMobileToken, extractBearerToken, type MobileTokenPayload } from './mobile-auth';
import { getOrganizationIdForUser } from './tenant';
import { prisma } from './prisma';

export class MobileAuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = 'MOBILE_AUTH_ERROR'
  ) {
    super(message);
    this.name = 'MobileAuthError';
  }
}

export interface MobileSession {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  organizationId: string;
}

/**
 * Get mobile session from Bearer token in request
 * Returns null if not authenticated
 * @param req - NextRequest with Authorization header
 * @returns Mobile session or null
 */
export async function getMobileSession(req: NextRequest): Promise<MobileSession | null> {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return null;
    }

    const payload = await verifyMobileToken(token);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      console.warn('[MOBILE AUTH] User not found in database:', payload.userId);
      return null;
    }

    // Resolve organizationId
    const organizationId = await getOrganizationIdForUser({ userId: user.id });

    return {
      userId: user.id,
      email: user.email,
      role: user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
      organizationId,
    };
  } catch (error) {
    console.error('[MOBILE AUTH] Session retrieval failed:', error);
    return null;
  }
}

/**
 * Require mobile authentication - throws if not authenticated
 * Use this in mobile API routes
 * @param req - NextRequest with Authorization header
 * @returns Mobile session (guaranteed to be authenticated)
 * @throws MobileAuthError if not authenticated
 */
export async function requireMobileAuth(req: NextRequest): Promise<MobileSession> {
  const session = await getMobileSession(req);

  if (!session) {
    throw new MobileAuthError(
      'Authentication required: Invalid or missing Bearer token',
      401,
      'UNAUTHORIZED'
    );
  }

  return session;
}

/**
 * Require mobile admin authentication - throws if not admin
 * @param req - NextRequest with Authorization header
 * @returns Mobile session (guaranteed to be admin)
 * @throws MobileAuthError if not admin
 */
export async function requireMobileAdmin(req: NextRequest): Promise<MobileSession> {
  const session = await requireMobileAuth(req);

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    throw new MobileAuthError(
      'Forbidden: Admin role required',
      403,
      'FORBIDDEN'
    );
  }

  return session;
}
