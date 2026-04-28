"use client";

import Link from "next/link";
import { Download, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CategoryPills } from "@/components/market/category-pills";
import { TrendChart } from "@/components/market/trend-chart";
import { getItems, getPriceAverages, getPriceTrends, type MarketItem, type PriceAverageRow } from "@/services/marketService";

function toPrice(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MarketPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [averages, setAverages] = useState<PriceAverageRow[]>([]);
  const [trendRows, setTrendRows] = useState<{ date: string; average_price: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      setError(null);
      try {
        const [itemsResult, averagesResult] = await Promise.all([getItems(), getPriceAverages()]);
        setItems(itemsResult);
        setAverages(averagesResult);
      } catch {
        setError("Unable to load market intelligence right now.");
      } finally {
        setLoading(false);
      }
    };

    void boot();
  }, []);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [items, selectedCategory]);

  const focusedItem = useMemo(() => {
    return filteredItems[0] ?? items[0] ?? null;
  }, [filteredItems, items]);

  useEffect(() => {
    const fetchTrends = async () => {
      if (!focusedItem) {
        setTrendRows([]);
        return;
      }
      setLoadingTrends(true);
      try {
        const rows = await getPriceTrends({ item_id: focusedItem.id });
        setTrendRows(rows);
      } catch {
        setTrendRows([]);
      } finally {
        setLoadingTrends(false);
      }
    };

    void fetchTrends();
  }, [focusedItem]);

  const overview = useMemo(() => {
    const rows = averages.filter((row) => (focusedItem ? row.item_id === focusedItem.id : true));
    const current = rows.length ? rows.reduce((sum, row) => sum + toPrice(row.average_price), 0) / rows.length : null;
    const mostAffordable = rows
      .slice()
      .sort((a, b) => toPrice(a.average_price) - toPrice(b.average_price))[0];
    return {
      current,
      mostAffordableCity: mostAffordable?.city ?? "—",
      submissions: rows.reduce((sum, row) => sum + row.count, 0),
    };
  }, [averages, focusedItem]);

  const quickPulseRows = useMemo(() => {
    const rows = averages
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((row) => ({
        key: `${row.item_id}-${row.city}`,
        title: row.item_name,
        subtitle: row.city,
        price: `${row.average_price} ETB`,
        count: row.count,
      }));
    return rows;
  }, [averages]);

  const tableRows = useMemo(() => {
    const latestPrice = trendRows.length ? toPrice(trendRows[trendRows.length - 1]?.average_price ?? "0") : null;
    const previousPrice = trendRows.length > 1 ? toPrice(trendRows[trendRows.length - 2]?.average_price ?? "0") : null;
    const trendPct =
      latestPrice != null && previousPrice != null && previousPrice > 0
        ? ((latestPrice - previousPrice) / previousPrice) * 100
        : null;

    return filteredItems.map((item) => {
      const itemRows = averages.filter((row) => row.item_id === item.id);
      const itemAvg = itemRows.length
        ? itemRows.reduce((sum, row) => sum + toPrice(row.average_price), 0) / itemRows.length
        : null;
      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        avg: itemAvg,
        city: itemRows[0]?.city ?? "—",
        submissions: itemRows.reduce((sum, row) => sum + row.count, 0),
        trend: item.id === focusedItem?.id ? trendPct : null,
      };
    });
  }, [averages, filteredItems, focusedItem?.id, trendRows]);

  const categoryLabel = selectedCategory ?? "All Categories";

  const filteredPulse = useMemo(() => {
    if (!selectedCategory) return quickPulseRows;
    return quickPulseRows.filter((row) =>
      row.title.toLowerCase().includes(selectedCategory.toLowerCase()),
    );
  }, [quickPulseRows, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111318] dark:text-white">
            Market Intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#616f89] dark:text-gray-400">
            Real-time commodity tracking across Ethiopia&apos;s major economic hubs.
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
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111318] dark:text-white">
                Essential Commodity Trends ({categoryLabel})
              </h2>
              <p className="text-xs text-[#616f89] dark:text-gray-400">
                Source: `GET /api/market/trends/` for {focusedItem?.name ?? "selected item"}
              </p>
            </div>
            <Link
              href="/market/submit"
              className="text-sm font-semibold text-[#135bec] hover:underline"
            >
              Submit Price
            </Link>
          </div>
          {loading || loadingTrends ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-[#f0f2f4] text-sm text-[#616f89] dark:bg-slate-800 dark:text-gray-400">
              Loading trends...
            </div>
          ) : (
            <TrendChart rows={trendRows} />
          )}
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          <div className="relative overflow-hidden rounded-xl bg-[#135bec] p-6 text-white shadow-lg">
            <span className="mb-4 inline-block rounded bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
              Market Alert
            </span>
            <h3 className="text-xl font-bold">{focusedItem?.name ?? "No item selected"}</h3>
            <p className="mt-1 text-sm text-blue-100">
              Most affordable city: {overview.mostAffordableCity}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="size-5" />
              <span className="text-2xl font-black">
                {overview.current == null ? "—" : `ETB ${overview.current.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#616f89] dark:text-gray-400">
              Quick Pulse
            </h4>
            <div className="space-y-4">
              {(filteredPulse.length ? filteredPulse : quickPulseRows).map((row) => (
                <div key={row.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#111318] dark:text-white">{row.title}</p>
                    <p className="text-xs text-gray-400">{row.subtitle}</p>
                  </div>
                  <span className="text-sm font-bold text-[#135bec]">
                    {row.price}
                    <span className="ml-1 text-xs text-gray-400">({row.count})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#111318] dark:text-white">Regional Price Variance</h3>
            <Link
              href={focusedItem ? `/market/${focusedItem.id}` : "/market"}
              className="text-sm font-semibold text-[#135bec] hover:underline"
            >
              Open Item Detail
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-[#dbdfe6] text-xs uppercase tracking-wide text-[#616f89] dark:border-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-3 py-3">Item</th>
                  <th className="px-3 py-3">Unit</th>
                  <th className="px-3 py-3">Avg Price</th>
                  <th className="px-3 py-3">City</th>
                  <th className="px-3 py-3 text-right">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && tableRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-5 text-center text-[#616f89] dark:text-gray-400">
                      No items in this category yet.
                    </td>
                  </tr>
                )}
                {tableRows.map((row) => (
                  <tr key={row.id} className="border-b border-[#f0f2f4] last:border-0 dark:border-slate-800">
                    <td className="px-3 py-3 font-semibold">{row.name}</td>
                    <td className="px-3 py-3 text-[#616f89] dark:text-gray-400">{row.unit}</td>
                    <td className="px-3 py-3 text-[#111318] dark:text-white">
                      {row.avg == null ? "—" : `${row.avg.toFixed(2)} ETB`}
                    </td>
                    <td className="px-3 py-3 text-[#616f89] dark:text-gray-400">{row.city}</td>
                    <td className="px-3 py-3 text-right text-[#616f89] dark:text-gray-400">{row.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
