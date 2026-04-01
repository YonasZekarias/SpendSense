import {
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
} from "@/lib/auth-constants";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getCookieValue(cookieName: string): string | null {
  const tokenCookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${cookieName}=`));

  if (!tokenCookie) {
    return null;
  }

  return decodeURIComponent(tokenCookie.split("=")[1] || "");
}

function setCookie(name: string, value: string, maxAge: number): void {
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secureFlag}`;
}

function clearCookie(name: string): void {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  return getCookieValue(AUTH_COOKIE_NAME);
}

export function setAccessTokenCookie(token: string): void {
  if (typeof document === "undefined") {
    return;
  }

  setCookie(AUTH_COOKIE_NAME, token, ACCESS_TOKEN_MAX_AGE_SECONDS);
}

export function clearAccessTokenCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  clearCookie(AUTH_COOKIE_NAME);
}

export function getRefreshTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  return getCookieValue(AUTH_REFRESH_COOKIE_NAME);
}

export function setRefreshTokenCookie(token: string): void {
  if (typeof document === "undefined") {
    return;
  }

  setCookie(AUTH_REFRESH_COOKIE_NAME, token, REFRESH_TOKEN_MAX_AGE_SECONDS);
}

export function clearRefreshTokenCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  clearCookie(AUTH_REFRESH_COOKIE_NAME);
}

export function setTokenPairCookies(tokenPair: { access: string; refresh: string }): void {
  setAccessTokenCookie(tokenPair.access);
  setRefreshTokenCookie(tokenPair.refresh);
}

export function clearAuthCookies(): void {
  clearAccessTokenCookie();
  clearRefreshTokenCookie();
}
