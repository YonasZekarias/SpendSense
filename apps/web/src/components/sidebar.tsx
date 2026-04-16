"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Wallet,
  ClipboardList,
  TrendingUp,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Store, label: "Market", href: "/market" },
  { icon: Wallet, label: "Budget", href: "/budget" },
  { icon: ClipboardList, label: "Shopping List", href: "/shopping-list" },
  { icon: TrendingUp, label: "Price Trends", href: "/price-trends" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        mobile
          ? "fixed inset-0 z-50 w-64"
          : "hidden md:flex w-64 flex-shrink-0"
      } flex flex-col justify-between bg-white dark:bg-[#1a202c] border-r border-[#dbdfe6] dark:border-gray-800 h-full overflow-y-auto transition-colors duration-200`}
    >
      <div className="p-4 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="User profile"
              className="rounded-full h-10 w-10 shadow-sm object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvlFjpv1n70cYg_5hNUynZpOFc2BvcSEPIDy9pK-mi6bECZiklitRacUev5Jdq4V4owVs4-5tvh8gJ_z04hcoHmmtHljVDhpsDe7o78R5oaUlz6X7303q5wJFUPsIAGEJUDMGVMjGbLGJi4eplIAfPRHOk8BIjJv0ebWs-JJsj0n6Yn8YbYfIvJKnSATy6A7flVSliWpfkFvLvUS6RtHnNICa_u8K-a2yClzOFeTtfdgCv19U3r0R6dQR0BLgC8pnM2NEsBbwlVXQ"
            />
            <div className="flex flex-col">
              <h1 className="text-[#111318] dark:text-white text-base font-bold leading-normal">
                SpendSense
              </h1>
              <p className="text-[#616f89] dark:text-gray-400 text-xs font-normal leading-normal">
                Ethiopia
              </p>
            </div>
          </Link>
          {mobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-[#616f89]"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive
                    ? "bg-[#f0f2f4] dark:bg-gray-700/50"
                    : "hover:bg-[#f0f2f4] dark:hover:bg-gray-800"
                }`}
              >
                <item.icon
                  className={`size-5 ${
                    isActive
                      ? "text-[#111318] dark:text-white"
                      : "text-[#616f89] dark:text-gray-400 group-hover:text-[#111318] dark:group-hover:text-white"
                  }`}
                />
                <p
                  className={`text-sm font-medium leading-normal ${
                    isActive
                      ? "text-[#111318] dark:text-white"
                      : "text-[#616f89] dark:text-gray-400 group-hover:text-[#111318] dark:group-hover:text-white"
                  }`}
                >
                  {item.label}
                </p>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#dbdfe6] dark:border-gray-800">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-gray-800 transition-colors group w-full">
          <LogOut className="size-5 text-[#616f89] dark:text-gray-400 group-hover:text-red-500" />
          <p className="text-[#616f89] dark:text-gray-400 group-hover:text-red-500 text-sm font-medium leading-normal">
            Log Out
          </p>
        </button>
      </div>
    </aside>
  );
}
