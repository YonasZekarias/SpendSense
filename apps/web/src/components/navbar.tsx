"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Bell, Search } from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Budget", href: "/budget" },
  { label: "Live Prices", href: "/live-prices" },
  { label: "Expenses", href: "/expenses" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/70 px-4 backdrop-blur-lg transition-all duration-300 dark:border-slate-800/50 dark:bg-slate-950/70 sm:px-8">
      
      {/* Search Input */}
      

      {/* Right Side Actions & Profile */}
      <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
        
        {/* Navigation Links */}
        <nav className="mr-2 hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex h-16 items-center text-sm font-semibold transition-colors ${
                  isActive 
                    ? "text-[#135bec]" 
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {link.label}
                {/* Premium Active Bottom Border Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.75 w-full rounded-t-full bg-[#135bec]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Vertical Divider */}
        <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 lg:block" />

        {/* Notification Bell */}
        <Link
          href="/dashboard/alerts"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200/50 bg-white/50 text-slate-600 backdrop-blur-sm transition-colors hover:border-[#135bec]/30 hover:text-[#135bec] dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-slate-400"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#e73908] ring-2 ring-white dark:ring-slate-950" />
        </Link>

        {/* Profile Pill */}
        <div className="flex shrink-0 items-center gap-3 rounded-full border border-slate-200/50 bg-white/50 py-1 pl-4 pr-1 backdrop-blur-sm transition-colors hover:border-slate-300/50 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-slate-700/50">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold leading-none text-slate-900 dark:text-white">
              {user?.full_name ?? "Abebe Kebede"}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              {user?.role ?? "Premium"}
            </p>
          </div>
          <div 
            className="size-8 rounded-full bg-slate-200 bg-cover bg-center shadow-sm ring-1 ring-slate-200/50 dark:bg-slate-800 dark:ring-slate-700/50"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbBNiUzh6h-w1FOiRq11HgEilm9CKLuP1xduf7FkBdPJP6ama6AiiN7nPK5VcoUwE0LyZoCBhQ8A2yiaCO6_fFd2ky8mZ861AVZnDoxM7c3cXl3GaJt14BdmPOgHs_KLeTeZlrm9MQhoXFenCdf2vXV1iEI_88woAVO3EPefcz0ixzq5Ml7-vOF7TgNJ7UqkX_qYCAOjfG_LzIEICLm2KhZGzafuEy_FXFzZHRC72FqnrETtI4m_fPc7xT57SrcKVqG_krPN0BJGI')" }}
          />
        </div>
      </div>
    </header>
  );
}