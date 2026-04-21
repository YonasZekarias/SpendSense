"use client";

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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
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
      className={`${
        mobile
          ? "fixed inset-y-0 left-0 z-100 w-64 shadow-2xl"
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
            <div className="h-10 w-10 rounded-full bg-blue-500 shrink-0" />
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
{/* function NavItem({ icon, label, active = false, variant = "default" }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  variant?: "default" | "destructive"
}) {
  return (
    <div className={`
      group flex items-center px-4 py-3 cursor-pointer transition-all duration-200
      ${active 
        ? "text-primary font-bold border-r-4 border-primary bg-primary/10" 
        : "text-muted-foreground font-medium hover:bg-secondary"}
      ${variant === "destructive" ? "hover:text-destructive" : ""}
    `}>
      <span className="mr-3">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
} */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = isPathActive(pathname, item.matchPaths, item.exact);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                // className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                //   isActive
                //     ? "bg-[#f0f2f4] dark:bg-gray-700 text-[#111318] dark:text-white"
                //     : "text-[#616f89] dark:text-gray-400 hover:bg-[#f0f2f4] dark:hover:bg-gray-800 hover:text-[#111318] dark:hover:text-white"
                // }`}
                className={`
                  group flex items-center px-4 py-3 cursor-pointer transition-all duration-200
                  ${isActive 
                    ? "text-primary font-bold border-r-4 border-primary bg-primary/10" 
                    : "text-muted-foreground font-medium hover:bg-secondary"}
                `}
              >
                <span className="mr-3">
                  <item.icon  />
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-[#dbdfe6] dark:border-gray-800">
        <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-[#616f89] dark:text-gray-400 hover:text-red-500">
          <LogOut className="size-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
        <p className="text-xs px-4 text-muted-foreground">Role: {user?.role ?? "user"}</p>

      </div>
    </aside>
  );
}
