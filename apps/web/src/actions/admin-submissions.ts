"use server";

import { revalidateTag } from "next/cache";
import { apiClient, ApiError } from "@/lib/api";
import type { AdminSubmission } from "@/types/api/admin-submissions";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function approveSubmission(
  id: number
): Promise<ActionResult<AdminSubmission>> {
  try {
    const data = await apiClient<AdminSubmission>({
      method: "POST",
      endpoint: `/api/market/admin/submissions/${id}/approve`,
    });
    revalidateTag("admin-submissions");
    revalidateTag("admin-moderation-stats");
    revalidateTag(`admin-submission-${id}`);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    throw error;
  }
}

export async function rejectSubmission(
  id: number,
  reason: string
): Promise<ActionResult<AdminSubmission>> {
  try {
    const data = await apiClient<AdminSubmission>({
      method: "POST",
      endpoint: `/api/market/admin/submissions/${id}/reject`,
      body: { reason },
    });
    revalidateTag("admin-submissions");
    revalidateTag("admin-moderation-stats");
    revalidateTag(`admin-submission-${id}`);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    throw error;
  }
}

export async function bulkApproveSubmissions(
  ids: number[]
): Promise<ActionResult<{ approved: number[] }>> {
  const results: number[] = [];
  const errors: string[] = [];

  for (const id of ids) {
    try {
      await apiClient({
        method: "POST",
        endpoint: `/api/market/admin/submissions/${id}/approve`,
      });
      results.push(id);
    } catch (error) {
      if (error instanceof ApiError) {
        errors.push(`#${id}: ${error.message}`);
      }
    }
  }

  revalidateTag("admin-submissions");
  revalidateTag("admin-moderation-stats");

  if (errors.length > 0 && results.length === 0) {
    return { success: false, message: errors.join("; ") };
  }
  return { success: true, data: { approved: results } };
}
