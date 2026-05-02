"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Area, AreaChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { getForecasts, getInflation, getItems, getPriceTrends, type MarketItem } from "@/services/marketService";

type ChartRow = { date: string; actual?: number; forecast?: number };

const CITY_OPTIONS = ["Addis Ababa", "Dire Dawa", "Bahir Dar", "Hawassa", "Mekelle"];

export function MarketTrendsChart() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [itemId, setItemId] = useState<number | null>(null);
  const [city, setCity] = useState("Addis Ababa");
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inflation, setInflation] = useState<{ change_percent: number | null; current_avg: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"1M" | "3M" | "6M" | "1Y">("3M");

  // Load items once
  useEffect(() => {
    getItems()
      .then((list) => {
        setItems(list);
      })
      .catch(() => setError("Could not load items"));
  }, []);

  // Update selected item from URL query
  useEffect(() => {
    const fromQuery = searchParams.get("item_id");
    if (fromQuery && items.length > 0) {
      const parsed = parseInt(fromQuery, 10);
      if (Number.isFinite(parsed) && items.some((i) => i.id === parsed)) {
        setItemId(parsed);
      }
    } else if (itemId === null && items.length > 0) {
      setItemId(items[0].id);
    }
  }, [searchParams, items]);

  const getFromDate = () => {
    const d = new Date();
    if (range === "1M") d.setMonth(d.getMonth() - 1);
    else if (range === "3M") d.setMonth(d.getMonth() - 3);
    else if (range === "6M") d.setMonth(d.getMonth() - 6);
    else d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  };

  const loadSeries = useCallback(async () => {
    if (itemId == null) return;
    setLoading(true);
    setError(null);
    try {
      const from_date = getFromDate();
      const [trends, forecast, infl] = await Promise.all([
        getPriceTrends({ item_id: itemId, city, from_date }),
        getForecasts({ item_id: itemId, city, forecast_weeks: 4 }),
        getInflation({ city, item_id: itemId, period: "month" }),
      ]);
      setInflation(infl);
      const hist: ChartRow[] = trends.map((t) => ({ date: t.date, actual: parseFloat(t.average_price) || 0 }));
      const fc: ChartRow[] = forecast.slice(0, 4).map((f) => ({ date: f.forecast_date, forecast: parseFloat(f.predicted_price) || 0 }));
      setRows([...hist, ...fc]);
    } catch {
      setError("Could not load trend data.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [itemId, city, range]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (itemId != null) void loadSeries(); }, [itemId, city, range, loadSeries]);

  const selectedItem = items.find((i) => i.id === itemId);

  return (
    <div className="mb-8 rounded-2xl border border-[#e5e7eb] dark:border-[#2a3140] bg-white dark:bg-[#1e2330] p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="size-5 text-[#135bec]" />
            <h2 className="text-lg font-bold text-[#111318] dark:text-white">Price Trend & Forecast</h2>
          </div>
          <p className="text-sm text-[#616f89]">
            {selectedItem ? `${selectedItem.name} (${selectedItem.unit})` : "Select an item"} · {city}
            {inflation?.change_percent !== null && inflation?.change_percent !== undefined && (
              <span className={`ml-2 font-semibold ${inflation.change_percent > 0 ? "text-red-500" : "text-green-600"}`}>
                {inflation.change_percent > 0 ? "▲" : "▼"} {Math.abs(inflation.change_percent).toFixed(1)}% vs last month
              </span>
            )}
          </p>
          {inflation?.current_avg && (
            <p className="text-sm text-[#616f89] mt-0.5">Current avg: <span className="font-semibold text-[#111318] dark:text-white">{parseFloat(inflation.current_avg).toLocaleString()} ETB</span></p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Item selector */}
          <select
            value={itemId ?? ""}
            onChange={(e) => setItemId(Number(e.target.value))}
            className="h-9 pl-3 pr-8 rounded-lg border border-[#e5e7eb] dark:border-[#2a3140] bg-[#f0f2f4] dark:bg-[#2a3140] text-sm text-[#111318] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]"
          >
            {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>

          {/* City selector */}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-[#e5e7eb] dark:border-[#2a3140] bg-[#f0f2f4] dark:bg-[#2a3140] text-sm text-[#111318] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]"
          >
            {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Range pills */}
          <div className="flex rounded-lg overflow-hidden border border-[#e5e7eb] dark:border-[#2a3140]">
            {(["1M", "3M", "6M", "1Y"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${range === r ? "bg-[#135bec] text-white" : "bg-white dark:bg-[#1e2330] text-[#616f89] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3140]"}`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => void loadSeries()} disabled={loading}>
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

      {loading && (
        <div className="flex h-64 items-center justify-center text-[#616f89]">
          <Loader2 className="mr-2 size-5 animate-spin" /> Loading chart…
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#135bec" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#135bec" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#616f89" }} minTickGap={28} />
              <YAxis
                tick={{ fontSize: 11, fill: "#616f89" }}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => Number.isFinite(v) ? `${v.toFixed(0)}` : ""}
                width={55}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(value: number, name: string) => [`${value?.toFixed(2)} ETB`, name === "actual" ? "Observed avg." : "Forecast"]}
                labelFormatter={(l: string) => `Date: ${l}`}
              />
              <Legend formatter={(v) => v === "actual" ? "Observed avg." : "ML Forecast"} />
              <Area type="monotone" dataKey="actual" name="actual" stroke="#135bec" strokeWidth={2} fill="url(#colorActual)" dot={false} connectNulls />
              <Area type="monotone" dataKey="forecast" name="forecast" stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorForecast)" dot={false} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && rows.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center h-48 text-[#616f89] gap-2">
          <TrendingUp className="size-10 opacity-20" />
          <p className="text-sm">No trend data yet for this item and city.</p>
          <p className="text-xs">Submit prices to start building the chart.</p>
        </div>
      )}
    </div>
  );
}
