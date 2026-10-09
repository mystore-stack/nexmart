// src/lib/mobile-auth.ts
// Mobile authentication helpers for JWT token verification
import { jwtVerify } from "jose";

export interface MobileAuthSession {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

export class MobileAuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = "MOBILE_AUTH_ERROR"
  ) {
    super(message);
    this.name = "MobileAuthError";
  }
}

/**
 * Verify mobile JWT token from Authorization header
 * Returns decoded session if valid, throws MobileAuthError if invalid
 */
export async function verifyMobileToken(
  req: Request
): Promise<MobileAuthSession> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new MobileAuthError(
      "Missing or invalid authorization header",
      401,
      "MISSING_TOKEN"
    );
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("[MOBILE AUTH] JWT_SECRET not configured");
    throw new MobileAuthError(
      "Server configuration error",
      500,
      "CONFIG_ERROR"
    );
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);

    // Validate required fields
    if (!payload.userId || !payload.email || !payload.organizationId) {
      throw new MobileAuthError(
        "Invalid token payload",
        401,
        "INVALID_PAYLOAD"
      );
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: (payload.role as string) || "USER",
      organizationId: payload.organizationId as string,
    };
  } catch (err) {
    console.error("[MOBILE AUTH] Token verification failed:", err);
    throw new MobileAuthError(
      "Invalid or expired token",
      401,
      "INVALID_TOKEN"
    );
  }
}

/**
 * Helper to require mobile authentication in API routes
 * Throws MobileAuthError if not authenticated
 */
export async function requireMobileAuth(
  req: Request
): Promise<MobileAuthSession> {
  return verifyMobileToken(req);
}
