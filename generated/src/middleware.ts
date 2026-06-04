// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "nexmart_auth";
const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-min-32-chars-x"
);

const PROTECTED_ROUTES = ["/account", "/checkout", "/orders", "/wishlist"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;

  // ── Rate limiting (basic edge-level) ───────────────────────
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
  const isApiRoute = pathname.startsWith("/api/");

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Request-Id", crypto.randomUUID());

  // ── Auth route protection ───────────────────────────────────
  let payload: { userId?: string; role?: string } | null = null;

  if (token) {
    try {
      const { payload: p } = await jwtVerify(token, ACCESS_SECRET);
      payload = p as { userId: string; role: string };
    } catch {
      // Token invalid or expired
    }
  }

  // Redirect authenticated users away from auth pages
  if (payload && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect user routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── API auth check for protected endpoints ─────────────────
  if (isApiRoute) {
    const protectedApiPrefixes = [
      "/api/cart",
      "/api/orders",
      "/api/wishlist",
      "/api/notifications",
      "/api/admin",
    ];

    if (protectedApiPrefixes.some((p) => pathname.startsWith(p)) && !payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  // Attach user info to headers for server components
  if (payload) {
    response.headers.set("x-user-id", payload.userId || "");
    response.headers.set("x-user-role", payload.role || "");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};
