// src/lib/mobile-auth.ts
// Mobile JWT Bearer token generation and verification
// SEPARATE from web auth - does not modify auth-api.ts or NextAuth behavior
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'mobile-secret-change-in-production'
);

const TOKEN_EXPIRY_DAYS = 30;

export interface MobileTokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  organizationId: string;
  exp?: number;
  iat?: number;
}

/**
 * Generate a JWT Bearer token for mobile authentication
 * @param userId - User ID from database
 * @param email - User email
 * @param role - User role
 * @param organizationId - Organization ID for multi-tenant
 * @returns JWT token string
 */
export async function signMobileToken(
  userId: string,
  email: string,
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN',
  organizationId: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60); // 30 days

  const token = await new SignJWT({
    userId,
    email,
    role,
    organizationId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify a JWT Bearer token and return the payload
 * @param token - JWT token string
 * @returns Token payload if valid
 * @throws Error if token is invalid or expired
 */
export async function verifyMobileToken(token: string): Promise<MobileTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Validate required fields
    if (!payload.userId || !payload.email || !payload.role || !payload.organizationId) {
      throw new Error('Invalid token payload: missing required fields');
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
      organizationId: payload.organizationId as string,
      exp: payload.exp as number,
      iat: payload.iat as number,
    };
  } catch (error) {
    console.error('[MOBILE AUTH] Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract Bearer token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}
