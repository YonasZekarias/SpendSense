"use client";

import { MapPin, Navigation } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Button } from "@repo/ui/components/button";
import { MARKETS_BY_REGION, CITIES } from "@/lib/constants/markets";
import { useGpsLocation } from "@/hooks/use-gps-location";

interface LocationPickerProps {
  city: string;
  marketLocation: string;
  onCityChange: (city: string) => void;
  onMarketChange: (market: string) => void;
  errors?: { city?: string; market?: string };
}

export function LocationPicker({
  city,
  marketLocation,
  onCityChange,
  onMarketChange,
  errors,
}: LocationPickerProps) {
  const { state, detect } = useGpsLocation();
  const markets = MARKETS_BY_REGION[city] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-[#616f89]">
          Market location <span className="text-red-500">*</span>
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={detect}
          disabled={state.status === "loading"}
        >
          <Navigation className="size-3.5" />
          {state.status === "loading" ? "Detecting…" : "Use GPS"}
        </Button>
      </div>

      {state.status === "success" && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          Location captured ({state.latitude.toFixed(4)},{" "}
          {state.longitude.toFixed(4)}). Select or type the market name below.
        </p>
      )}
      {(state.status === "denied" || state.status === "unavailable") && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {state.message}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
            Region / City
          </Label>
          <select
            className="w-full rounded-lg border-none bg-[#f0f2f4] p-3 text-sm font-medium"
            value={city}
            onChange={(e) => {
              onCityChange(e.target.value);
              onMarketChange("");
            }}
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors?.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>
        <div>
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
            Market / store
          </Label>
          {markets.length > 0 ? (
            <select
              className="w-full rounded-lg border-none bg-white p-3 text-sm font-medium shadow-sm"
              value={marketLocation}
              onChange={(e) => onMarketChange(e.target.value)}
            >
              <option value="">Select or type below…</option>
              {markets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : null}
          <Input
            className="mt-2 border-none bg-white shadow-sm"
            placeholder="e.g. Merkato, Shola, custom market"
            value={marketLocation}
            onChange={(e) => onMarketChange(e.target.value)}
          />
          {errors?.market && (
            <p className="mt-1 text-sm text-red-600">{errors.market}</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-[#f0f2f4]/80 px-3 py-2 text-xs text-[#616f89]">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#135bec]" />
        <span>
          Markets are grouped by region. You can type a custom name if yours is
          not listed.
        </span>
      </div>
    </div>
  );
}
