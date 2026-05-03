"use server";

import { apiClient, ApiError } from "@/lib/api";
import type { VendorProfile } from "../../app/vendor/_lib/vendor-api";

export type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

export async function updateProfile(payload: Partial<VendorProfile>): Promise<ActionResult<VendorProfile>> {
  try {
    const data = await apiClient<VendorProfile>({ method: "PATCH", endpoint: "/api/users/me/", body: payload });
    return { success: true, data };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    if (err instanceof Error) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Unknown error" };
  }
}
