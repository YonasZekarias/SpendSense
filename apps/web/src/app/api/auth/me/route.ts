import { NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import type { UserProfile } from "@/services/userService";

export async function GET() {
  try {
    const body = await apiClient<UserProfile>({ method: "GET", endpoint: "/api/users/me/" });
		return NextResponse.json(body);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.payload ?? { message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
