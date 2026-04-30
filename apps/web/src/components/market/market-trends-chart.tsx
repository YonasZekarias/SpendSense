"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  getForecasts,
  getInflation,
  getItems,
  getPriceTrends,
  type MarketItem,
} from "@/services/marketService";

type ChartRow = { date: string; average_price?: number; forecast?: number };

export function MarketTrendsChart() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [itemId, setItemId] = useState<number | null>(null);
  const [city, setCity] = useState("Addis Ababa");
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inflation, setInflation] = useState<Awaited<ReturnType<typeof getInflation>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = searchParams.get("item_id");
    const parsed = fromQuery ? Number.parseInt(fromQuery, 10) : NaN;
    void getItems()
      .then((list) => {
        setItems(list);
        if (list.length) {
          setItemId((cur) => {
            if (cur != null) return cur;
            if (Number.isFinite(parsed) && list.some((i) => i.id === parsed)) return parsed;
            return list[0]!.id;
          });
        }
      })
      .catch(() => setError("Could not load items"));
  }, [searchParams]);

  const loadSeries = useCallback(async () => {
    if (itemId == null) return;
    setLoading(true);
    setError(null);
    try {
      const [trends, forecast, infl] = await Promise.all([
        getPriceTrends({ item_id: itemId, city: city || undefined }),
        getForecasts({ item_id: itemId, city: city || undefined, forecast_weeks: 4 }),
        getInflation({ city: city || undefined, item_id: itemId, period: "month" }),
      ]);
      setInflation(infl);
      const hist: ChartRow[] = trends.map((t) => ({
        date: t.date,
        average_price: Number.parseFloat(t.average_price) || 0,
        forecast: undefined,
      }));
      const fc: ChartRow[] = forecast.slice(0, 4).map((f) => ({
        date: f.forecast_date,
        average_price: undefined,
        forecast: Number.parseFloat(f.predicted_price) || 0,
      }));
      setRows([...hist, ...fc]);
    } catch {
      setError("Could not load trend data. Ensure the API is running and items exist.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [itemId, city]);

  useEffect(() => {
    if (itemId != null) void loadSeries();
  }, [itemId, city, loadSeries]);

  return (
    <div className="mb-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Price trend &amp; forecast</h2>
          <p className="text-sm text-slate-500">From approved crowdsourced data and ML forecasts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600">
            Item
            <select
              className="ml-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              value={itemId ?? ""}
              onChange={(e) => setItemId(Number(e.target.value))}
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            City
            <input
              className="ml-2 w-32 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadSeries()}>
            Refresh
          </Button>
        </div>
      </div>

      {inflation?.change_percent != null && (
        <p className="text-sm text-slate-600">
          <span className="font-medium">Inflation (vs prior month):</span>{" "}
          {inflation.change_percent > 0 ? "+" : ""}
          {inflation.change_percent}%
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && (
        <div className="flex h-64 items-center justify-center text-slate-500">
          <Loader2 className="mr-2 size-5 animate-spin" />
          Loading chart…
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={24} />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => (Number.isFinite(v) ? v.toFixed(0) : "")}
              />
              <Tooltip
                formatter={(value: number) => [`${value?.toFixed?.(2) ?? value} ETB`, "Price"]}
                labelFormatter={(l: string) => `Date: ${l}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="average_price"
                name="Observed avg."
                stroke="#135bec"
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#16a34a"
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && rows.length === 0 && !error && (
        <p className="text-sm text-slate-500">No series data for this selection yet.</p>
      )}
    </div>
  );
}
