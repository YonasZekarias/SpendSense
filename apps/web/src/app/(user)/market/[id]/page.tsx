"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Plus, 
  Calendar,
  ShoppingBasket,
  ChevronRight,
  Info,
  AlertCircle,
  RefreshCw,
  Target
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { 
  fetchMarketItem, 
  fetchPriceTrends, 
  fetchMarketForecasts, 
  fetchInflationData,
  fetchPriceAverages,
  type MarketItem,
  type PriceAverageRow,
  type TrendPoint,
  type ForecastPoint
} from "@/services/marketService";
import { MarketTrendsChart } from "@/components/market/market-trends-chart";

export default function MarketItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = Number.parseInt(String(params.id), 10);
  
  const [item, setItem] = useState<MarketItem | null>(null);
  const [averages, setAverages] = useState<PriceAverageRow[]>([]);
  const [inflation, setInflation] = useState<{ change_percent: number | null; current_avg: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!Number.isFinite(itemId)) {
      setError("Invalid product ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [itemData, avgData, inflData] = await Promise.all([
        fetchMarketItem(itemId),
        fetchPriceAverages({ item_id: itemId }),
        fetchInflationData({ item_id: itemId, period: "month" })
      ]);
      
      setItem(itemData);
      setAverages(avgData);
      setInflation(inflData);
    } catch (err) {
      setError("We couldn't find the requested market item. It may have been removed or the ID is incorrect.");
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const nationalAvg = useMemo(() => {
    if (averages.length === 0) return null;
    return averages.reduce((acc, curr) => acc + parseFloat(curr.average_price), 0) / averages.length;
  }, [averages]);

  const bestCity = useMemo(() => {
    if (averages.length === 0) return null;
    return averages.reduce((prev, curr) => 
      parseFloat(curr.average_price) < parseFloat(prev.average_price) ? curr : prev
    );
  }, [averages]);

  if (loading) return <MarketItemDetailSkeleton />;

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <AlertCircle className="size-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Item Not Found</h1>
        <p className="text-slate-600 mt-2 max-w-md mx-auto">{error ?? "The item you are looking for does not exist in our database."}</p>
        <Button variant="outline" className="mt-8" onClick={() => router.push("/market")}>
          Back to Market Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <nav className="flex items-center gap-2 text-sm font-medium text-[#616f89]">
          <Link href="/market" className="hover:text-[#135bec] transition-colors">Market</Link>
          <ChevronRight size={14} />
          <span className="text-[#111318] dark:text-white font-bold">{item.name}</span>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => void fetchData()} className="h-9">
            <RefreshCw className="size-3.5 mr-1.5" /> Refresh
          </Button>
          <Button asChild size="sm" className="bg-[#135bec] font-bold h-9">
            <Link href={`/market/submit?item_id=${item.id}`}>
              <Plus className="size-4 mr-1.5" /> Submit Price
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#135bec] to-[#0047cc] p-8 md:p-12 mb-8 text-white shadow-xl shadow-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-4">
              <ShoppingBasket className="size-3.5" /> {item.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              {item.name}
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              Standardized unit: <span className="text-white font-bold">{item.unit}</span>
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">National Average</p>
              <p className="text-4xl md:text-5xl font-black tabular-nums">
                {nationalAvg ? `${nationalAvg.toLocaleString(undefined, { maximumFractionDigits: 1 })}` : "—"}
                <span className="text-xl ml-1 opacity-80">ETB</span>
              </p>
            </div>
            {inflation?.change_percent !== null && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                inflation!.change_percent! > 0 ? "bg-red-500/20 text-red-100" : "bg-green-500/20 text-green-100"
              }`}>
                {inflation!.change_percent! > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(inflation!.change_percent!).toFixed(1)}% vs last month
              </div>
            )}
          </div>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Best Price Found" 
          value={bestCity ? `${parseFloat(bestCity.average_price).toLocaleString()} ETB` : "—"}
          subValue={bestCity ? `In ${bestCity.city}` : "No data yet"}
          icon={<Target className="text-[#135bec]" />}
        />
        <StatCard 
          label="Price Volatility" 
          value="Medium" 
          subValue="Based on last 30 days"
          icon={<TrendingUp className="text-orange-500" />}
        />
        <StatCard 
          label="Total Submissions" 
          value={averages.reduce((s, a) => s + a.count, 0).toLocaleString()} 
          subValue="Active contributors"
          icon={<RefreshCw className="text-green-500" />}
        />
        <StatCard 
          label="Market Coverage" 
          value={averages.length.toString()} 
          subValue="Cities reporting prices"
          icon={<MapPin className="text-purple-500" />}
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart Column */}
        <div className="lg:col-span-8">
          <MarketTrendsChart />
        </div>

        {/* City Breakdown Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-6 flex items-center gap-2">
              <MapPin className="size-5 text-[#135bec]" /> Regional Prices
            </h3>
            <div className="space-y-4">
              {averages.length > 0 ? (
                averages.map((row) => (
                  <div key={row.city} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{row.city}</p>
                      <p className="text-[10px] font-bold text-[#616f89] uppercase tracking-tighter">
                        {row.count} reports
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#111318] dark:text-white tabular-nums">
                        {parseFloat(row.average_price).toLocaleString()} ETB
                      </p>
                      <p className={`text-[10px] font-bold ${
                        nationalAvg && parseFloat(row.average_price) < nationalAvg ? "text-green-600" : "text-[#616f89]"
                      }`}>
                        {nationalAvg 
                          ? `${parseFloat(row.average_price) < nationalAvg ? "-" : "+"}${Math.abs(((parseFloat(row.average_price) - nationalAvg) / nationalAvg) * 100).toFixed(0)}% avg.`
                          : "Regional avg."
                        }
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-500 italic">No regional data available yet.</p>
                </div>
              )}
            </div>
            
            <Button variant="outline" className="w-full mt-6 text-xs font-bold h-9 bg-slate-50 border-slate-200" onClick={() => router.push("/market")}>
              View All Regions
            </Button>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 p-6">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
              <Info className="size-4" /> Market Intelligence
            </h4>
            <p className="text-xs text-blue-800/70 dark:text-blue-200/60 leading-relaxed">
              Prices are calculated based on user-submitted data. We use machine learning to filter outliers and provide the most accurate real-time market averages across Ethiopia.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string; value: string; subValue: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-2xl p-6 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm hover:border-[#135bec]/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-[#616f89] dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-[#111318] dark:text-white mt-1 tabular-nums">{value}</p>
      <p className="text-[10px] font-bold text-[#616f89] mt-1">{subValue}</p>
    </div>
  );
}

function MarketItemDetailSkeleton() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-48 md:h-64 w-full rounded-3xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="lg:col-span-8 h-80 rounded-2xl" />
        <Skeleton className="lg:col-span-4 h-80 rounded-2xl" />
      </div>
    </div>
  );
}
