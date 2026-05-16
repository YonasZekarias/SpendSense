"use server";

import { z } from "zod";
import { priceAlertInputSchema } from "@/lib/validation/product-details";
import { apiClient, ApiError } from "@/lib/api";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function createPriceAlert(
  itemId: string,
  targetPrice: number
): Promise<ActionResult<{ alertId: string }>> {
  const parsed = priceAlertInputSchema.parse({ itemId, targetPrice });
  try {
    const data = await apiClient<{ alertId: string }>({
      method: "POST",
      endpoint: "/api/alerts",
      body: parsed,
    });
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "Internal Server Error" };
  }
}

export async function deletePriceAlert(alertId: string): Promise<ActionResult<void>> {
  try {
    await apiClient<void>({
      method: "DELETE",
      endpoint: `/api/alerts/${alertId}`,
    });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "Internal Server Error" };
  }
}
