import { apiClient } from "@/lib/api";
import ProfileClient from "./ProfileClient";
import type { UserProfile } from "@/services/userService";

export default async function ProfilePage() {
  // fetch current user on the server using apiClient (reads HttpOnly cookie)
  let current: UserProfile | null = null;
  try {
    current = await apiClient<UserProfile>({ method: "GET", endpoint: "/api/users/me/" });
  } catch (err) {
    current = null;
  }

  async function updateProfileAction(formData: FormData) {
    "use server";
    const updated = await apiClient<UserProfile>({ method: "PATCH", endpoint: "/api/users/me/", body: formData });
    return updated;
  }

  return <ProfileClient initialUser={current} onSave={updateProfileAction} />;
}
