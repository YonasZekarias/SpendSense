"use client";

import {
  AlertTriangle,
  Banknote,
  BusFront,
  CalendarDays,
  Droplets,
  Home,
  Plus,
  ShoppingBasket,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";

type CategoryCard = {
  name: string;
  limit: string;
  spent: string;
  percentUsed: number;
  status: "on-track" | "safe" | "over-budget" | "paid";
  note: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  barColor: string;
};

const categories: CategoryCard[] = [
  {
    name: "Groceries",
    limit: "ETB 6,000",
    spent: "ETB 4,500",
    percentUsed: 75,
    status: "on-track",
    note: "ETB 1,500 remaining",
    icon: ShoppingBasket,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-700 dark:text-green-300",
    barColor: "bg-[#135bec]",
  },
  {
    name: "Transport",
    limit: "ETB 2,000",
    spent: "ETB 2,100",
    percentUsed: 105,
    status: "over-budget",
    note: "Exceeded by ETB 100",
    icon: BusFront,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-700 dark:text-red-300",
    barColor: "bg-red-500",
  },
  {
    name: "Utilities",
    limit: "ETB 1,500",
    spent: "ETB 800",
    percentUsed: 53,
    status: "safe",
    note: "ETB 700 remaining",
    icon: Droplets,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-700 dark:text-blue-300",
    barColor: "bg-[#135bec]",
  },
  {
    name: "Housing",
    limit: "ETB 5,000",
    spent: "ETB 5,000",
    percentUsed: 100,
    status: "paid",
    note: "Rent paid on Oct 1st",
    icon: Home,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-700 dark:text-purple-300",
    barColor: "bg-purple-500",
  },
];

const spendingVelocity = [
  { week: "W1", value: 40 },
  { week: "W2", value: 65 },
  { week: "W3", value: 30 },
  { week: "W4", value: 80 },
];

const recentTransactions = [
  {
    title: "Ride Taxi",
    category: "Transport",
    amount: "- ETB 350",
    icon: BusFront,
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600",
  },
  {
    title: "Shoa Supermarket",
    category: "Groceries",
    amount: "- ETB 1,200",
    icon: ShoppingBasket,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600",
  },
  {
    title: "Electric Bill",
    category: "Utilities",
    amount: "- ETB 450",
    icon: Zap,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
];

function statusBadge(status: CategoryCard["status"]) {
  if (status === "over-budget") {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }
  if (status === "safe") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  }
  if (status === "paid") {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  }
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
}

function statusLabel(status: CategoryCard["status"]) {
  if (status === "over-budget") return "Over Budget";
  if (status === "safe") return "Safe";
  if (status === "paid") return "Paid";
  return "On Track";
}

export default function BudgetManagementPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-[#111318] dark:text-white">
          Monthly Budget
        </h1>
        <p className="text-base text-[#616f89] dark:text-gray-400">
          Manage your spending limits and track expenses for optimal savings.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-[220px] max-w-[260px]">
          <select className="h-10 w-full appearance-none rounded-lg border border-[#dbdfe6] bg-white pl-4 pr-10 text-sm font-medium text-[#111318] outline-none focus:ring-2 focus:ring-[#135bec]/30 dark:border-gray-700 dark:bg-[#1a2230] dark:text-white">
            <option>October 2023</option>
            <option>September 2023</option>
            <option>August 2023</option>
          </select>
          <CalendarDays className="pointer-events-none absolute right-3 top-2.5 size-4 text-[#616f89] dark:text-gray-400" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#135bec] px-4 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Add Expense
          </button>
          <button
            type="button"
            className="h-10 rounded-lg border border-[#dbdfe6] bg-white px-4 text-sm font-bold text-[#111318] hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1a2230] dark:text-white dark:hover:bg-gray-800"
          >
            Edit Total Budget
          </button>
        </div>
      </div>

      <section className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
        <div className="flex-1">
          <p className="text-sm font-bold text-red-800 dark:text-red-200">Budget Alert: Transport</p>
          <p className="text-sm text-red-700 dark:text-red-300">
            You have exceeded your Transport budget by <span className="font-bold">ETB 100</span>.
            Consider adjusting your limits for next month.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-transparent bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2230]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[#616f89] dark:text-gray-400">Total Budget</p>
            <div className="rounded-full bg-blue-50 p-2 dark:bg-blue-900/20">
              <Banknote className="size-5 text-[#135bec]" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#111318] dark:text-white">ETB 15,000</p>
          <p className="mt-1 text-xs font-medium text-[#07883b]">+0% vs last month</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-transparent bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2230]">
          <div className="absolute right-0 top-0 h-full w-1 bg-yellow-500" />
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[#616f89] dark:text-gray-400">Total Spent</p>
            <div className="rounded-full bg-yellow-50 p-2 dark:bg-yellow-900/20">
              <TrendingUp className="size-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#111318] dark:text-white">ETB 8,450</p>
          <p className="mt-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
            56% of budget used
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-1.5 w-[56%] rounded-full bg-yellow-500" />
          </div>
        </div>

        <div className="rounded-xl border border-transparent bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2230]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[#616f89] dark:text-gray-400">Remaining</p>
            <div className="rounded-full bg-green-50 p-2 dark:bg-green-900/20">
              <Wallet className="size-5 text-[#07883b]" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#111318] dark:text-white">ETB 6,550</p>
          <p className="mt-1 text-xs font-medium text-[#07883b]">On track to save ETB 2,000</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111318] dark:text-white">Budget Categories</h2>
            <button type="button" className="text-sm font-medium text-[#135bec] hover:underline">
              Manage Categories
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.name}
                  className={`rounded-xl border bg-white p-5 shadow-sm dark:bg-[#1a2230] ${
                    category.status === "over-budget"
                      ? "border-red-100 dark:border-red-900/30"
                      : "border-[#f0f2f4] dark:border-gray-800"
                  } ${category.status === "over-budget" ? "relative overflow-hidden" : ""}`}
                >
                  {category.status === "over-budget" && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />
                  )}

                  <div className={`flex items-start justify-between ${category.status === "over-budget" ? "pl-2" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${category.iconBg}`}>
                        <Icon className={`size-5 ${category.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-bold text-[#111318] dark:text-white">{category.name}</p>
                        <p className="text-xs text-[#616f89] dark:text-gray-400">
                          Monthly Limit: {category.limit}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${statusBadge(category.status)}`}
                    >
                      {statusLabel(category.status)}
                    </span>
                  </div>

                  <div className={`mt-4 ${category.status === "over-budget" ? "pl-2" : ""}`}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-[#111318] dark:text-white">{category.spent}</span>
                      <span
                        className={
                          category.status === "over-budget"
                            ? "font-bold text-red-600"
                            : "text-[#616f89] dark:text-gray-400"
                        }
                      >
                        {category.percentUsed}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-[#f0f2f4] dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${category.barColor}`}
                        style={{ width: `${Math.min(category.percentUsed, 100)}%` }}
                      />
                    </div>
                    <p
                      className={`mt-2 text-xs ${
                        category.status === "over-budget"
                          ? "text-red-500"
                          : "text-[#616f89] dark:text-gray-400"
                      }`}
                    >
                      {category.note}
                    </p>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className="flex min-h-[160px] h-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#dbdfe6] p-5 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-700">
                <Plus className="size-5 text-gray-500 dark:text-gray-300" />
              </div>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                Create New Category
              </span>
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-xl border border-[#f0f2f4] bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2230]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111318] dark:text-white">Spending Velocity</h3>
              <button type="button" className="text-xs font-medium text-[#135bec]">
                View Report
              </button>
            </div>
            <div className="flex h-40 items-end justify-between gap-2">
              {spendingVelocity.map((bucket) => (
                <div key={bucket.week} className="flex w-full flex-col items-center gap-1">
                  <div className="h-full w-full rounded-t-sm bg-blue-100 dark:bg-blue-900/20">
                    <div
                      className="mt-auto w-full rounded-t-sm bg-[#135bec]"
                      style={{ height: `${bucket.value}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{bucket.week}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-[#616f89] dark:text-gray-400">
              You&apos;re spending <span className="font-bold text-green-600">12% less</span> than last month at this time.
            </p>
          </div>

          <div className="rounded-xl border border-[#f0f2f4] bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2230]">
            <h3 className="mb-4 text-base font-bold text-[#111318] dark:text-white">Recent Transactions</h3>
            <div className="flex flex-col gap-4">
              {recentTransactions.map((tx) => {
                const Icon = tx.icon;
                return (
                  <div key={tx.title} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-8 items-center justify-center rounded-full ${tx.iconBg}`}>
                        <Icon className={`size-4 ${tx.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111318] dark:text-white">{tx.title}</p>
                        <p className="text-xs text-[#616f89] dark:text-gray-400">{tx.category}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#111318] dark:text-white">{tx.amount}</p>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-lg py-2 text-sm font-medium text-[#135bec] transition-colors hover:bg-[#135bec]/5"
            >
              View All Transactions
            </button>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}

