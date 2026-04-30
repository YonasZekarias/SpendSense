import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_PROFILE_COOKIE_NAME,
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
  { prefix: "/dashboard", allowedRoles: new Set(["user"]) },
  { prefix: "/vendor", allowedRoles: new Set(["vendor"]) },
  { prefix: "/live-prices", allowedRoles: ANY_AUTHENTICATED_ROLE },
  { prefix: "/market", allowedRoles: ANY_AUTHENTICATED_ROLE },
  { prefix: "/admin", allowedRoles: new Set(["admin"]) }, { prefix: "/analytics", allowedRoles: new Set(["analyst"]) },
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

  // 1) Direct keys
  const directRoleKeys = ["role", "user_role", "userRole"];
  for (const key of directRoleKeys) {
    const value = (payload as any)[key];
    if (typeof value === "string" && value.trim()) {
      return normalizeRole(value as string);
    }
  }

  // 2) Top-level roles array
  if (Array.isArray((payload as any).roles)) {
    const firstRole = (payload as any).roles.find((r: unknown) => typeof r === "string" && (r as string).trim());
    if (typeof firstRole === "string") {
      return normalizeRole(firstRole as string);
    }
  }

  // 3) Common nested locations (Keycloak-style)
  const realmRoles = (payload as any).realm_access?.roles;
  if (Array.isArray(realmRoles)) {
    const first = realmRoles.find((r: unknown) => typeof r === "string" && (r as string).trim());
    if (typeof first === "string") return normalizeRole(first as string);
  }

  const resourceAccess = (payload as any).resource_access;
  if (resourceAccess && typeof resourceAccess === "object") {
    for (const clientKey of Object.keys(resourceAccess)) {
      const client = (resourceAccess as any)[clientKey];
      if (client && Array.isArray(client.roles)) {
        const first = client.roles.find((r: unknown) => typeof r === "string" && (r as string).trim());
        if (typeof first === "string") return normalizeRole(first as string);
      }
    }
  }

  // 4) Shallow recursive scan for keys containing "role"/"roles" (limited depth)
  const queue: unknown[] = [payload];
  const maxDepth = 3;
  let depth = 0;
  while (queue.length && depth < maxDepth) {
    const obj = queue.shift();
    if (!obj || typeof obj !== "object") {
      depth++;
      continue;
    }
    for (const k of Object.keys(obj as Record<string, unknown>)) {
      const v = (obj as any)[k];
      if (typeof k === "string" && k.toLowerCase().includes("role")) {
        if (typeof v === "string" && v.trim()) return normalizeRole(v as string);
        if (Array.isArray(v)) {
          const first = v.find((r: unknown) => typeof r === "string" && (r as string).trim());
          if (typeof first === "string") return normalizeRole(first as string);
        }
      }
      if (typeof v === "object" && v !== null) queue.push(v);
    }
    depth++;
  }

  // For debugging: log available top-level keys when no role found
  try {
    console.log("middleware: JWT payload keys:", Object.keys(payload));
  } catch { }

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
  const profileCookie = request.cookies.get(AUTH_PROFILE_COOKIE_NAME)?.value;
  const hasAccessCookie = Boolean(accessToken);
  const hasRefreshCookie = Boolean(request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value);
  const hasSessionCookie = hasAccessCookie || hasRefreshCookie;
  // Prefer role from server-set profile cookie when available
  let role: string | null = null;
  if (profileCookie) {
    try {
      const parsed = JSON.parse(profileCookie) as { role?: string };
      role = normalizeRole(parsed?.role ?? null);
    } catch {
      role = normalizeRole(extractRoleFromAccessToken(accessToken));
    }
  } else {
    role = normalizeRole(extractRoleFromAccessToken(accessToken));
  }
  const effectiveRole = role ?? (hasSessionCookie ? "user" : null);
  const matchedProtectedRoute = findProtectedRoute(pathname);
  console.log(
    `middleware: pathname=${pathname}, search=${search}, hasSessionCookie=${hasSessionCookie}, effectiveRole=${effectiveRole}, matchedProtectedRoute=${matchedProtectedRoute?.prefix}`)
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
    "/market/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
