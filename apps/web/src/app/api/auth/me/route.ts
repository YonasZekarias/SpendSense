import { NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import type { UserProfile } from "@/services/userService";

export async function GET() {
  try {
    const body = await apiClient<UserProfile>({ method: "GET", endpoint: "/api/users/me/" });
    console.log("the body is", body);
		return NextResponse.json(body);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.payload ?? { message: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
