import { createApiClient } from "./apiClient";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: "user" | "vendor" | "admin";
  city?: string | null;
  household_size?: number | null;
  income_bracket?: string | null;
  notification_preferences?: unknown;
  onboarding_completed?: boolean;
  created_at?: string;
};

export async function getCurrentUser(accessToken: string): Promise<UserProfile> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<UserProfile>("/api/users/me/");
  return data;
}

export type UserProfileUpdate = {
  full_name?: string;
  city?: string | null;
  phone?: string | null;
  household_size?: number | null;
  income_bracket?: string | null;
  notification_preferences?: Record<string, boolean>;
  onboarding_completed?: boolean;
};

export async function updateProfile(
  accessToken: string,
  body: UserProfileUpdate
): Promise<UserProfile> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.patch<UserProfile>("/api/users/me/", body);
  return data;
}

export type InAppNotification = {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  metadata?: Record<string, any>;
  created_at: string;
};

export type NotificationListResponse = {
  results: InAppNotification[];
  count: number;
  next: string | null;
  previous: string | null;
};

export async function listNotifications(
  accessToken: string,
  params?: {
    is_read?: boolean;
    is_archived?: boolean;
    type?: string;
    page?: number;
  }
): Promise<NotificationListResponse> {
  const api = createApiClient(() => accessToken);
  
  const searchParams = new URLSearchParams();
  if (params) {
    if (params.is_read !== undefined) searchParams.append("status", params.is_read ? "read" : "unread");
    if (params.is_archived !== undefined) searchParams.append("archived", params.is_archived.toString());
    if (params.type) searchParams.append("type", params.type);
    if (params.page) searchParams.append("page", params.page.toString());
  }
  
  const query = searchParams.toString();
  const endpoint = `/api/users/me/notifications/${query ? `?${query}` : ""}`;
  
  const { data } = await api.get<any>(endpoint);
  
  if (Array.isArray(data)) {
    return { results: data, count: data.length, next: null, previous: null };
  }
  
  return {
    results: data?.results || [],
    count: data?.count || 0,
    next: data?.next || null,
    previous: data?.previous || null,
  };
}

export async function patchNotification(
  accessToken: string,
  id: number,
  body: { is_read?: boolean; is_archived?: boolean }
): Promise<InAppNotification> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.patch<InAppNotification>(`/api/users/me/notifications/${id}/`, body);
  return data;
}

export async function bulkUpdateNotifications(
  accessToken: string,
  action: "mark_read" | "archive" | "delete",
  notificationIds: number[]
): Promise<{ status: string }> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.post<any>("/api/users/me/notifications/bulk/", {
    action,
    ids: notificationIds,
  });
  return data;
}

