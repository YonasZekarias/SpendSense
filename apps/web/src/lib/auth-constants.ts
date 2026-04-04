export const AUTH_COOKIE_NAME = "spendsense_access_token";
export const AUTH_REFRESH_COOKIE_NAME = "spendsense_refresh_token";
export const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (!value.startsWith("/")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (value.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return value;
}
