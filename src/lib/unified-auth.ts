// src/lib/unified-auth.ts
// Unified authentication helper supporting both NextAuth (web) and JWT (mobile)
import { getSession, AuthError } from "./auth-api";
import { verifyMobileToken, MobileAuthError, MobileAuthSession } from "./mobile-auth";

export interface UnifiedAuthSession {
  userId: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  organizationId: string;
  source: "web" | "mobile";
}

export class UnifiedAuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = "UNIFIED_AUTH_ERROR"
  ) {
    super(message);
    this.name = "UnifiedAuthError";
  }
}

/**
 * Unified authentication - checks both NextAuth (web) and JWT (mobile)
 * Returns session if authenticated via either method
 */
export async function requireUnifiedAuth(
  req: Request
): Promise<UnifiedAuthSession> {
  // Try NextAuth (web) first
  try {
    const webSession = await getSession();
    if (webSession) {
      return {
        userId: webSession.userId,
        email: webSession.email,
        role: webSession.role,
        organizationId: webSession.organizationId,
        source: "web",
      };
    }
  } catch (err) {
    // Ignore NextAuth errors, try mobile auth next
    console.log("[UNIFIED AUTH] NextAuth failed, trying mobile auth");
  }

  // Try mobile JWT token
  try {
    const mobileSession = await verifyMobileToken(req);
    return {
      userId: mobileSession.userId,
      email: mobileSession.email,
      role: mobileSession.role as "USER" | "ADMIN" | "SUPER_ADMIN",
      organizationId: mobileSession.organizationId,
      source: "mobile",
    };
  } catch (err) {
    // Mobile auth also failed
    console.log("[UNIFIED AUTH] Mobile auth failed");
  }

  // Neither authentication method succeeded
  throw new UnifiedAuthError(
    "Authentication required. Please sign in.",
    401,
    "UNAUTHORIZED"
  );
}
