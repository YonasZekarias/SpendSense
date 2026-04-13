"use client";

import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/",
    matchPaths: ["/", "/dashboard"],
    exact: true,
  },
  {
    icon: Wallet,
    label: "Budget",
    href: "/dashboard/budget",
    matchPaths: ["/dashboard/budget", "/budget"],
  },
  {
    icon: ClipboardList,
    label: "Shopping List",
    href: "/shop",
    matchPaths: ["/shop", "/dashboard/shop", "/shopping-list"],
  },
  {
    icon: TrendingUp,
    label: "Price Trends",
    href: "/dashboard/prices",
    matchPaths: [
      "/dashboard/prices",
      "/dashboard/market",
      "/market",
      "/prices",
      "/price-trends",
      "/live-prices",
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/alerts",
    matchPaths: ["/dashboard/alerts", "/settings", "/settings/alerts"],
  },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}


export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isPathActive = useCallback(
    (currentPath: string, candidatePaths: string[], exact?: boolean) => {
      return candidatePaths.some((path) => {
        if (exact) return currentPath === path;
        return currentPath === path || currentPath.startsWith(`${path}/`);
      });
    },
    []
  );

  return (
    <aside
      className={`${
        mobile
          ? "fixed inset-y-0 left-0 z-[100] w-64 shadow-2xl"
          : "hidden md:flex w-64 shrink-0 sticky top-0"
      } flex flex-col justify-between bg-white dark:bg-[#1a202c] border-r border-[#dbdfe6] dark:border-gray-800 h-screen transition-all duration-200`}
    >
      <div className="p-4 flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-2"
            onClick={mobile ? onClose : undefined}
          >
            <div className="h-10 w-10 rounded-full bg-blue-500 flex-shrink-0" />
            <div className="flex flex-col">
              <h1 className="text-[#111318] dark:text-white text-base font-bold">SpendSense</h1>
              <p className="text-[#616f89] dark:text-gray-400 text-xs">Ethiopia</p>
            </div>
          </Link>

          {mobile && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="size-5" />
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = isPathActive(pathname, item.matchPaths, item.exact);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#f0f2f4] dark:bg-gray-700 text-[#111318] dark:text-white"
                    : "text-[#616f89] dark:text-gray-400 hover:bg-[#f0f2f4] dark:hover:bg-gray-800 hover:text-[#111318] dark:hover:text-white"
                }`}
              >
                <item.icon className={`size-5 ${isActive ? "text-blue-600" : ""}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#dbdfe6] dark:border-gray-800">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-[#616f89] dark:text-gray-400 hover:text-red-500">
          <LogOut className="size-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}