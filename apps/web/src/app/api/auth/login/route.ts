import { NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import { AUTH_COOKIE_NAME, AUTH_REFRESH_COOKIE_NAME } from "@/lib/auth-constants";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const body = await apiClient<{ access: string; refresh: string }>(
      {
        method: "POST",
        endpoint: "/api/auth/token/",
        body: payload,
      }
    );

    const tokens = body as { access: string; refresh: string };
    const secure = process.env.NODE_ENV === "production";

    const res = NextResponse.json({ ok: true });

    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: tokens.access,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    res.cookies.set({
      name: AUTH_REFRESH_COOKIE_NAME,
      value: tokens.refresh,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.payload ?? { message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
