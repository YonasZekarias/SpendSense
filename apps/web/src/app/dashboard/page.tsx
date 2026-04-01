"use client";

import {
  TrendingUp,
  Plus,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  Bell,
  Lightbulb,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      {/* Page Heading */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#111318] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight">
            Good morning, Abebe
          </h1>
          <p className="text-[#616f89] dark:text-gray-400 text-base font-normal">
            Here is your financial overview for today.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-6 bg-[#135bec] hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm">
          <Plus className="size-5" />
          <span>Add Expense</span>
        </button>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Monthly Spending"
          value="4,500 ETB"
          trend="up"
          percent="12%"
        />
        <StatCard
          label="Estimated Savings"
          value="1,200 ETB"
          trend="up"
          percent="5%"
        />
        <StatCard
          label="Daily Average"
          value="150 ETB"
          trend="down"
          percent="2%"
        />
      </section>

      {/* Charts and Alerts Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Budget Progress */}
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#dbdfe6] dark:border-gray-700 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-[#111318] dark:text-white text-base font-bold">
                  Monthly Budget Usage
                </h3>
                <p className="text-[#616f89] dark:text-gray-400 text-sm">
                  Food, Housing &amp; Transport
                </p>
              </div>
              <span className="text-[#111318] dark:text-white text-lg font-bold">
                65%
              </span>
            </div>
            <div className="relative w-full h-3 bg-[#f0f2f4] dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-[#135bec] rounded-full transition-all duration-500 ease-out"
                style={{ width: "65%" }}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#616f89] dark:text-gray-400 font-medium">
                4,500 ETB Spent
              </span>
              <span className="text-[#111318] dark:text-white font-semibold">
                8,000 ETB Remaining
              </span>
            </div>
          </div>

          {/* Price Trends Chart */}
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#dbdfe6] dark:border-gray-700 shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[#111318] dark:text-white text-base font-bold">
                  Staple Food Price Index
                </h3>
                <p className="text-[#616f89] dark:text-gray-400 text-sm">
                  Tracking Teff, Oil, and Coffee prices
                </p>
              </div>
              <select className="bg-[#f0f2f4] dark:bg-gray-700 text-[#111318] dark:text-white text-sm font-medium rounded-lg border-none px-3 py-1.5 cursor-pointer outline-none focus:ring-2 focus:ring-[#135bec]/50">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="w-full min-h-[220px] relative">
              <svg
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 478 150"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#135bec" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#135bec" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path
                  d="M0 109 C18 109 18 21 36 21 C54 21 54 41 72 41 C90 41 90 93 108 93 C127 93 127 33 145 33 C163 33 163 101 181 101 C199 101 199 61 217 61 C236 61 236 45 254 45 C272 45 272 121 290 121 C308 121 308 149 326 149 C344 149 344 1 363 1 C381 1 381 81 399 81 C417 81 417 129 435 129 C453 129 453 25 472 25 V 150 H 0 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0 109 C18 109 18 21 36 21 C54 21 54 41 72 41 C90 41 90 93 108 93 C127 93 127 33 145 33 C163 33 163 101 181 101 C199 101 199 61 217 61 C236 61 236 45 254 45 C272 45 272 121 290 121 C308 121 308 149 326 149 C344 149 344 1 363 1 C381 1 381 81 399 81 C417 81 417 129 435 129 C453 129 453 25 472 25"
                  fill="none"
                  stroke="#135bec"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                />
              </svg>
              <div className="flex justify-between mt-4 text-xs font-medium text-[#616f89] dark:text-gray-500 uppercase tracking-wider">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & Tips */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {/* Real-Time Alerts */}
          <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#dbdfe6] dark:border-gray-700 shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#111318] dark:text-white text-base font-bold">
                Real-time Alerts
              </h3>
              <button className="text-[#135bec] text-sm font-medium hover:underline">
                Mark all read
              </button>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <TrendingUp className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[#111318] dark:text-white">
                    Price Hike: Teff
                  </p>
                  <p className="text-sm text-[#616f89] dark:text-gray-400 leading-snug">
                    Teff prices have risen by 5% in Addis Ababa markets today.
                  </p>
                  <p className="text-xs text-[#616f89] dark:text-gray-500 font-medium mt-1">
                    Just now
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#135bec] mt-2 flex-shrink-0" />
              </div>

              <hr className="border-[#f0f2f4] dark:border-gray-800" />

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                  <ShoppingBag className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[#111318] dark:text-white">
                    Sale Detected: Cooking Oil
                  </p>
                  <p className="text-sm text-[#616f89] dark:text-gray-400 leading-snug">
                    5L Cooking Oil dropped to 850 ETB at Shoa Supermarket.
                  </p>
                  <p className="text-xs text-[#616f89] dark:text-gray-500 font-medium mt-1">
                    2 hours ago
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#135bec] mt-2 flex-shrink-0" />
              </div>

              <hr className="border-[#f0f2f4] dark:border-gray-800" />

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#135bec] dark:text-blue-400">
                  <Bell className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[#111318] dark:text-white">
                    Budget Limit Approaching
                  </p>
                  <p className="text-sm text-[#616f89] dark:text-gray-400 leading-snug">
                    You have used 65% of your monthly budget.
                  </p>
                  <p className="text-xs text-[#616f89] dark:text-gray-500 font-medium mt-1">
                    Yesterday
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Tip Card */}
          <div className="bg-[#135bec]/5 dark:bg-[#135bec]/10 rounded-xl p-6 border border-[#135bec]/10 dark:border-[#135bec]/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#135bec] font-bold text-sm uppercase tracking-wide">
              <Lightbulb className="size-4" />
              Smart Tip
            </div>
            <p className="text-[#111318] dark:text-white font-medium text-sm leading-relaxed">
              Buying onions in bulk this weekend could save you approximately{" "}
              <span className="font-bold text-[#135bec]">200 ETB</span> next
              month based on current trends.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  trend,
  percent,
}: {
  label: string;
  value: string;
  trend: "up" | "down";
  percent: string;
}) {
  const isUp = trend === "up";
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-[#dbdfe6] dark:border-gray-700 shadow-sm flex flex-col gap-1 transition-colors">
      <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <p className="text-[#111318] dark:text-white text-2xl font-bold tracking-tight">
          {value}
        </p>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            isUp
              ? "bg-green-50 text-[#07883b] dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-[#e73908] dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {isUp ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )}
          {percent}
        </span>
      </div>
    </div>
  );
}
