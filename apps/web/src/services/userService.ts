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
  created_at: string;
};

export async function listNotifications(accessToken: string): Promise<InAppNotification[]> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<InAppNotification[]>("/api/users/me/notifications/");
  return data;
}

export async function patchNotification(
  accessToken: string,
  id: number,
  body: { is_read: boolean }
): Promise<InAppNotification> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.patch<InAppNotification>(`/api/users/me/notifications/${id}/`, body);
  return data;
}

