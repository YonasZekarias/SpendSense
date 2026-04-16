"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, LayoutDashboard, LogOut, Search, ShoppingCart, Store, Wallet } from "lucide-react";

type MarketLayoutProps = {
  children: React.ReactNode;
};

const sideNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/market", label: "Market", icon: Store },
  { href: "/budget", label: "Finance", icon: Wallet },
  { href: "/shop", label: "Shopping", icon: ShoppingCart },
];

export function MarketLayout({ children }: MarketLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] dark:bg-[#101622] dark:text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-[#e5e7eb] bg-[#f6f6f8] py-6 dark:border-gray-800 dark:bg-slate-950 lg:flex">
        <div className="mb-10 flex items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#135bec] text-white">
            <Store className="size-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#135bec] dark:text-blue-400">SpendSense</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ethiopia</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {sideNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 font-bold text-[#135bec] dark:bg-blue-900/20"
                    : "text-slate-500 hover:bg-[#f0f2f4] dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 px-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#135bec] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Store className="size-4" />
            New Transaction
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-[#f0f2f4] dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <LogOut className="size-4 text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#cbd5e1]/50 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-slate-900/80 md:px-8">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search commodities or regions..."
              className="h-10 w-full rounded-xl border-0 bg-[#f0f2f4] pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#135bec]/20 dark:bg-slate-800"
            />
          </div>

          <div className="ml-4 flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 transition hover:text-[#135bec] dark:text-slate-300"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 transition hover:text-[#135bec] dark:text-slate-300"
              aria-label="Help"
            >
              <HelpCircle className="size-4" />
            </button>
          </div>
        </header>

        <section className="px-4 pb-12 pt-8 md:px-8">{children}</section>
      </main>
    </div>
  );
}
