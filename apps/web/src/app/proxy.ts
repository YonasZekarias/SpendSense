import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  getDefaultRouteForRole,
  normalizeRole,
} from "@/lib/auth-constants";

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const ANY_AUTHENTICATED_ROLE = new Set(["user", "vendor", "admin", "analyst"]);

const ROLE_PROTECTED_ROUTES = [
  { prefix: "/onboarding", allowedRoles: new Set(["user"]) },
  { prefix: "/dashboard", allowedRoles: new Set(["user"]) },
  { prefix: "/notifications", allowedRoles: new Set(["user"]) },
  { prefix: "/profile", allowedRoles: new Set(["user"]) },
  { prefix: "/settings", allowedRoles: new Set(["user"]) },
  { prefix: "/budget", allowedRoles: new Set(["user"]) },
  { prefix: "/expenses", allowedRoles: new Set(["user"]) },
  { prefix: "/reports", allowedRoles: new Set(["user"]) },
  { prefix: "/market", allowedRoles: new Set(["user"]) },
  { prefix: "/shop", allowedRoles: new Set(["user"]) },
  { prefix: "/cart", allowedRoles: new Set(["user"]) },
  { prefix: "/checkout", allowedRoles: new Set(["user"]) },
  { prefix: "/orders", allowedRoles: new Set(["user"]) },
  { prefix: "/reviews", allowedRoles: new Set(["user"]) },
  { prefix: "/vendor", allowedRoles: new Set(["vendor"]) },
  { prefix: "/vendor/register", allowedRoles: new Set(["user", "vendor", "admin"]) },
  { prefix: "/live-prices", allowedRoles: ANY_AUTHENTICATED_ROLE },
  { prefix: "/admin", allowedRoles: new Set(["admin"]) },
  { prefix: "/analytics", allowedRoles: new Set(["analyst", "admin"]) },
];

function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function findProtectedRoute(pathname: string) {
  return ROLE_PROTECTED_ROUTES.find((route) =>
    matchesPath(pathname, route.prefix)
  );
}

// ================= JWT HELPERS =================

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function extractRoleFromAccessToken(token?: string): string | null {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const keys = ["role", "user_role", "userRole"];

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.toLowerCase();
    }
  }

  if (Array.isArray(payload.roles)) {
    const role = payload.roles.find(
      (r) => typeof r === "string" && r.trim()
    );
    if (typeof role === "string") {
      return role.toLowerCase();
    }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasAccessCookie = Boolean(accessToken);
  const hasRefreshCookie = Boolean(request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value);
  const hasSessionCookie = hasAccessCookie || hasRefreshCookie;
  const role = normalizeRole(extractRoleFromAccessToken(accessToken));
  // const effectiveRole = role ?? (hasSessionCookie ? "user" : null);
  const matchedProtectedRoute = findProtectedRoute(pathname);

  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value;

  const hasSession = Boolean(accessToken || refreshToken);

  const effectiveRole = role || null;

  const matchedRoute = findProtectedRoute(pathname);

  // ================= NOT AUTHENTICATED =================
  if (matchedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // ================= UNAUTHORIZED ROLE =================
  if (
    matchedRoute &&
    hasSession &&
    (!effectiveRole || !matchedRoute.allowedRoles.has(effectiveRole))
  ) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(effectiveRole), request.url));
  }

  // ================= AUTH PAGES REDIRECT =================
  if (AUTH_ROUTES.has(pathname) && hasSession) {
    return NextResponse.redirect(
      new URL(getDefaultRouteForRole(effectiveRole), request.url)
    );
  }

  // ================= ROOT REDIRECT =================
  if (pathname === "/" && hasSession) {
    return NextResponse.redirect(
      new URL(getDefaultRouteForRole(effectiveRole), request.url)
    );
  }

  return NextResponse.next();
}

// ================= MATCHER =================

export const config = {
  matcher: [
    "/onboarding",
    "/dashboard/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/budget/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/market/:path*",
    "/shop/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/reviews/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/analytics/:path*",
    "/ads/:path*",
    "/we/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};