"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ReceiptText,
  Bell,
  LogOut,
  Package,
  ShoppingCart,
  Star,
  Store,
  X,
  CreditCard,
} from "lucide-react";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    matchPaths: ["/", "/dashboard"],
    exact: true,
  },
  {
    icon: Wallet,
    label: "Budget",
    href: "/budget",
    matchPaths: ["/budget"],
  },
  {
    icon: TrendingUp,
    label: "Live Prices",
    href: "/live-prices",
    matchPaths: ["/live-prices"],
  },
  {
    icon: ReceiptText,
    label: "Expenses",
    href: "/dashboard/expenses",
    matchPaths: ["/dashboard/expenses"],
  },
  {
    icon: Bell,
    label: "Alerts",
    href: "/dashboard/alerts",
    matchPaths: ["/dashboard/alerts"],
  },
  {
    icon: Store,
    label: "Shop",
    href: "/shop",
    matchPaths: ["/shop"],
  },
  {
    icon: Store,
    label: "Vendor Directory",
    href: "/shop/vendors",
    matchPaths: ["/shop/vendors"],
  },
  {
    icon: ShoppingCart,
    label: "Cart",
    href: "/cart",
    matchPaths: ["/cart"],
  },
  {
    icon: Wallet,
    label: "Checkout",
    href: "/checkout",
    matchPaths: ["/checkout"],
  },
  {
    icon: Package,
    label: "Orders",
    href: "/orders",
    matchPaths: ["/orders"],
  },
  {
    icon: Star,
    label: "Write Review",
    href: "/reviews/new",
    matchPaths: ["/reviews", "/reviews/new"],
  },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

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
      className={`
        ${mobile ? "fixed inset-y-0 left-0 z-50 w-72 shadow-2xl" : "hidden md:flex w-72 shrink-0 sticky top-0"} 
        flex h-screen flex-col justify-between border-r border-[#dbdfe6] bg-[#f6f6f8] transition-all duration-200 dark:border-slate-800 dark:bg-slate-950
      `}
    >
      {/* Scrollable Navigation Area */}
      <div className="flex flex-col gap-6 overflow-y-auto py-6">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6">
          <Link 
            href="/" 
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            onClick={mobile ? onClose : undefined}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#135bec] text-white shadow-sm shadow-[#135bec]/20">
              <CreditCard className="size-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-none text-[#135bec] dark:text-white">SpendSense</h1>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">Ethiopia</p>
            </div>
          </Link>

          {mobile && (
            <button 
              onClick={onClose} 
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Signed In Section */}
        <div className="px-4">
          <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Signed in as</p>
            <p className="mt-2 truncate text-sm font-semibold text-slate-950 dark:text-white">
              {user?.full_name ?? "User"}
            </p>
            <p className="text-xs capitalize text-slate-500">{user?.role ?? "Member"}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = isPathActive(pathname, item.matchPaths, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                className={`
                  group flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "border-r-4 border-[#135bec] bg-blue-50/70 text-[#135bec] dark:bg-blue-950/30" 
                    : "text-slate-500 hover:bg-[#f0f2f4] hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <item.icon 
                  className={`size-5 shrink-0 transition-colors ${
                    isActive ? "text-[#135bec]" : "text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white"
                  }`} 
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="flex flex-col gap-2 border-t border-border p-4">
        <div className="mb-2 px-2">
          <p className="text-xs font-medium text-muted-foreground">
            Logged in as <span className="font-bold text-foreground capitalize">{user?.role ?? "User"}</span>
          </p>
        </div>
        
        <button 
          onClick={signOut} 
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}