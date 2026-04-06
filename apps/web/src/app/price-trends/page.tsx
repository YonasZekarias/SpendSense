"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBasket,
  TrendingUp,
  Store,
  Search,
  ChevronDown,
  Filter,
  MapPin,
  TrendingDown,
  Minus,
  Bell,
  Loader2,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { TrendForecastChart } from "@/components/price-trends/trend-forecast-chart";
import {
  getForecasts,
  getInflation,
  getItems,
  getPriceTrends,
  type ForecastPoint,
  type InflationResponse,
  type MarketItem,
  type PriceTrendPoint,
} from "@/services/marketService";

const tableRows = [
  {
    name: "Teff (Magna)",
    category: "Grains & Cereals",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUI3GfQDoi8NFTedYvwRZycyrx9mwVpqm3mS34KEd6Qkuqv3qiy2FlRBZSsF7w4t48Sst874tAmBjVjxbz3tzXvebs0gOkqV0s_z-LXCIyXO08uWN4gqN-qfKWQ2blGMYhvEdAsn09k8SQKQQ46tv4mCdDJPOqtVzm97N69YAU-OpK9H07iNmJiCha8yIvKdCTyEWs5TJlecDTIuobEX-jldY4jRTmrvXzcj6gs-aSvXXdqT10YgK7BbHr-tiaN5xXSl3BBhgLJ5U",
    unit: "100 kg",
    nationalAvg: "14,500 ETB",
    bestPrice: "13,800 ETB",
    location: "Shola Market",
    trend: "down" as const,
    trendPct: "2.1%",
  },
  {
    name: "Coffee Beans (Raw)",
    category: "Beverages",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqQ6DFQTWvGUlveGe-LuWXWesDqUi1mTEhIoly4LelOs5uTfnPuGXAyDwfLdgc-_QFcREMc7YlJjU96RCbbxxRIcO-Nmm2NvFG7Ut9n9fVYy8BrxFH2qGUHqdodejEczLpkEPWtfo2BkioV_CUwO0YTcQ39Ch3AvKQoCLzap7zB_vQcmbyot_ZmohLZxkfZEsBsiI0724DDDMV-FCK0Deuzny9rnI2F3hePbJRp1Y427WgOVqODIZufwyhVAnH3ZgxD-Ran_0eai8",
    unit: "1 kg",
    nationalAvg: "480 ETB",
    bestPrice: "450 ETB",
    location: "Merkato",
    trend: "up" as const,
    trendPct: "5.3%",
  },
  {
    name: "Red Onions",
    category: "Vegetables",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAWjCobSU9-rkUNETGWL85IsxAVdFLactaZN9tIVfLgmIxFJmPAAJcpcaYtvXGNT1RedF6RBwxw2YOf6NIIlwdKocHrgOyXqUPiA7DlE01LXyk3ZazHQqcjwk6jKtn3Zy6-tU_GY-OsDaGO-BnLaOIBnYbnRPtycZrES_LKjJcYx5QBaOCZ5cmzQZGBRM4SGtWGdn-i8dYpxAFnand0_FDy1HJRV9_UkwouYfruqLSeC0-a5xiXSM_PWZ94PVw-42kF_Lmxc-MSIYs",
    unit: "1 kg",
    nationalAvg: "75 ETB",
    bestPrice: "62 ETB",
    location: "Atkilt Tera",
    trend: "flat" as const,
    trendPct: "0.0%",
  },
  {
    name: "Cooking Oil (Sunflower)",
    category: "Household",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBzaIblc4y2Atfbidmmf8m6gGuRcZtWE3mMZiXmWsJXTn7f4bXMUxnzkzxXLbkM-yEvBJPe1GcpQF1yEbT55fLnrUfGgzi9W0vSiPqunD-CyUZpMEOFsy0LqzIhJj7khWHvx_GLEvi1g2o7qlrVgplY9GUBb60G3eWG0x5iQ0Jtz3svO4YQu4J3J-_h8mWLuTinPtRytX--IKsOuJguDlSQGm3npp5vYoY2RFABNwgcBNEZYOzmh33mIGbCwkSiltn2uTycho3_COs",
    unit: "5 Liters",
    nationalAvg: "1,150 ETB",
    bestPrice: "1,080 ETB",
    location: "Alle Bejimla",
    trend: "down" as const,
    trendPct: "1.5%",
  },
  {
    name: "Berbere (Prepared)",
    category: "Spices",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAIcI8o6erv7PThZUXQvhIMRzLv7Ys2taa4rxJMUva8U2IkGBJX-2moELhyfRTLmXpVxykXeYg9ej34PqHjQHBF9pBlXPnvK7_9bSXRqPDbLMmGONbnFWs7yrN04NXe6L8jO9gAwTOupaxJrCfxBMCcvLlmHsWAnnz0h7g5DE-2mBojD5m0M6hRsPyiiGok7fZb1675kWYpBYf2xNzMiMZlZnC7DujZtLK21hJGnzvSQkNvc949q6vLKn7rDBKiHIvwaMQEluCN2c4",
    unit: "1 kg",
    nationalAvg: "650 ETB",
    bestPrice: "600 ETB",
    location: "Kera Market",
    trend: "up" as const,
    trendPct: "3.8%",
  },
];

