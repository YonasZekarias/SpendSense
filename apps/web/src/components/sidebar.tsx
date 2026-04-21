"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ReceiptText,
  Bell,
  LogOut,
  X,

} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Wallet, label: "Budget", href: "/budget" },
  { icon: TrendingUp, label: "Live Prices", href: "/live-prices" },
  { icon: ReceiptText, label: "Expenses", href: "/dashboard/expenses" },
  { icon: Bell, label: "Alerts", href: "/dashboard/alerts" },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
    return (
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#dbdfe6] bg-[#f6f6f8] transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950",
          mobile ? "translate-x-0 shadow-2xl lg:hidden" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#135bec] text-white shadow-sm shadow-[#135bec]/20">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-[#135bec]">SpendSense</h1>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                Ethiopia
              </p>
            </div>
          </Link>

          {mobile ? (
            <button
              aria-label="Close navigation"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X className="size-5" />
            </button>
          ) : null}
        </div>

        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Signed in as</p>
            <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
              {user?.full_name ?? "Abebe Kebede"}
            </p>
            <p className="text-xs text-slate-500">{user?.role ?? "Premium Plan"}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                className={[
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "border-r-4 border-[#135bec] bg-blue-50/70 text-[#135bec] dark:bg-blue-950/30"
                    : "text-slate-500 hover:bg-[#f0f2f4] hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white",
                ].join(" ")}
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-[#dbdfe6] px-4 py-5 dark:border-slate-800">
          <Link
            href="/dashboard/expenses/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#135bec] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#135bec]/20 transition-transform hover:opacity-95 active:scale-[0.99]"
            onClick={mobile ? onClose : undefined}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              add
            </span>
            New Transaction
          </Link>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-[#f0f2f4] hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white"
            onClick={signOut}
            type="button"
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    );
}
