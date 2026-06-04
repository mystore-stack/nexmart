// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { getJwtSecretKey } from "@/lib/env";

const AUTH_COOKIE = "nexmart_auth";

const PROTECTED_ROUTES = ["/account", "/checkout", "/orders", "/wishlist", "/vendor"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/register"];

const PROTECTED_API_PREFIXES = [
  "/api/cart",
  "/api/orders",
  "/api/wishlist",
  "/api/notifications",
  "/api/upload",
  "/api/payments/create-intent",
  "/api/auth/profile",
  "/api/auth/addresses",
  "/api/auth/change-password",
  "/api/admin",
  "/api/vendor",
];

const PUBLIC_API_AUTH = ["/api/auth/login", "/api/auth/register", "/api/auth/bridge"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  const response = NextResponse.next();
  response.headers.set("X-Request-Id", crypto.randomUUID());

  let payload: { userId?: string; role?: string } | null = null;

  // Edge middleware must be resilient and must not initialize OpenID/OAuth device-flow logic.
  // For now we rely only on the legacy AUTH cookie that we can verify locally.
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (token) {
    try {
      const { payload: p } = await jwtVerify(token, getJwtSecretKey());
      payload = p as { userId: string; role: string };
    } catch {
      // invalid legacy token
    }
  }




  if (payload && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isApiRoute) {
    const isPublicAuth =
      PUBLIC_API_AUTH.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
      pathname.startsWith("/api/auth/[...nextauth]");

    const needsAuth =
      !isPublicAuth &&
      PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));

    if (needsAuth && !payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (pathname.startsWith("/api/admin") && payload) {
      if (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }
  }

  if (payload) {
    response.headers.set("x-user-id", payload.userId || "");
    response.headers.set("x-user-role", payload.role || "");
  }

  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/wishlist/:path*",
    "/api/notifications/:path*",
    "/api/upload/:path*",
    "/api/ai/:path*",
    "/api/payments/create-intent",
    "/api/auth/profile",
    "/api/auth/addresses/:path*",
    "/api/auth/change-password",
    "/api/admin/:path*",
    "/api/vendor/:path*",
  ],
};

