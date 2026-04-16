"use client";

import Link from "next/link";
import { Download, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryPills } from "@/components/market/category-pills";

const quickPulseRows = [
  { title: "Coffee (Arabica)", subtitle: "Export Grade", change: "+4.2%", tone: "positive" as const },
  { title: "Import Logistics", subtitle: "Via Djibouti", change: "-1.8%", tone: "negative" as const },
];

export default function MarketPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPulse = useMemo(() => {
    if (!selectedCategory) return quickPulseRows;
    return quickPulseRows.filter((row) =>
      row.title.toLowerCase().includes(selectedCategory.toLowerCase()),
    );
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111318] dark:text-white">
            Market Intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#616f89] dark:text-gray-400">
            Real-time commodity tracking across Ethiopia&apos;s major economic hubs. Data updates
            every 15 minutes.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-xl border border-[#dbdfe6] bg-white px-4 py-2 text-sm font-semibold text-[#111318] dark:border-gray-700 dark:bg-slate-900 dark:text-white"
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#135bec] px-4 py-2 text-sm font-semibold text-white"
          >
            <Download className="size-4" />
            Export Data
          </button>
        </div>
      </div>

      <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111318] dark:text-white">
                Essential Commodity Trends
              </h2>
              <p className="text-xs text-[#616f89] dark:text-gray-400">
                Price per Quintal (ETB) - National Average
              </p>
            </div>
            <Link
              href="/market/submit"
              className="text-sm font-semibold text-[#135bec] hover:underline"
            >
              Submit Price
            </Link>
          </div>
          <div className="flex h-64 items-end gap-3 rounded-xl bg-[#f0f2f4] p-4 dark:bg-slate-800">
            {[40, 55, 52, 68, 72, 80].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t bg-[#135bec]/80"
                  style={{ height: `${v}%` }}
                />
                <span className="text-[10px] font-bold text-gray-400">WK 0{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          <div className="relative overflow-hidden rounded-xl bg-[#135bec] p-6 text-white shadow-lg">
            <span className="mb-4 inline-block rounded bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
              Market Alert
            </span>
            <h3 className="text-xl font-bold">Teff Prices Surging</h3>
            <p className="mt-1 text-sm text-blue-100">
              12% increase detected in the central region over the last 48 hours.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="size-5" />
              <span className="text-2xl font-black">ETB 8,450</span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#616f89] dark:text-gray-400">
              Quick Pulse
            </h4>
            <div className="space-y-4">
              {(filteredPulse.length ? filteredPulse : quickPulseRows).map((row) => (
                <div key={row.title} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#111318] dark:text-white">{row.title}</p>
                    <p className="text-xs text-gray-400">{row.subtitle}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      row.tone === "positive" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {row.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#111318] dark:text-white">Regional Price Variance</h3>
            <Link href="/market/1" className="text-sm font-semibold text-[#135bec] hover:underline">
              Open Item Detail
            </Link>
          </div>
          <div className="rounded-xl border border-dashed border-[#dbdfe6] p-8 text-center text-sm text-[#616f89] dark:border-gray-700 dark:text-gray-400">
            Interactive map region scaffold ready. Bind to backend heatmap data next.
          </div>
        </div>
      </div>
    </div>
  );
}
