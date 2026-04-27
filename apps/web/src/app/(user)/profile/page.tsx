"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useAuth } from "@/providers/auth-provider";
import { getCurrentUser, updateProfile, type UserProfile } from "@/services/userService";

export default function ProfilePage() {
  const { accessToken, status, user } = useAuth();
  const [form, setForm] = useState<Partial<UserProfile & { full_name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || status !== "authenticated") {
      setLoading(false);
      return;
    }
    void getCurrentUser(accessToken)
      .then((u) => {
        setForm({
          full_name: u.full_name,
          city: u.city ?? "",
          phone: u.phone ?? "",
          household_size: u.household_size ?? undefined,
          income_bracket: u.income_bracket ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [accessToken, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-slate-500">{user?.email}</p>
      </div>
      {message && <p className="text-sm text-emerald-600">{message}</p>}

      <div className="space-y-2">
        <label className="text-sm font-medium">Full name</label>
        <Input
          value={form.full_name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone</label>
        <Input
          value={form.phone ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">City</label>
        <Input
          value={form.city ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Household size</label>
        <Input
          type="number"
          min={1}
          value={form.household_size ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, household_size: Number.parseInt(e.target.value, 10) || undefined }))
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Income bracket</label>
        <Input
          placeholder="e.g. 5000-10000"
          value={form.income_bracket ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, income_bracket: e.target.value }))}
        />
      </div>

      <Button
        disabled={saving || !accessToken}
        onClick={async () => {
          if (!accessToken) return;
          setSaving(true);
          setMessage(null);
          try {
            await updateProfile(accessToken, {
              full_name: form.full_name,
              city: form.city || null,
              phone: form.phone,
              household_size: form.household_size,
              income_bracket: form.income_bracket || null,
            });
            setMessage("Profile saved.");
          } catch {
            setMessage("Could not save. Check your network.");
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
