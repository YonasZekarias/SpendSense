"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  Bell,
  CircleHelp,
  LayoutDashboard,
  Loader2,
  PieChart,
  Settings,
  ShoppingBasket,
  TrendingUp,
} from "lucide-react";
import { TrendForecastChart } from "@/components/price-trends/trend-forecast-chart";
import {
  getForecasts,
  getItems,
  getPriceTrends,
  type ForecastPoint,
  type MarketItem,
  type PriceTrendPoint,
} from "@/services/marketService";

function dateRangeLastMonths(months: number) {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  return {
    from_date: from.toISOString().slice(0, 10),
    to_date: to.toISOString().slice(0, 10),
  };
}

export default function UsersPage() {
  const { status, user, signOut } = useAuth();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [cityFilter, setCityFilter] = useState("");
  const [trends, setTrends] = useState<PriceTrendPoint[]>([]);
  const [forecasts, setForecasts] = useState<ForecastPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getItems();
        if (cancelled) return;
        setItems(list);
        if (list.length > 0) {
          setSelectedItemId((current) => current ?? list[0].id);
        }
      } catch (error) {
        if (!cancelled) {
          setChartError(error instanceof Error ? error.message : "Could not load items.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedItemId) return;
    let cancelled = false;
    const { from_date, to_date } = dateRangeLastMonths(6);
    const city = cityFilter.trim() || undefined;

    setChartLoading(true);
    setChartError(null);

    (async () => {
      try {
        const [trendRows, forecastRows] = await Promise.all([
          getPriceTrends({
            item_id: selectedItemId,
            city,
            from_date,
            to_date,
          }),
          getForecasts({
            item_id: selectedItemId,
            city,
            forecast_weeks: 6,
          }),
        ]);
        if (cancelled) return;
        setTrends(trendRows);
        setForecasts(forecastRows);
      } catch (error) {
        if (cancelled) return;
        setChartError(error instanceof Error ? error.message : "Could not load trend data.");
        setTrends([]);
        setForecasts([]);
      } finally {
        if (!cancelled) {
          setChartLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cityFilter, selectedItemId]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId]
  );

  if (status === "loading") {
    return <main className="p-6">Loading your profile...</main>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-360 items-center justify-between px-6 py-3 md:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
              <ShoppingBasket className="size-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">SpendSense Ethiopia</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Help">
              <CircleHelp className="size-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Notifications">
              <Bell className="size-4" />
            </Button>
            <Button asChild>
              <Link href="/live-prices">Market</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-360 px-6 py-8 md:px-10 lg:px-16">
        <aside className="hidden w-64 shrink-0 flex-col justify-between rounded-xl border border-border/60 bg-background p-4 lg:flex">
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg p-2">
              <div className="size-10 rounded-full bg-muted" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.full_name ?? "User"}</p>
                <p className="truncate text-xs text-muted-foreground">Ethiopia</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1 text-sm">
              <Link className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5 font-medium" href="/dashboard">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground" href="/dashboard/budget">
                <PieChart className="size-4" />
                Budget
              </Link>
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground" href="/live-prices">
                <TrendingUp className="size-4" />
                Price Trends
              </Link>
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground" href="#">
                <Settings className="size-4" />
                Settings
              </Link>
            </nav>
          </div>

          <div className="space-y-3 border-t border-border/60 pt-4">
            <Button variant="outline" onClick={signOut} className="w-full justify-start">
              Log Out
            </Button>
            <p className="text-xs text-muted-foreground">Role: {user?.role ?? "user"}</p>
          </div>
        </aside>

        <main className="w-full flex-1 lg:pl-8">
          <div className="mx-auto flex w-full max-w-350 flex-col gap-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Good morning, {user?.full_name?.split(" ")?.[0] ?? "Abebe"}
                </h2>
                <p className="text-muted-foreground">Here is your financial overview for today.</p>
              </div>
              <Button asChild>
                <Link href="/dashboard/budget">Add Expense</Link>
              </Button>
            </header>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Total Monthly Spending</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-bold tracking-tight">4,500 ETB</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    ↑ 12%
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Estimated Savings</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-bold tracking-tight">1,200 ETB</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    ↑ 5%
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-bold tracking-tight">150 ETB</p>
                  <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                    ↓ 2%
                  </span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold">Monthly Budget Usage</h3>
                      <p className="text-sm text-muted-foreground">Food, Housing &amp; Transport</p>
                    </div>
                    <span className="text-lg font-bold">65%</span>
                  </div>
                  <div className="mt-4 h-3 w-full rounded-full bg-muted">
                    <div className="h-3 w-[65%] rounded-full bg-primary" />
                  </div>
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">4,500 ETB Spent</span>
                    <span className="font-semibold">8,000 ETB Remaining</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold">Staple Food Price Index</h3>
                      <p className="text-sm text-muted-foreground">
                        Historical trends and forecast data from the market API
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                      Item
                      <select
                        className="h-9 rounded-lg bg-muted px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40"
                        value={selectedItemId ?? ""}
                        onChange={(event) =>
                          setSelectedItemId(event.target.value ? Number(event.target.value) : null)
                        }
                        disabled={items.length === 0}
                      >
                        {items.length === 0 && <option value="">No items available</option>}
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                      City (optional)
                      <input
                        className="h-9 rounded-lg bg-muted px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40"
                        value={cityFilter}
                        onChange={(event) => setCityFilter(event.target.value)}
                        placeholder="Add city filter"
                      />
                    </label>
                  </div>

                  <div className="mt-5 min-h-56">
                    {chartError && <p className="mb-3 text-sm text-rose-600">{chartError}</p>}
                    {chartLoading ? (
                      <div className="flex h-[320px] items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin" />
                        <span className="text-sm">Loading trend chart...</span>
                      </div>
                    ) : (
                      <TrendForecastChart
                        trends={trends}
                        forecasts={forecasts}
                        emptyMessage={
                          selectedItem
                            ? `No trend data yet for ${selectedItem.name}.`
                            : "Select an item to view price trends."
                        }
                      />
                    )}
                    {forecasts[0]?.model_used && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Forecast model: <span className="font-medium">{forecasts[0].model_used}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-base font-bold">Real-time Alerts</h3>
                  <button className="text-sm font-medium text-primary hover:underline" type="button">
                    Mark all read
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                      <TrendingUp className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Price Hike: Teff</p>
                      <p className="text-sm text-muted-foreground">Teff prices have risen by 5% in Addis Ababa markets today.</p>
                      <p className="mt-1 text-xs text-muted-foreground">Just now</p>
                    </div>
                    <span className="mt-2 size-2 rounded-full bg-primary" />
                  </div>

                  <hr className="border-border/60" />

                  <div className="flex gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <ShoppingBasket className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Sale Detected: Cooking Oil</p>
                      <p className="text-sm text-muted-foreground">5L Cooking Oil dropped to 850 ETB at Shoa Supermarket.</p>
                      <p className="mt-1 text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <span className="mt-2 size-2 rounded-full bg-primary" />
                  </div>

                  <hr className="border-border/60" />

                  <div className="flex gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bell className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Budget Limit Approaching</p>
                      <p className="text-sm text-muted-foreground">You have used 65% of your monthly budget.</p>
                      <p className="mt-1 text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
