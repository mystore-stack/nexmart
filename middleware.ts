/**
 * NexMart Enterprise Middleware
 * ───────────────────────────────
 * Edge-first auth using both NextAuth (for OAuth) and legacy JWT.
 * Falls back gracefully so existing sessions remain valid during migration.
 *
 * Route protection matrix:
 * - /account, /checkout, /orders, /wishlist → require auth
 * - /admin → require ADMIN or SUPER_ADMIN role
 * - /login, /register → redirect authenticated users
 * - /api/admin/* → ADMIN-only API guard
 * - /api/cart, /api/orders, /api/wishlist, /api/notifications → auth required
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { auth } from "@/lib/next-auth.config";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-min-32-chars-x"
);

const PROTECTED_ROUTES = ["/account", "/checkout", "/orders", "/wishlist", "/addresses", "/change-password"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/register"];

const PROTECTED_API = [
  "/api/cart",
  "/api/orders",
  "/api/wishlist",
  "/api/notifications",
  "/api/admin",
];

interface AuthPayload {
  userId?: string;
  sub?: string; // NextAuth uses sub
  role?: string;
  email?: string;
}

/**
 * Extract auth payload from either NextAuth session cookie or legacy JWT.
 * Dual-strategy ensures backward compatibility.
 */
async function extractPayload(req: NextRequest): Promise<AuthPayload | null> {
  // Strategy 1: Legacy JWT cookie (existing sessions)
  const legacyToken = req.cookies.get("nexmart_auth")?.value;
  if (legacyToken) {
    try {
      const { payload } = await jwtVerify(legacyToken, ACCESS_SECRET);
      return payload as AuthPayload;
    } catch {
      // Token expired or invalid — fall through to NextAuth
    }
  }

  // Strategy 2: NextAuth session cookie
  // NextAuth's auth() helper works at the edge in Next.js 14
  try {
    const session = await auth();
    if (session?.user) {
      return {
        userId: session.user.id,
        sub: session.user.id,
        role: session.user.role,
        email: session.user.email ?? undefined,
      };
    }
  } catch {
    // NextAuth not configured (no env vars) — skip silently
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(ico|png|jpg|svg|webp|woff2|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const payload = await extractPayload(req);

  // ── Security headers (all routes) ──────────────────────────
  const response = NextResponse.next();
  response.headers.set("X-Request-Id", crypto.randomUUID());
  response.headers.set("X-DNS-Prefetch-Control", "on");

  // ── Authenticated user metadata ─────────────────────────────
  if (payload) {
    const userId = payload.userId || payload.sub || "";
    const role = payload.role || "USER";
    response.headers.set("x-user-id", userId);
    response.headers.set("x-user-role", role);
  }

  // ── Redirect authenticated users away from auth pages ───────
  if (payload && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ── Protect user routes ─────────────────────────────────────
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Protect admin routes ─────────────────────────────────────
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload) {
      return NextResponse.redirect(new URL("/login?from=/admin", req.url));
    }
    const role = payload.role || "USER";
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
    }
  }

  // ── API auth guards ──────────────────────────────────────────
  if (req.nextUrl.pathname.startsWith("/api/")) {
    if (PROTECTED_API.some((p) => pathname.startsWith(p)) && !payload) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Admin API guard
    if (pathname.startsWith("/api/admin")) {
      const role = payload?.role || "USER";
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|fonts|site.webmanifest).*)",
  ],
};
