import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

const ONE_HOUR_SECONDS = 60 * 60;

export function getAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const tokenCookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!tokenCookie) {
    return null;
  }

  return decodeURIComponent(tokenCookie.split("=")[1] || "");
}

export function setAccessTokenCookie(token: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${ONE_HOUR_SECONDS}; SameSite=Lax${secureFlag}`;
}

export function clearAccessTokenCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
