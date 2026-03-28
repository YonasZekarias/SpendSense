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

function isProtectedRoute(pathname: string) {
  return pathname === "/users" || pathname.startsWith("/users/");
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasAccessCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const hasRefreshCookie = Boolean(request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value);
  const hasSessionCookie = hasAccessCookie || hasRefreshCookie;

  if (isProtectedRoute(pathname) && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_ROUTES.has(pathname) && hasSessionCookie) {
    return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/users/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
