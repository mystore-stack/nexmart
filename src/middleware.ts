// src/middleware.ts
// Production-safe NextAuth v5 middleware - single source of truth
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

const CMS_ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "EDITOR", "MARKETING_MANAGER"];
const FULL_ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

function isCmsAdminRoute(pathname: string) {
  return pathname.startsWith("/admin/cms") || pathname.startsWith("/api/admin/cms");
}

function canAccessAdminRoute(role: string, pathname: string) {
  if (FULL_ADMIN_ROLES.includes(role)) return true;
  if (CMS_ADMIN_ROLES.includes(role) && isCmsAdminRoute(pathname)) return true;
  return false;
}

const PUBLIC_API_AUTH = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/bridge",
  "/api/admin/diagnostics-public",
  "/api/admin/products-test",
  "/api/auth/debug",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  console.log("[MIDDLEWARE] Request:", { pathname, isApiRoute });

  const response = NextResponse.next();
  response.headers.set("X-Request-Id", generateRequestId());

  // Bootstrap organization on first request if needed
  if (!isApiRoute && pathname === "/") {
    try {
      const { bootstrapOrganization } = await import("@/lib/tenant");
      await bootstrapOrganization();
      console.log("[MIDDLEWARE] Organization bootstrap completed");
    } catch (error) {
      console.error("[MIDDLEWARE] Organization bootstrap failed:", error);
      // Don't block request, just log error
    }
  }

  // Get session from NextAuth v5 auth() - single source of truth
  const session = await auth();
  
  console.log("[MIDDLEWARE] Session retrieved:", {
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
    console.log("[MIDDLEWARE] NextAuth session validated:", {
      userId: sessionData.userId,
      role: sessionData.role,
    });
  } else {
    console.log("[MIDDLEWARE] No NextAuth session found");
  }

  // Redirect authenticated users away from auth pages
  if (sessionData && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    console.log("[MIDDLEWARE] Redirecting authenticated user from auth route to home");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect user routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!sessionData) {
      console.log("[MIDDLEWARE] Protected route - no session, redirecting to login");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!sessionData) {
      console.log("[MIDDLEWARE] Admin route - no session, redirecting to login");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (sessionData.role !== "ADMIN" && sessionData.role !== "SUPER_ADMIN") {
      if (!canAccessAdminRoute(sessionData.role ?? "USER", pathname)) {
        console.log("[MIDDLEWARE] Admin route - insufficient role, redirecting to home");
        return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
      }
    }
    console.log("[MIDDLEWARE] Admin route - access granted");
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
      console.log("[MIDDLEWARE] API route - needs auth but no session, returning 401");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Admin API guard
    if (pathname.startsWith("/api/admin") && sessionData) {
      if (!canAccessAdminRoute(sessionData.role ?? "USER", pathname)) {
        console.log("[MIDDLEWARE] Admin API - insufficient role, returning 403");
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
  runtime: "nodejs",
};

