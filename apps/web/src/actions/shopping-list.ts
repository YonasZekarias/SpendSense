"use server";

import { z } from "zod";
import { apiClient, ApiError } from "@/lib/api";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

const addToShoppingListSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unit: z.string(),
});

export async function addToShoppingList(
  itemId: string,
  quantity: number,
  unit: string
): Promise<ActionResult<void>> {
  const parsed = addToShoppingListSchema.parse({ itemId, quantity, unit });
  try {
    await apiClient<void>({
      method: "POST",
      endpoint: "/api/shopping-list/items",
      body: parsed,
    });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "Internal Server Error" };
  }
}
