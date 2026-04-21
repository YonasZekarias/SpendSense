"use client";

import { useMemo } from "react";
import type { MarketTrendRow } from "@/services/marketService";

type TrendChartProps = {
  rows: MarketTrendRow[];
};

function toPrice(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function TrendChart({ rows }: TrendChartProps) {
  const chart = useMemo(() => {
    if (!rows.length) {
      return null;
    }

    const points = rows.map((row, index) => ({
      x: rows.length === 1 ? 50 : (index / (rows.length - 1)) * 100,
      y: toPrice(row.average_price),
    }));

    const min = Math.min(...points.map((point) => point.y));
    const max = Math.max(...points.map((point) => point.y));
    const span = max - min || 1;

    const plot = points
      .map((point) => `${point.x},${95 - ((point.y - min) / span) * 80}`)
      .join(" ");

    return { plot };
  }, [rows]);

  if (!chart) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
        No trend data available yet.
      </div>
    );
  }

  return (
    <div className="h-72 rounded-xl border border-border/60 bg-background p-4">
      <svg aria-label="Price trend chart" className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          points={chart.plot}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          className="text-[#135bec]"
        />
      </svg>
    </div>
  );
}
