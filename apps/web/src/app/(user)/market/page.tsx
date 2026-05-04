"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell, BellOff, MapPin, Minus, Plus, ShoppingBasket,
  Store, TrendingDown, TrendingUp, ArrowUpRight, Loader2, RefreshCw,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Suspense } from "react";
import { MarketTrendsChart } from "@/components/market/market-trends-chart";
import { MarketFilterBar, type SortOption } from "@/components/market/market-filter-bar";
import {
  getItems, getPriceAverages, getInflation,
  type MarketItem, type PriceAverageRow,
} from "@/services/marketService";

const PAGE_SIZE = 10;

type AlertSet = Record<number, boolean>;

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-[#616f89]">—</span>;
  if (Math.abs(pct) < 0.5)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
        <Minus className="size-3.5" /> {pct.toFixed(1)}%
      </span>
    );
  if (pct > 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
        <TrendingUp className="size-3.5" /> +{pct.toFixed(1)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
      <TrendingDown className="size-3.5" /> {pct.toFixed(1)}%
    </span>
  );
}

export default function PriceTrendsPage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [averages, setAverages] = useState<PriceAverageRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [city, setCity] = useState("All Regions");
  const [sort, setSort] = useState<SortOption>("name");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertSet>({});
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [inflation, setInflation] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cityParam = city === "All Regions" ? undefined : city;
      const [itemList, avgList] = await Promise.all([
        getItems(),
        getPriceAverages({ city: cityParam }),
      ]);
      setItems(itemList);
      setAverages(avgList);
      // Extract unique categories and cities
      const cats = Array.from(new Set(itemList.map((i) => i.category))).sort();
      const uniqueCities = Array.from(new Set(avgList.map((a) => a.city).filter(Boolean))).sort();
      setCategories(cats);
      setCities(uniqueCities);
      setSelectedItem((prev) => (prev === null && itemList.length > 0 ? itemList[0].id : prev));
      setLastUpdated(new Date());
    } catch {
      setError("Unable to load market data. Please check the API is running.");
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // Load inflation for selected item
  useEffect(() => {
    if (!selectedItem) return;
    const cityParam = city === "All Regions" ? undefined : city;
    getInflation({ item_id: selectedItem, city: cityParam, period: "month" })
      .then((r) => setInflation(r.change_percent))
      .catch(() => setInflation(null));
  }, [selectedItem, city]);

  // Augment items with average price data
  const enriched = useMemo(() => {
    const avgByItem = new Map<number, PriceAverageRow[]>();
    for (const a of averages) {
      const arr = avgByItem.get(a.item_id) ?? [];
      arr.push(a);
      avgByItem.set(a.item_id, arr);
    }
    return items.map((item) => {
      const rows = avgByItem.get(item.id) ?? [];
      const avgPrice = rows.length
        ? rows.reduce((s, r) => s + parseFloat(r.average_price), 0) / rows.length
        : null;
      const bestRow = rows.length
        ? rows.reduce((a, b) => parseFloat(a.average_price) < parseFloat(b.average_price) ? a : b)
        : null;
      return { ...item, avgPrice, bestPrice: bestRow ? parseFloat(bestRow.average_price) : null, bestCity: bestRow?.city ?? null, submissionCount: rows.reduce((s, r) => s + r.count, 0) };
    });
  }, [items, averages]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = enriched;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (category !== "All Categories") list = list.filter((i) => i.category === category);
    switch (sort) {
      case "avg_price_asc": list = [...list].sort((a, b) => (a.avgPrice ?? Infinity) - (b.avgPrice ?? Infinity)); break;
      case "avg_price_desc": list = [...list].sort((a, b) => {
        const aVal = a.avgPrice ?? -Infinity;
        const bVal = b.avgPrice ?? -Infinity;
        if (aVal === bVal) return 0;
        return bVal - aVal;
      }); break;
      case "name": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "trend": list = [...list].sort((a, b) => (b.submissionCount) - (a.submissionCount)); break;
    }
    return list;
  }, [enriched, search, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, category, city, sort]);

  const toggleAlert = (id: number) =>
    setAlerts((prev) => ({ ...prev, [id]: !prev[id] }));

  // Summary stats
  const totalItems = filtered.length;
  const avgBasketCost = averages.length
    ? (averages.reduce((s, a) => s + parseFloat(a.average_price), 0) / averages.length).toFixed(0)
    : null;
  const mostVolatile = enriched.reduce<typeof enriched[0] | null>((best, i) =>
    i.submissionCount > (best?.submissionCount ?? -1) ? i : best, null);
  const bestValue = averages.length
    ? averages.reduce((a, b) => parseFloat(a.average_price) < parseFloat(b.average_price) ? a : b)
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#111318] dark:text-white tracking-tight">
            Current Market Prices
          </h1>
          <p className="text-[#616f89] dark:text-gray-400 text-base mt-1">
            Live tracking of essential goods across Ethiopia — {totalItems} items tracked.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void fetchData()}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-[#616f89] hover:text-[#135bec] transition-colors"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 px-3 py-1.5 rounded-full border border-green-100 w-fit">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide">
              Live • {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => void fetchData()} className="underline font-medium">Retry</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          icon={<ShoppingBasket className="size-5" />}
          iconBg="bg-blue-50 dark:bg-blue-900/20 text-[#135bec]"
          label="Avg. Price / Item"
          value={avgBasketCost ? `${parseInt(avgBasketCost).toLocaleString()} ETB` : loading ? "…" : "No data"}
          badge={inflation !== null ? `${inflation > 0 ? "+" : ""}${inflation.toFixed(1)}% vs last month` : undefined}
          badgeColor={inflation !== null && inflation > 0 ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-green-600 bg-green-50 dark:bg-green-900/20"}
        />
        <SummaryCard
          icon={<TrendingUp className="size-5" />}
          iconBg="bg-orange-50 dark:bg-orange-900/20 text-orange-600"
          label="Most Submitted Item"
          value={mostVolatile?.name ?? (loading ? "…" : "—")}
          badge={mostVolatile ? `${mostVolatile.submissionCount} submissions` : undefined}
          badgeColor="text-orange-600 bg-orange-50 dark:bg-orange-900/20"
        />
        <SummaryCard
          icon={<Store className="size-5" />}
          iconBg="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
          label="Best Value Location"
          value={bestValue?.city ?? (loading ? "…" : "—")}
          badge={bestValue ? `${parseFloat(bestValue.average_price).toLocaleString()} ETB avg.` : undefined}
          badgeColor="text-gray-600 bg-gray-100 dark:bg-gray-800"
        />
      </div>

      {/* Chart */}
      <Suspense fallback={<div className="mb-8 h-40 flex items-center justify-center rounded-2xl border bg-white text-slate-500">Loading chart…</div>}>
        <MarketTrendsChart />
      </Suspense>

      {/* Filter Bar */}
      <MarketFilterBar
        search={search} onSearch={setSearch}
        category={category} onCategory={setCategory}
        city={city} onCity={setCity}
        sort={sort} onSort={setSort}
        categories={categories} cities={cities}
      />

      {/* Table */}
      <div className="bg-white dark:bg-[#1e2330] rounded-xl border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-[#616f89]">
            <Loader2 className="size-5 animate-spin" /> Loading market data…
          </div>
        )}
        {!loading && pageItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#616f89]">
            <ShoppingBasket className="size-10 opacity-30" />
            <p className="font-medium">No items match your filters.</p>
            <button onClick={() => { setSearch(""); setCategory("All Categories"); }} className="text-sm text-[#135bec] underline">Clear filters</button>
          </div>
        )}
        {!loading && pageItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#f9fafb] dark:bg-[#252b38] border-b border-[#e5e7eb] dark:border-[#2a3140]">
                  <th className="py-3.5 pl-6 pr-4 text-xs font-semibold uppercase tracking-wider text-[#616f89]">Item</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89]">Unit</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89]">Avg. Price</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#135bec]">Best Price</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89]">Best Location</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] text-center">Submissions</th>
                  <th className="py-3.5 pr-6 pl-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3140]">
                {pageItems.map((row) => (
                  <tr
                    key={row.id}
                    className={`group hover:bg-[#f0f9ff] dark:hover:bg-[#1f2937]/50 transition-colors cursor-pointer ${selectedItem === row.id ? "bg-blue-50/60 dark:bg-blue-900/10" : ""}`}
                    onClick={() => setSelectedItem(row.id)}
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#135bec]/10 to-[#135bec]/20 flex items-center justify-center shrink-0 text-[#135bec] font-bold text-sm">
                          {row.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111318] dark:text-white">{row.name}</p>
                          <span className="text-xs text-[#616f89]">{row.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#616f89]">{row.unit}</td>
                    <td className="py-4 px-4 text-sm font-medium text-[#111318] dark:text-white tabular-nums">
                      {row.avgPrice !== null ? `${row.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB` : <span className="text-[#616f89] text-xs">No data</span>}
                    </td>
                    <td className="py-4 px-4">
                      {row.bestPrice !== null ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[#135bec] text-sm font-bold tabular-nums border border-blue-100 dark:border-blue-800">
                          {row.bestPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB
                        </span>
                      ) : <span className="text-xs text-[#616f89]">—</span>}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#616f89]">
                      {row.bestCity ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0" />
                          <span>{row.bestCity}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${row.submissionCount > 0 ? "bg-[#135bec]/10 text-[#135bec]" : "bg-gray-100 text-gray-400"}`}>
                        {row.submissionCount}
                      </span>
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title={alerts[row.id] ? "Remove alert" : "Set price alert"}
                          onClick={() => toggleAlert(row.id)}
                          className={`p-2 rounded-full transition-colors ${alerts[row.id] ? "text-[#135bec] bg-blue-50 dark:bg-blue-900/20" : "text-[#616f89] hover:text-[#135bec] hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        >
                          {alerts[row.id] ? <BellOff className="size-4" /> : <Bell className="size-4" />}
                        </button>
                        <Link
                          href={`/market/submit?item_id=${row.id}`}
                          title="Submit price"
                          className="p-2 rounded-full text-[#616f89] hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          <Plus className="size-4" />
                        </Link>
                        <Link
                          href={`/market?item_id=${row.id}`}
                          title="View trend"
                          className="p-2 rounded-full text-[#616f89] hover:text-[#135bec] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-[#f9fafb] dark:bg-[#252b38] border-t border-[#e5e7eb] dark:border-[#2a3140]">
            <p className="text-sm text-[#616f89]">
              Showing <span className="font-semibold text-[#111318] dark:text-white">{(page - 1) * PAGE_SIZE + 1}</span>–
              <span className="font-semibold text-[#111318] dark:text-white">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of{" "}
              <span className="font-semibold text-[#111318] dark:text-white">{filtered.length}</span> items
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-[#135bec] text-white" : "text-[#616f89] hover:bg-[#f0f2f4] dark:hover:bg-[#374151]"}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline" size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Submit CTA */}
      <div className="mt-8 rounded-xl bg-gradient-to-r from-[#135bec] to-[#0d4fd4] p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-lg">
        <div>
          <h3 className="text-lg font-bold">Help keep prices accurate</h3>
          <p className="text-sm text-white/80 mt-1">Contribute real prices from your local market and earn contributor points.</p>
        </div>
        <Button asChild className="bg-white text-[#135bec] hover:bg-blue-50 font-bold shrink-0">
          <Link href="/market/submit">Submit a Price <ArrowUpRight className="size-4 ml-1" /></Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ icon, iconBg, label, value, badge, badgeColor }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string;
  badge?: string; badgeColor?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        {badge && <span className={`text-xs font-bold px-2 py-1 rounded ${badgeColor}`}>{badge}</span>}
      </div>
      <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-xl font-bold text-[#111318] dark:text-white mt-1 truncate">{value}</p>
    </div>
  );
}
