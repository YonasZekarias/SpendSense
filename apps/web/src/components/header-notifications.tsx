"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { useAuth } from "@/providers/auth-provider";
import { useRealtime } from "@/providers/realtime-provider";
import { listNotifications, type InAppNotification } from "@/services/userService";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 8;

function labelForType(type: string): string {
  const map: Record<string, string> = {
    budget_warning: "Budget",
    price_alert: "Price alert",
    price_spike: "Price change",
    submission_status: "Crowdsource",
    vendor_verification: "Vendor",
    vendor_deal: "Vendor deal",
    delivery_update: "Delivery",
    payment: "Payment",
  };
  return map[type] ?? type.replace(/_/g, " ");
}

export function HeaderNotifications({ className }: { className?: string }) {
  const { accessToken, status } = useAuth();
  const { eventVersion } = useRealtime();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await listNotifications(accessToken);
      setItems(Array.isArray(data.results) ? data.results : []);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated" && accessToken) void load();
  }, [status, accessToken, load, eventVersion]);

  useEffect(() => {
    if (open && accessToken) void load();
  }, [open, accessToken, load]);

  if (status !== "authenticated") {
    return null;
  }

  const unread = items.filter((n) => !n.is_read).length;
  const preview = items.slice(0, PREVIEW_LIMIT);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          aria-expanded={open}
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200/50 bg-white/50 text-slate-600 backdrop-blur-sm transition-colors hover:border-[#135bec]/30 hover:text-[#135bec] dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:text-[#135bec]",
            className,
          )}
        >
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-[#e73908] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-950">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,22rem)] border-slate-200 p-0 shadow-lg dark:border-slate-800 sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Notifications
          </h2>
          {unread > 0 ? (
            <span className="text-xs font-medium text-slate-500">
              {unread} unread
            </span>
          ) : null}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : preview.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              No notifications yet. Alerts for prices, budgets, and submissions
              will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {preview.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/60",
                    !n.is_read && "bg-[#135bec]/[0.04]",
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#135bec]">
                    {labelForType(n.type)}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-800 dark:text-slate-200">
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 p-2 dark:border-slate-800">
          <Button
            variant="ghost"
            className="h-9 w-full text-sm font-medium text-[#135bec] hover:bg-slate-50 dark:hover:bg-slate-900"
            asChild
          >
            <Link href="/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
