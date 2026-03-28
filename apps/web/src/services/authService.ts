export type AuthFieldErrors = Record<string, string[]>;

export class AuthApiError extends Error {
  status: number;
  fieldErrors: AuthFieldErrors;

  constructor(message: string, status: number, fieldErrors: AuthFieldErrors = {}) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  household_size?: number;
  income_bracket?: string;
};

export type TokenPair = {
  access: string;
  refresh: string;
};

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  city?: string;
  household_size?: number;
  income_bracket?: string;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const fieldErrors = (payload && typeof payload === "object" ? payload : {}) as AuthFieldErrors;
    const fallbackMessage = response.status >= 500
      ? "A server error occurred. Please try again."
      : "Request failed. Please check your input and try again.";

    throw new AuthApiError(fallbackMessage, response.status, fieldErrors);
  }

  return payload as T;
}

export async function login(payload: LoginPayload): Promise<TokenPair> {
  return requestJson<TokenPair>("/api/auth/token/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload): Promise<UserProfile> {
  return requestJson<UserProfile>("/api/users/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(accessToken: string): Promise<UserProfile> {
  return requestJson<UserProfile>("/api/users/me/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access: string }> {
  return requestJson<{ access: string }>("/api/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

export async function forgotPassword(email: string): Promise<{ detail?: string }> {
  return requestJson<{ detail?: string }>("/api/users/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: {
  token: string;
  new_password: string;
}): Promise<{ detail?: string }> {
  return requestJson<{ detail?: string }>("/api/users/reset-password/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
