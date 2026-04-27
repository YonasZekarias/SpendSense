"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/providers/auth-provider";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "http://127.0.0.1:3001";

type RealtimeEventName =
  | "budget_warning"
  | "price_spike_alert"
  | "vendor_deal"
  | "delivery_update"
  | "payment_confirmation"
  | "notification";

type RealtimeContextValue = {
  /** Increments every time any real-time event arrives — use as a `useEffect` dep to refetch. */
  eventVersion: number;
  /** Last event payload received (for ad-hoc handlers). */
  lastEvent: { name: RealtimeEventName; payload: unknown } | null;
  /** Whether the socket has authenticated successfully. */
  connected: boolean;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  eventVersion: 0,
  lastEvent: null,
  connected: false,
});

export function useRealtime(): RealtimeContextValue {
  return useContext(RealtimeContext);
}

const EVENTS: RealtimeEventName[] = [
  "budget_warning",
  "price_spike_alert",
  "vendor_deal",
  "delivery_update",
  "payment_confirmation",
  "notification",
];

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { accessToken, status } = useAuth();
  const [flash, setFlash] = useState<string | null>(null);
  const [eventVersion, setEventVersion] = useState(0);
  const [lastEvent, setLastEvent] = useState<RealtimeContextValue["lastEvent"]>(null);
  const [connected, setConnected] = useState(false);
  const flashTimer = useRef<number | null>(null);

  const showFlash = useCallback((text: string) => {
    setFlash(text);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 12_000);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      setConnected(false);
      return;
    }

    const socket: Socket = io(REALTIME_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.emit("authenticate", { token: accessToken });

    const onEvent = (name: RealtimeEventName) => (data: unknown) => {
      setLastEvent({ name, payload: data });
      setEventVersion((v) => v + 1);
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message: string }).message)
          : labelFor(name);
      showFlash(message);
    };

    socket.on("authenticated", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("auth_error", (e: { detail?: string }) => {
      setConnected(false);
      if (e?.detail) showFlash(String(e.detail));
    });

    for (const name of EVENTS) {
      socket.on(name, onEvent(name));
    }

    return () => {
      setConnected(false);
      socket.removeAllListeners();
      socket.close();
    };
  }, [accessToken, status, showFlash]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ eventVersion, lastEvent, connected }),
    [eventVersion, lastEvent, connected]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      {flash && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
        >
          {flash}
        </div>
      )}
    </RealtimeContext.Provider>
  );
}

function labelFor(name: RealtimeEventName): string {
  switch (name) {
    case "budget_warning":
      return "Budget alert: you are approaching or exceeding your monthly limit.";
    case "price_spike_alert":
      return "Price spike detected on a tracked item.";
    case "vendor_deal":
      return "A nearby vendor offers a better price than the city average.";
    case "delivery_update":
      return "Delivery status updated for one of your orders.";
    case "payment_confirmation":
      return "Payment confirmed.";
    case "notification":
    default:
      return "You have a new real-time update.";
  }
}
