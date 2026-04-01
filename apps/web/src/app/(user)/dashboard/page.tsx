"use client";

import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  Bell,
  CircleHelp,
  LayoutDashboard,
  PieChart,
  Settings,
  ShoppingBasket,
  TrendingUp,
} from "lucide-react";

export default function UsersPage() {
  const { status, user, signOut } = useAuth();

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
                      <p className="text-sm text-muted-foreground">Tracking Teff, Oil, and Coffee prices</p>
                    </div>
                    <select className="h-9 rounded-lg bg-muted px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40">
                      <option>Last 30 Days</option>
                      <option>Last 3 Months</option>
                      <option>Last Year</option>
                    </select>
                  </div>

                  <div className="mt-6 min-h-56">
                    <svg className="h-56 w-full" viewBox="0 0 478 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 109 C18 109 18 21 36 21 C54 21 54 41 72 41 C90 41 90 93 108 93 C127 93 127 33 145 33 C163 33 163 101 181 101 C199 101 199 61 217 61 C236 61 236 45 254 45 C272 45 272 121 290 121 C308 121 308 149 326 149 C344 149 344 1 363 1 C381 1 381 81 399 81 C417 81 417 129 435 129 C453 129 453 25 472 25 V 150 H 0 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M0 109 C18 109 18 21 36 21 C54 21 54 41 72 41 C90 41 90 93 108 93 C127 93 127 33 145 33 C163 33 163 101 181 101 C199 101 199 61 217 61 C236 61 236 45 254 45 C272 45 272 121 290 121 C308 121 308 149 326 149 C344 149 344 1 363 1 C381 1 381 81 399 81 C417 81 417 129 435 129 C453 129 453 25 472 25"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4 flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <span>Week 1</span>
                      <span>Week 2</span>
                      <span>Week 3</span>
                      <span>Week 4</span>
                    </div>
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
