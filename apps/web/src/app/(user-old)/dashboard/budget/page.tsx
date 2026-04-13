"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@repo/ui/components/button";
import {
  Calendar,
  Home,
  PieChart,
  Settings,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";

export default function BudgetManagementPage() {
  const { status, user, signOut } = useAuth();

  if (status === "loading") {
    return <main className="p-6">Loading…</main>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-360 items-center justify-between px-6 py-3 md:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
              <Wallet className="size-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">SpendSense Ethiopia</h1>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <Link className="text-sm font-medium text-muted-foreground hover:text-primary" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-bold text-primary" href="/dashboard/budget">
              Budget
            </Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-primary" href="/live-prices">
              Smart Shopping
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button> Add Expense</Button>
            <Button variant="outline" onClick={signOut}>
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-360 gap-8 px-6 py-8 md:px-10 lg:px-16">
        <aside className="hidden w-64 shrink-0 flex-col gap-6 rounded-xl border border-border/60 bg-background p-4 lg:flex">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <div className="size-12 rounded-full bg-muted" />
            <div>
              <p className="text-sm font-semibold">{user?.full_name ?? "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.role ?? "user"}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 text-sm">
            <Link className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/60" href="/dashboard">
              <Home className="size-4 text-muted-foreground" />
              Overview
            </Link>
            <Link className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 font-medium text-primary" href="/dashboard/budget">
              <PieChart className="size-4" />
              My Budgets
            </Link>
            <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground" href="/live-prices">
              <TrendingUp className="size-4" />
              Price Trends
            </Link>
            <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground" href="#">
              <Settings className="size-4" />
              Settings
            </Link>
          </nav>

          <div className="mt-auto rounded-xl bg-muted/40 p-4">
            <p className="text-sm font-bold text-primary">Smart Tip</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Teff prices have dropped by 5% in local markets this week. Great time to stock up!
            </p>
          </div>
        </aside>

        <main className="w-full flex-1 space-y-6">
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Monthly Budget</h2>
              <p className="text-muted-foreground">
                Manage your spending limits and track expenses for optimal savings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-48">
                <select className="h-10 w-full appearance-none rounded-lg border border-border/60 bg-background pl-4 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30">
                  <option>October 2023</option>
                  <option>September 2023</option>
                  <option>August 2023</option>
                </select>
                <Calendar className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
              </div>
              <Button variant="outline">Edit Total Budget</Button>
            </div>
          </header>

          <section className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <Truck className="mt-0.5 size-5 text-rose-600" />
            <div className="flex-1">
              <p className="text-sm font-bold">Budget Alert: Transport</p>
              <p className="text-sm">
                You have exceeded your Transport budget by <span className="font-bold">ETB 100</span>.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">ETB 15,000</p>
              <p className="mt-1 text-xs text-emerald-600">+0% vs last month</p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background p-6 shadow-sm">
              <div className="absolute right-0 top-0 h-full w-1 bg-yellow-500" />
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">ETB 8,450</p>
              <p className="mt-1 text-xs text-yellow-600">56% of budget used</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
                <div className="h-1.5 w-[56%] rounded-full bg-yellow-500" />
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Remaining</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">ETB 6,550</p>
              <p className="mt-1 text-xs text-emerald-600">On track to save ETB 2,000</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="space-y-4 xl:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Budget Categories</h3>
                <button className="text-sm font-medium text-primary hover:underline" type="button">
                  Manage Categories
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-background p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold">Groceries</p>
                      <p className="text-xs text-muted-foreground">Monthly Limit: ETB 6,000</p>
                    </div>
                    <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">On Track</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">ETB 4,500</span>
                      <span className="text-muted-foreground">75%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[75%] rounded-full bg-primary" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">ETB 1,500 remaining</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-rose-200 bg-background p-5 shadow-sm">
                  <div className="absolute left-0 top-0 h-full w-1 bg-rose-500" />
                  <div className="flex items-start justify-between pl-2">
                    <div>
                      <p className="font-bold">Transport</p>
                      <p className="text-xs text-muted-foreground">Monthly Limit: ETB 2,000</p>
                    </div>
                    <span className="rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">Over Budget</span>
                  </div>
                  <div className="mt-4 pl-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">ETB 2,100</span>
                      <span className="font-bold text-rose-600">105%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-full rounded-full bg-rose-500" />
                    </div>
                    <p className="mt-2 text-xs text-rose-600">Exceeded by ETB 100</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <h3 className="text-base font-bold">Spending Velocity</h3>
                <p className="text-sm text-muted-foreground">You’re spending 12% less than last month.</p>
                <div className="mt-4 flex h-32 items-end justify-between gap-2">
                  <div className="h-[40%] w-full rounded bg-primary/20" />
                  <div className="h-[65%] w-full rounded bg-primary/20" />
                  <div className="h-[30%] w-full rounded bg-primary/20" />
                  <div className="h-[80%] w-full rounded bg-muted" />
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

