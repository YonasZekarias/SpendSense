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
  { prefix: "/dashboard", allowedRoles: new Set(["user"]) },
  { prefix: "/vendor", allowedRoles: new Set(["vendor"]) },
  { prefix: "/admin", allowedRoles: new Set(["admin"]) },
  { prefix: "/analytics", allowedRoles: new Set(["analyst"]) },

  // ✅ FIXED: merged ads rules (your old version was broken)
  { prefix: "/ads", allowedRoles: ANY_AUTHENTICATED_ROLE },

  // shared routes
  { prefix: "/we", allowedRoles: ANY_AUTHENTICATED_ROLE },
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

// ================= ROLE ROUTING =================

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

// ================= MIDDLEWARE =================

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value;

  const hasSession = Boolean(accessToken || refreshToken);

  const role = extractRoleFromAccessToken(accessToken);
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
    return NextResponse.redirect(new URL("/forbidden", request.url));
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
    "/",
    "/dashboard/:path*",
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