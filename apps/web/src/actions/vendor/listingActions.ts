"use server";

import { apiClient, ApiError } from "@/lib/api";
import { revalidateTag } from "next/cache";
import { VendorPriceResponse } from "@/types/api/vendor";
import { vendorPriceSchema } from "@/lib/validation/vendor";

export type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

export async function createListingAction(
  vendorId: string,
  formData: FormData
): Promise<ActionResult<VendorPriceResponse>> {
  const item = formData.get("item");
  const price = formData.get("price");
  const image = formData.get("image");

  if (!item || !price) {
    return { success: false, message: "Item and price are required." };
  }

  try {
    // Rebuild FormData on the server side to ensure File objects are intact
    const serverFormData = new FormData();
    serverFormData.append("item", String(item));
    serverFormData.append("price", String(price));

    if (image && image instanceof File && image.size > 0) {
      serverFormData.append("image", image);
    }

    const data = await apiClient<VendorPriceResponse>({
      method: "POST",
      endpoint: `/api/ecommerce/vendors/${vendorId}/listings/`,
      body: serverFormData,
    });

    // Validate with Zod
    const validated = vendorPriceSchema.parse(data);

    revalidateTag("vendor-products");
    revalidateTag("market-items");

    return { success: true, data: validated };
  } catch (err: unknown) {
    console.error("Create listing error:", err);
    if (err instanceof ApiError) {
      // Try to extract a more specific error message from the payload
      const payload = err.payload as Record<string, unknown> | null;
      const detail =
        (payload?.detail as string) ||
        (payload?.non_field_errors as string[])?.join(", ") ||
        err.message;
      return { success: false, message: detail };
    }
    if (err instanceof Error) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "An unexpected error occurred while creating the listing." };
  }
}
