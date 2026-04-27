"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useAuth } from "@/providers/auth-provider";
import { useRealtime } from "@/providers/realtime-provider";
import { listNotifications, patchNotification, type InAppNotification } from "@/services/userService";

export default function NotificationsPage() {
  const { accessToken, status } = useAuth();
  const { eventVersion } = useRealtime();
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await listNotifications(accessToken);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated" && accessToken) void load();
    else if (status !== "loading") setLoading(false);
  }, [status, accessToken, load, eventVersion]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-60 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading notifications…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {items.length === 0 ? (
        <p className="text-slate-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`flex items-start justify-between gap-3 rounded-xl border p-4 ${
                n.is_read ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <p className="text-sm font-medium">{n.type}</p>
                <p className="text-sm text-slate-600">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && accessToken && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await patchNotification(accessToken, n.id, { is_read: true });
                    void load();
                  }}
                >
                  Mark read
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
