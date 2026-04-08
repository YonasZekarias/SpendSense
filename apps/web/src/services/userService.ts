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
  avatar?: string | null;
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
  avatar?: File | null;
};

export async function updateProfile(
  accessToken: string,
  body: UserProfileUpdate
): Promise<UserProfile> {
  const api = createApiClient(() => accessToken);
  
  if (body.avatar) {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value === null) {
          // Skip or send as empty string depending on backend preference
          // Django typically prefers not sending the field or sending empty string for CharFields
        } else if (key === 'avatar') {
          formData.append(key, value as File);
        } else if (typeof value === 'object' && key === 'notification_preferences') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    const { data } = await api.patch<UserProfile>("/api/users/me/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  }

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

