import { apiClient, ApiError } from "@/lib/api";
import {
  type AdminSubmission,
  type AdminSubmissionsListResponse,
  type AdminModerationStats,
} from "@/types/api/admin-submissions";
import {
  adminSubmissionsListSchema,
  adminSubmissionSchema,
} from "@/lib/validation/admin-submissions";
import { z } from "zod";

const moderationStatsSchema = z.object({
  pending: z.number(),
  approved_today: z.number(),
  rejected_today: z.number(),
  outlier_flagged: z.number(),
});

export async function getAdminSubmissions(params: {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  page_size?: number;
  search?: string;
  outlier?: boolean;
} = {}): Promise<AdminSubmissionsListResponse> {
  const raw = await apiClient<AdminSubmissionsListResponse>({
    method: "GET",
    endpoint: "/api/market/admin/submissions",
    query: {
      status: params.status ?? "pending",
      page: params.page ?? 1,
      page_size: params.page_size ?? 12,
      search: params.search ?? "",
      outlier: params.outlier ? "true" : undefined,
    },
    next: { tags: ["admin-submissions"] },
  });
  return adminSubmissionsListSchema.parse(raw);
}

export async function getAdminModerationStats(): Promise<AdminModerationStats> {
  const raw = await apiClient<AdminModerationStats>({
    method: "GET",
    endpoint: "/api/market/admin/moderation-stats",
    next: { tags: ["admin-moderation-stats"], revalidate: 30 },
  });
  return moderationStatsSchema.parse(raw);
}

export async function getAdminSubmissionDetail(id: number): Promise<AdminSubmission> {
  const raw = await apiClient<AdminSubmission>({
    method: "GET",
    endpoint: `/api/market/admin/submissions/${id}`,
    next: { tags: [`admin-submission-${id}`] },
  });
  return adminSubmissionSchema.parse(raw);
}
