/**
 * MCP-generated API response interfaces for admin price moderation endpoints.
 * Matches Django AdminSubmissionListSerializer shape.
 */

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface AdminSubmission {
  id: number;
  item: number;
  item_name: string;
  price_value: string;
  unit: string;
  market_location: string;
  city: string;
  vendor_name: string;
  date_observed: string;
  time_observed: string;
  quality_grade: string;
  quantity_available: string | null;
  notes: string;
  status: SubmissionStatus;
  rejection_reason: string;
  outlier_flag: boolean;
  image: string | null;
  created_at: string;
  submitter_email: string;
}

export interface AdminSubmissionsListResponse {
  results: AdminSubmission[];
  pagination: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
  };
}

export interface AdminApproveResponse {
  id: number;
  status: SubmissionStatus;
  item_name: string;
  price_value: string;
  market_location: string;
  city: string;
}

export interface AdminRejectResponse {
  id: number;
  status: SubmissionStatus;
  rejection_reason: string;
}

export interface AdminModerationStats {
  pending: number;
  approved_today: number;
  rejected_today: number;
  outlier_flagged: number;
}
