// src/proxy.ts
// Production-safe NextAuth v5 proxy - single source of truth
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/next-auth.config";
import { generateRequestId } from "@/lib/idempotency";

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

const PUBLIC_API_AUTH = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/bridge",
  "/api/admin/diagnostics-public",
  "/api/admin/products-test",
  "/api/admin/events",
  "/api/auth/debug",
  "/api/auth/[...nextauth]",
  "/api/auth/callback",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/session",
];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  console.log("[PROXY] Request:", { pathname, isApiRoute });

  // IMPORTANT: Skip all NextAuth API routes completely - they handle their own authentication
  // This prevents middleware from interfering with NextAuth's own authentication flow
  if (pathname.startsWith("/api/auth")) {
    console.log("[PROXY] Skipping NextAuth route:", pathname);
    return NextResponse.next();
  }

  // Redirect legacy URLs to correct URLs
  if (pathname === "/admin/cms/flashSale" || pathname === "/admin/cms/flashDeals") {
    console.log("[PROXY] Redirecting legacy flash URL to /admin/cms/flash-deals");
    return NextResponse.redirect(new URL("/admin/cms/flash-deals", req.url), 301);
  }

  const response = NextResponse.next();
  response.headers.set("X-Request-Id", generateRequestId());

  // Get session from NextAuth v5 auth() - single source of truth
  const session = await auth();
  
  console.log("[PROXY] Session retrieved:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    email: session?.user?.email,
    role: session?.user?.role,
  });
  
  let sessionData: { userId?: string; role?: string; organizationId?: string } | null = null;

  if (session?.user) {
    sessionData = {
      userId: session.user.id,
      role: (session.user.role as string) ?? "USER",
    };
    console.log("[PROXY] NextAuth session validated:", {
      userId: sessionData.userId,
      role: sessionData.role,
    });
  } else {
    console.log("[PROXY] No NextAuth session found");
  }

  // Redirect authenticated users away from auth pages
  if (sessionData && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    console.log("[PROXY] Redirecting authenticated user from auth route to home");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect user routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!sessionData) {
      console.log("[PROXY] Protected route - no session, redirecting to login");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!sessionData) {
      console.log("[PROXY] Admin route - no session, redirecting to login");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (sessionData.role !== "ADMIN" && sessionData.role !== "SUPER_ADMIN") {
      console.log("[PROXY] Admin route - insufficient role, redirecting to home");
      return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
    }
    console.log("[PROXY] Admin route - access granted");
  }

  // API auth guards
  if (isApiRoute) {
    const isPublicAuth =
      PUBLIC_API_AUTH.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
      pathname.startsWith("/api/auth/[...nextauth]");

    const needsAuth =
      !isPublicAuth &&
      PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));

    if (needsAuth && !sessionData) {
      console.log("[PROXY] API route - needs auth but no session, returning 401");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Admin API guard
    if (pathname.startsWith("/api/admin") && sessionData) {
      if (sessionData.role !== "ADMIN" && sessionData.role !== "SUPER_ADMIN") {
        console.log("[PROXY] Admin API - insufficient role, returning 403");
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }
  }

  // Add user metadata to headers for downstream use
  if (sessionData) {
    response.headers.set("x-user-id", sessionData.userId || "");
    response.headers.set("x-user-role", sessionData.role || "");
  }

  return response;
}