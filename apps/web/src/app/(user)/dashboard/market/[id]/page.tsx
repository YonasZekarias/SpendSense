"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Bell,
    BellRing,
    CheckSquare,
    ChevronRight,
    Clock,
    Home,
    LineChart,
    MapPin,
    Search,
    Share2,
    ShoppingCart,
    TrendingUp
} from "lucide-react";
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

// Monorepo Imports
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui/components/table";

function dateRangeLastMonths(months: number) {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  return {
    from_date: from.toISOString().slice(0, 10),
    to_date: to.toISOString().slice(0, 10),
  };
}

function formatEtb(value?: number | string | null) {
  if (value == null || value === "") return "—";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "—";
  return `${parsed.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB`;
}

export default function ItemDetailsPage() {
  const params = useParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const itemId = Number(rawId);
  const validItemId = Number.isFinite(itemId) ? itemId : null;

  const [items, setItems] = useState<MarketItem[]>([]);
  const [trends, setTrends] = useState<PriceTrendPoint[]>([]);
  const [forecasts, setForecasts] = useState<ForecastPoint[]>([]);
  const [inflation, setInflation] = useState<InflationResponse | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [seriesError, setSeriesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getItems();
        if (cancelled) return;
        setItems(list);
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!validItemId) {
      setSeriesLoading(false);
      setSeriesError("Invalid item id in URL.");
      return;
    }
    let cancelled = false;
    const { from_date, to_date } = dateRangeLastMonths(6);
    setSeriesLoading(true);
    setSeriesError(null);
    (async () => {
      try {
        const [trendRows, forecastRows, inflationRow] = await Promise.all([
          getPriceTrends({
            item_id: validItemId,
            from_date,
            to_date,
          }),
          getForecasts({
            item_id: validItemId,
            forecast_weeks: 8,
          }),
          getInflation({ period: "month", item_id: validItemId }),
        ]);
        if (cancelled) return;
        setTrends(trendRows);
        setForecasts(forecastRows);
        setInflation(inflationRow);
      } catch (error) {
        if (cancelled) return;
        setSeriesError(error instanceof Error ? error.message : "Could not load trend data.");
        setTrends([]);
        setForecasts([]);
        setInflation(null);
      } finally {
        if (!cancelled) setSeriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [validItemId]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === validItemId) ?? null,
    [items, validItemId]
  );

  const currentAvg = inflation?.current_avg ?? trends[trends.length - 1]?.average_price ?? null;
  const predictedInflationText =
    inflation?.change_percent == null
      ? "—"
      : `${inflation.change_percent > 0 ? "+" : ""}${inflation.change_percent}%`;

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622] font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 px-4 lg:px-10 py-3 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#135bec]/10 text-[#135bec]">
              <ShoppingCart size={24} strokeWidth={2.5} />
            </div>
            <h2 className="hidden md:block text-xl font-black tracking-tight">SmartShopper ET</h2>
          </div>

          <div className="flex-1 max-w-xl px-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <Input 
                className="pl-10 bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-[#135bec]" 
                placeholder="Search for items, markets, or categories..." 
              />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <nav className="hidden lg:flex items-center gap-6">
              <Button variant="ghost" className="text-sm font-medium text-slate-500">Dashboard</Button>
              <Button variant="ghost" className="text-sm font-bold text-[#135bec]">Market</Button>
              <Button variant="ghost" className="text-sm font-medium text-slate-500">Community</Button>
            </nav>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="icon" className="relative text-slate-500">
                <Bell size={20} />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1e293b]"></span>
              </Button>
              <div className="size-9 rounded-full bg-slate-200 ring-2 ring-slate-100 dark:ring-slate-700 overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yonas" alt="User" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 lg:px-10 py-6 lg:py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
          <Home size={16} /> <ChevronRight size={14} /> Groceries <ChevronRight size={14} /> Staples <ChevronRight size={14} /> 
          <span className="text-slate-900 dark:text-white font-bold">{selectedItem?.name ?? "Item detail"}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Product Header */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-40 h-40 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 relative group overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      alt="Teff" 
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white border-none font-bold">Grade A</Badge>
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-black tracking-tight">{selectedItem?.name ?? "Market Item"}</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                          Category: {selectedItem?.category ?? "Staple Foods"} • Unit: {selectedItem?.unit ?? "kg"}
                        </p>
                      </div>
                      <Button variant="outline" size="icon" className="rounded-full h-9 w-9"><Share2 size={16} /></Button>
                    </div>
                    <div className="flex flex-wrap items-end gap-6 mt-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Average Price</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-[#135bec]">{formatEtb(currentAvg)}</span>
                          <span className="text-lg text-slate-500 font-bold">/ {selectedItem?.unit ?? "unit"}</span>
                        </div>
                      </div>
                      <Badge className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-none font-bold px-3 py-1.5 gap-1">
                        <TrendingUp size={14} /> +2.5% vs last week
                      </Badge>
                      <div className="ml-auto text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                        <Clock size={12} /> Updated 2 hours ago
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <QuickStat
                title="Lowest Found"
                value={trends.length ? formatEtb(Math.min(...trends.map((row) => Number(row.average_price)))) : "—"}
                sub="From recent trend points"
                type="positive"
                icon={<ArrowDown size={18}/>}
              />
              <QuickStat
                title="Highest Found"
                value={trends.length ? formatEtb(Math.max(...trends.map((row) => Number(row.average_price)))) : "—"}
                sub="From recent trend points"
                type="negative"
                icon={<ArrowUp size={18}/>}
              />
              <QuickStat
                title="Predicted Inflation"
                value={predictedInflationText}
                sub="Month-over-month (API)"
                type="neutral"
                icon={<LineChart size={18}/>}
              />
            </div>

            {/* Price Chart */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Price History & Forecast</CardTitle>
                  <p className="text-sm text-slate-500">Historical trend with model forecast</p>
                </div>
              </CardHeader>
              <CardContent>
                {seriesError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{seriesError}</p>}
                {seriesLoading ? (
                  <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
                    Loading trend data...
                  </div>
                ) : (
                  <TrendForecastChart
                    trends={trends}
                    forecasts={forecasts}
                    emptyMessage="No trend or forecast rows were returned for this item."
                  />
                )}
                {forecasts[0]?.model_used && (
                  <p className="mt-2 text-xs text-slate-500">Forecast model: {forecasts[0].model_used}</p>
                )}
              </CardContent>
            </Card>

            {/* Vendor Table */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <CardTitle className="text-lg font-bold">Vendor Comparison</CardTitle>
                <Button variant="link" className="text-[#135bec] font-bold text-sm p-0 h-auto">View Map</Button>
              </div>
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead className="pl-6 uppercase text-[10px] font-bold">Vendor</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold">Location</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold">Price / kg</TableHead>
                    <TableHead className="text-center uppercase text-[10px] font-bold">Trend</TableHead>
                    <TableHead className="pr-6 text-right uppercase text-[10px] font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <VendorRow name="Shola Market Stall #42" loc="Yeka District" price="110 ETB" trend="-2%" trendType="down" />
                  <VendorRow name="Alem Bunna & Grain" loc="Bole District" price="122 ETB" trend="Stable" trendType="flat" />
                  <VendorRow name="Mercato Bulk Store" loc="Addis Ketema" price="118 ETB" trend="+1%" trendType="up" />
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Price Alert Card */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#135bec]/10 rounded-lg text-[#135bec]">
                  <BellRing size={20} />
                </div>
                <CardTitle className="text-lg font-bold tracking-tight">Price Alert</CardTitle>
              </div>
              <p className="text-sm text-slate-500 mb-4 font-medium">Notify me when the price of White Teff drops below my target.</p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Price (ETB)</label>
                  <div className="relative">
                    <Input className="bg-slate-50 dark:bg-slate-800 border-none h-11 pr-12 font-bold" placeholder="115" type="number" />
                    <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">ETB</span>
                  </div>
                </div>
                <Button className="w-full bg-[#135bec] hover:bg-blue-700 text-white font-bold h-11 shadow-lg shadow-blue-500/20">Set Alert</Button>
              </div>
            </Card>

            {/* Shopping List Promo */}
            <div className="bg-[#135bec]/5 dark:bg-slate-800/50 rounded-2xl p-6 border-2 border-dashed border-[#135bec]/20 text-center">
              <div className="size-12 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-[#135bec] mx-auto mb-4">
                <CheckSquare size={24} />
              </div>
              <h3 className="font-black text-lg tracking-tight">Bulk Purchase?</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6 font-medium leading-relaxed">Add this to your monthly shopping list to track total costs.</p>
              <Button variant="outline" className="w-full bg-white dark:bg-slate-800 font-bold border-slate-200 dark:border-slate-600">Add to List</Button>
            </div>

            {/* Similar Items */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm p-6">
              <CardTitle className="text-lg font-bold mb-6">Similar Items</CardTitle>
              <div className="space-y-5">
                <SimilarItem name="Red Teff (Sergegna)" price="105 ETB" trend="-1.2%" trendType="down" />
                <SimilarItem name="Wheat (Imported)" price="85 ETB" trend="+0.5%" trendType="up" />
                <SimilarItem name="Maize (White)" price="60 ETB" trend="0.0%" trendType="flat" />
              </div>
              <Button variant="link" className="w-full mt-6 text-[#135bec] font-bold gap-2">
                View Category <ArrowRight size={16} />
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function QuickStat({ title, value, sub, type, icon }: any) {
  const colors = {
    positive: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    negative: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    neutral: "bg-blue-50 text-[#135bec] dark:bg-[#135bec]/10"
  };

  return (
    <Card className="p-5 border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={`p-1.5 rounded-lg ${colors[type as keyof typeof colors]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-1">{sub}</p>
    </Card>
  );
}

function VendorRow({ name, loc, price, trend, trendType }: any) {
  return (
    <TableRow className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <TableCell className="pl-6 font-bold text-sm">{name}</TableCell>
      <TableCell className="text-slate-500 font-medium text-xs">{loc}</TableCell>
      <TableCell className="font-mono font-bold text-sm text-[#135bec]">{price}</TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className={`border-none font-bold text-[10px] ${
          trendType === 'down' ? 'text-green-600 bg-green-50' : trendType === 'up' ? 'text-red-600 bg-red-50' : 'text-slate-400'
        }`}>
          {trend}
        </Badge>
      </TableCell>
      <TableCell className="pr-6 text-right">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#135bec]"><MapPin size={16} /></Button>
      </TableCell>
    </TableRow>
  );
}

function SimilarItem({ name, price, trend, trendType }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
      <div className="flex-1">
        <h4 className="text-sm font-bold group-hover:text-[#135bec] transition-colors tracking-tight">{name}</h4>
        <p className="text-xs text-slate-500 font-bold mt-0.5">{price} / kg</p>
      </div>
      <span className={`text-[10px] font-black ${trendType === 'down' ? 'text-green-600' : 'text-red-500'}`}>{trend}</span>
    </div>
  );
}