function TrendCell({ trend, pct }: { trend: "up" | "down" | "flat"; pct: string }) {
  if (trend === "down") {
    return (
      <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-semibold">
        <TrendingDown className="size-4" />
        <span>{pct}</span>
      </div>
    );
  }
  if (trend === "up") {
    return (
      <div className="flex items-center justify-center gap-1 text-red-500 text-xs font-semibold">
        <TrendingUp className="size-4" />
        <span>{pct}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-1 text-gray-500 text-xs font-semibold">
      <Minus className="size-4" />
      <span>{pct}</span>
    </div>
  );
}

function dateRangeLastYear() {
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);
  return {
    from_date: from.toISOString().slice(0, 10),
    to_date: to.toISOString().slice(0, 10),
  };
}

export default function PriceTrendsPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MarketItem[]>([]);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [filterCity, setFilterCity] = useState("");
  const [trends, setTrends] = useState<PriceTrendPoint[]>([]);
  const [forecasts, setForecasts] = useState<ForecastPoint[]>([]);
  const [inflation, setInflation] = useState<InflationResponse | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getItems();
        if (cancelled) return;
        setItems(list);
        setItemsError(null);
        if (list.length && selectedItemId == null) {
          setSelectedItemId(list[0].id);
        }
      } catch (e) {
        if (!cancelled) {
          setItemsError(e instanceof Error ? e.message : "Could not load items.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed selection once
  }, []);

  useEffect(() => {
    if (selectedItemId == null) return;
    let cancelled = false;
    const { from_date, to_date } = dateRangeLastYear();
    const city = filterCity.trim() || undefined;
    setSeriesLoading(true);
    setSeriesError(null);
    (async () => {
      try {
        const [t, f, inf] = await Promise.all([
          getPriceTrends({ item_id: selectedItemId, city, from_date, to_date }),
          getForecasts({ item_id: selectedItemId, city, forecast_weeks: 8 }),
          getInflation({ period: "month", item_id: selectedItemId, city }),
        ]);
        if (cancelled) return;
        setTrends(t);
        setForecasts(f);
        setInflation(inf);
      } catch (e) {
        if (!cancelled) {
          setSeriesError(e instanceof Error ? e.message : "Could not load trends or forecasts.");
          setTrends([]);
          setForecasts([]);
          setInflation(null);
        }
      } finally {
        if (!cancelled) setSeriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedItemId, filterCity]);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-[#111318] dark:text-white tracking-tight">
            Current Market Prices
          </h1>
          <p className="text-[#616f89] dark:text-gray-400 text-base">
            Live tracking of essential goods and cost-of-living metrics across Ethiopia.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-900/30 w-fit">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide">
            Live Feed Active • Updated 2m ago
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1e2330] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[#135bec]">
              <ShoppingBasket className="size-5" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
              +2.4% vs last week
            </span>
          </div>
          <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">Avg. Basket Cost</p>
          <p className="text-2xl font-bold text-[#111318] dark:text-white mt-1">4,250 ETB</p>
        </div>
        <div className="bg-white dark:bg-[#1e2330] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
              <TrendingUp className="size-5" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
              High Volatility
            </span>
          </div>
          <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">Most Volatile Item</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-[#111318] dark:text-white">Red Onions</p>
            <span className="text-sm text-[#616f89] dark:text-gray-500">/ kg</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e2330] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
              <Store className="size-5" />
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              Addis Ababa
            </span>
          </div>
          <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">Best Value Vendor</p>
          <p className="text-2xl font-bold text-[#111318] dark:text-white mt-1">Merkato Zone 3</p>
        </div>
      </div>

      {/* Trends & forecast (API + Recharts) */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[#e5e7eb] dark:border-[#2a3140] bg-white dark:bg-[#1e2330] p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111318] dark:text-white">Price trend & forecast</h2>
              <p className="text-sm text-[#616f89] dark:text-gray-400">
                Daily averages from approved submissions; dashed line is the forecast from the API.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-[#616f89] dark:text-gray-400">
                Item
                <select
                  className="h-10 min-w-[200px] rounded-lg border-none bg-[#f0f2f4] dark:bg-[#2a3140] px-3 text-sm font-medium text-[#111318] dark:text-white focus:ring-2 focus:ring-[#135bec]"
                  value={selectedItemId ?? ""}
                  onChange={(e) => setSelectedItemId(e.target.value ? Number(e.target.value) : null)}
                  disabled={!items.length}
                >
                  {!items.length && <option value="">No items</option>}
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[#616f89] dark:text-gray-400">
                City (optional)
                <input
                  type="text"
                  placeholder="e.g. Addis Ababa"
                  className="h-10 w-44 rounded-lg border-none bg-[#f0f2f4] dark:bg-[#2a3140] px-3 text-sm text-[#111318] dark:text-white placeholder:text-[#616f89] focus:ring-2 focus:ring-[#135bec]"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                />
              </label>
            </div>
          </div>
          {itemsError && (
            <p className="mb-3 text-sm text-red-600 dark:text-red-400">{itemsError}</p>
          )}
          {seriesError && (
            <p className="mb-3 text-sm text-red-600 dark:text-red-400">{seriesError}</p>
          )}
          {seriesLoading ? (
            <div className="flex h-[320px] items-center justify-center gap-2 text-[#616f89] dark:text-gray-400">
              <Loader2 className="size-6 animate-spin" />
              <span className="text-sm">Loading chart data…</span>
            </div>
          ) : (
            <TrendForecastChart
              trends={trends}
              forecasts={forecasts}
              emptyMessage={
                selectedItem
                  ? `No submissions in the last year for “${selectedItem.name}”. Try another item or clear the city filter.`
                  : "Select an item to see trends."
              }
            />
          )}
          {forecasts[0]?.model_used && (
            <p className="mt-2 text-xs text-[#616f89] dark:text-gray-500">
              Model: <span className="font-medium">{forecasts[0].model_used}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[#e5e7eb] dark:border-[#2a3140] bg-white dark:bg-[#1e2330] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#111318] dark:text-white">Month-over-month</h3>
            <p className="mt-1 text-xs text-[#616f89] dark:text-gray-400">
              From <code className="rounded bg-[#f0f2f4] dark:bg-[#2a3140] px-1">/api/market/inflation/</code> for the selected item.
            </p>
            {inflation?.change_percent != null ? (
              <div className="mt-4">
                <p
                  className={`text-3xl font-black tabular-nums ${
                    inflation.change_percent > 0
                      ? "text-red-600 dark:text-red-400"
                      : inflation.change_percent < 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-[#111318] dark:text-white"
                  }`}
                >
                  {inflation.change_percent > 0 ? "+" : ""}
                  {inflation.change_percent}%
                </p>
                <p className="mt-2 text-xs text-[#616f89] dark:text-gray-400">
                  Current avg: {inflation.current_avg ?? "—"} ETB · Prior: {inflation.previous_avg ?? "—"} ETB
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#616f89] dark:text-gray-400">
                Not enough data for this item in the last two months.
              </p>
            )}
          </div>
          <div className="rounded-xl border border-[#e5e7eb] dark:border-[#2a3140] bg-white dark:bg-[#1e2330] p-5 shadow-sm flex-1 min-h-0">
            <h3 className="text-sm font-semibold text-[#111318] dark:text-white">Forecast rows</h3>
            <ul className="mt-3 max-h-[200px] space-y-2 overflow-y-auto text-sm">
              {forecasts.length === 0 && !seriesLoading && (
                <li className="text-[#616f89] dark:text-gray-400">No forecast rows returned.</li>
              )}
              {forecasts.map((f) => (
                <li
                  key={f.forecast_date}
                  className="flex justify-between gap-2 border-b border-[#f0f2f4] dark:border-[#2a3140] pb-2 last:border-0"
                >
                  <span className="text-[#616f89] dark:text-gray-400">
                    {new Date(f.forecast_date).toLocaleDateString()}
                  </span>
                  <span className="font-medium tabular-nums text-[#111318] dark:text-white">
                    {Number(f.predicted_price).toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-white dark:bg-[#1e2330] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#616f89]">
              <Search className="size-5" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-[#f0f2f4] dark:bg-[#2a3140] text-[#111318] dark:text-white placeholder:text-[#616f89] focus:ring-2 focus:ring-[#135bec] focus:bg-white dark:focus:bg-[#1e2330] transition-all text-sm"
              placeholder="Search items (e.g. Teff, Coffee, Onions)..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <select className="appearance-none h-10 pl-4 pr-10 rounded-lg bg-[#f0f2f4] dark:bg-[#2a3140] border-none text-sm font-medium text-[#111318] dark:text-white focus:ring-2 focus:ring-[#135bec] cursor-pointer">
              <option>Category: All</option>
              <option>Grains &amp; Cereals</option>
              <option>Vegetables</option>
              <option>Household</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#616f89]">
              <ChevronDown className="size-4" />
            </div>
          </div>
          <div className="relative">
            <select className="appearance-none h-10 pl-4 pr-10 rounded-lg bg-[#f0f2f4] dark:bg-[#2a3140] border-none text-sm font-medium text-[#111318] dark:text-white focus:ring-2 focus:ring-[#135bec] cursor-pointer">
              <option>Region: Addis Ababa</option>
              <option>Dire Dawa</option>
              <option>Bahir Dar</option>
              <option>Hawassa</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#616f89]">
              <ChevronDown className="size-4" />
            </div>
          </div>
          <div className="relative">
            <select className="appearance-none h-10 pl-4 pr-10 rounded-lg bg-[#f0f2f4] dark:bg-[#2a3140] border-none text-sm font-medium text-[#111318] dark:text-white focus:ring-2 focus:ring-[#135bec] cursor-pointer">
              <option>Sort by: Popularity</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Volatility</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#616f89]">
              <ChevronDown className="size-4" />
            </div>
          </div>
          <button
            type="button"
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#f0f2f4] dark:bg-[#2a3140] text-[#616f89] hover:bg-[#e2e4e8] dark:hover:bg-[#374151] transition-colors"
            aria-label="More filters"
          >
            <Filter className="size-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1e2330] rounded-xl border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#f9fafb] dark:bg-[#252b38] border-b border-[#e5e7eb] dark:border-[#2a3140]">
                <th className="py-4 pl-6 pr-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] dark:text-gray-400 w-[250px]">
                  Item Name
                </th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] dark:text-gray-400">
                  Unit
                </th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] dark:text-gray-400">
                  National Avg.
                </th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-[#135bec]">
                  Best Price
                </th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] dark:text-gray-400">
                  Location
                </th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] dark:text-gray-400 text-center">
                  Trend (7d)
                </th>
                <th className="py-4 pr-6 pl-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] dark:text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3140]">
              {tableRows
                .filter(
                  (row) =>
                    search.trim() === "" ||
                    row.name.toLowerCase().includes(search.toLowerCase()) ||
                    row.category.toLowerCase().includes(search.toLowerCase())
                )
                .map((row) => (
                  <tr
                    key={row.name}
                    className="group hover:bg-[#f0f9ff] dark:hover:bg-[#1f2937]/50 transition-colors"
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={row.image}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111318] dark:text-white">{row.name}</p>
                          <span className="text-xs text-[#616f89] dark:text-gray-400">{row.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#111318] dark:text-gray-300">{row.unit}</td>
                    <td className="py-4 px-4 text-sm font-medium text-[#111318] dark:text-white tabular-nums">
                      {row.nationalAvg}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[#135bec] dark:text-blue-300 text-sm font-bold tabular-nums border border-blue-100 dark:border-blue-800">
                        {row.bestPrice}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#616f89] dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-4 shrink-0" />
                        <span>{row.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <TrendCell trend={row.trend} pct={row.trendPct} />
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <button
                        type="button"
                        className="text-[#616f89] hover:text-[#135bec] transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Set price alert"
                      >
                        <Bell className="size-5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-[#f9fafb] dark:bg-[#252b38] border-t border-[#e5e7eb] dark:border-[#2a3140]">
          <p className="text-sm text-[#616f89] dark:text-gray-400">
            Showing{" "}
            <span className="font-medium text-[#111318] dark:text-white">1</span> to{" "}
            <span className="font-medium text-[#111318] dark:text-white">5</span> of{" "}
            <span className="font-medium text-[#111318] dark:text-white">128</span> results
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3140] bg-white dark:bg-[#1e2330] text-sm text-[#616f89] dark:text-gray-300 hover:bg-[#f0f2f4] dark:hover:bg-[#374151] disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3140] bg-white dark:bg-[#1e2330] text-sm text-[#616f89] dark:text-gray-300 hover:bg-[#f0f2f4] dark:hover:bg-[#374151]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
