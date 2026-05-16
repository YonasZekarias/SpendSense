"use server";

import { apiClient, ApiError } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { vendorVerificationRequestSchema } from "@/lib/validation/vendor-profile";
import { VendorProfileResponse } from "@/types/api/vendor-profile";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function requestVerification(
  formData: FormData
): Promise<ActionResult<VendorProfileResponse>> {
  try {
    const rawData = await apiClient<any>({
      method: "PATCH",
      endpoint: "/api/users/me/",
      body: formData,
    });

    // Flatten the vendor_info from the response for UI compatibility
    const vendorInfo = rawData.vendor_info || {};
    const flattened: VendorProfileResponse = {
      ...rawData,
      ...vendorInfo,
    };

    revalidatePath("/vendor/verify");
    revalidatePath("/vendor/dashboard");
    revalidatePath("/vendor/profile");

    return { success: true, data: flattened };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
