import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  DEFAULT_AUTH_REDIRECT,
} from "@/lib/auth-constants";

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const ANY_AUTHENTICATED_ROLE = new Set(["user", "vendor", "admin", "analyst"]);

const ROLE_PROTECTED_ROUTES = [
  { prefix: "/ef", allowedRoles: new Set(["user"]) },
  { prefix: "/ef", allowedRoles: new Set(["vendor"]) },
  { prefix: "/ef", allowedRoles: new Set(["admin"]) },
  { prefix: "/analytics", allowedRoles: new Set(["analyst"]) },
  { prefix: "/we", allowedRoles: ANY_AUTHENTICATED_ROLE },
];

function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function findProtectedRoute(pathname: string) {
  return ROLE_PROTECTED_ROUTES.find((route) => matchesPath(pathname, route.prefix));
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payloadJson = atob(padded);
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    return payload;
  } catch {
    return null;
  }
}

function extractRoleFromAccessToken(token: string | undefined): string | null {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const directRoleKeys = ["role", "user_role", "userRole"];
  for (const key of directRoleKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim().toLowerCase();
    }
  }

  const roles = payload.roles;
  if (Array.isArray(roles)) {
    const firstRole = roles.find((role) => typeof role === "string" && role.trim());
    if (typeof firstRole === "string") {
      return firstRole.trim().toLowerCase();
    }
  }

  return null;
}

function getDefaultRouteForRole(role: string | null) {
  switch (role) {
    case "vendor":
      return "/vendor/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "analyst":
      return "/analytics";
    case "user":
      return "/dashboard";
    default:
      return DEFAULT_AUTH_REDIRECT;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasAccessCookie = Boolean(accessToken);
  const hasRefreshCookie = Boolean(request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value);
  const hasSessionCookie = hasAccessCookie || hasRefreshCookie;
  const role = extractRoleFromAccessToken(accessToken);
  const effectiveRole = role ?? (hasSessionCookie ? "user" : null);
  const matchedProtectedRoute = findProtectedRoute(pathname);

  if (matchedProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (
    matchedProtectedRoute &&
    hasSessionCookie &&
    (!effectiveRole || !matchedProtectedRoute.allowedRoles.has(effectiveRole))
  ) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (AUTH_ROUTES.has(pathname) && hasSessionCookie) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(effectiveRole), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/analytics/:path*",
    "/live-prices/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
