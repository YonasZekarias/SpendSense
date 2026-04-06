"use client";

import { useMemo } from "react";
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
import type { ForecastPoint, PriceTrendPoint } from "@/services/marketService";

export type ChartRow = {
  date: string;
  historical: number | null;
  forecast: number | null;
};

function mergeSeries(trends: PriceTrendPoint[], forecasts: ForecastPoint[]): ChartRow[] {
  const byDate = new Map<string, { historical?: number; forecast?: number }>();

  for (const t of trends) {
    const prev = byDate.get(t.date) ?? {};
    byDate.set(t.date, {
      ...prev,
      historical: Number(t.average_price),
    });
  }

  for (const f of forecasts) {
    const prev = byDate.get(f.forecast_date) ?? {};
    byDate.set(f.forecast_date, {
      ...prev,
      forecast: Number(f.predicted_price),
    });
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      historical: v.historical ?? null,
      forecast: v.forecast ?? null,
    }));
}

function formatTick(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function formatEtb(value: number) {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB`;
}

type Props = {
  trends: PriceTrendPoint[];
  forecasts: ForecastPoint[];
  emptyMessage?: string;
};

export function TrendForecastChart({ trends, forecasts, emptyMessage }: Props) {
  const data = useMemo(() => mergeSeries(trends, forecasts), [trends, forecasts]);

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-[#e5e7eb] dark:border-[#2a3140] bg-[#f9fafb] dark:bg-[#252b38] text-sm text-[#616f89] dark:text-gray-400">
        {emptyMessage ?? "No trend or forecast data for this item yet."}
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-[#e5e7eb] dark:stroke-[#374151]" />
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-[#616f89]"
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => (typeof v === "number" ? v.toLocaleString() : String(v))}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-[#616f89]"
            width={56}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            labelFormatter={(label) => formatTick(String(label))}
            formatter={(value: number, name: string) => {
              if (value == null || Number.isNaN(value)) return ["—", name];
              return [formatEtb(value), name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="historical"
            name="Daily average (crowdsourced)"
            stroke="#135bec"
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke="#ea580c"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
