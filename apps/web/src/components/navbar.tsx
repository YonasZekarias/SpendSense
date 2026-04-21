"use client";

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Bell, Search, Wallet } from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Budget", href: "/budget" },
  { label: "Live Prices", href: "/live-prices" },
  { label: "Expenses", href: "/dashboard/expenses" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky pl-20 top-0 z-40 hidden h-20 items-center border-b border-[#cbd5e1]/70 bg-white/90 px-6 backdrop-blur-xl lg:flex lg:pl-72 dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex pl-5 flex-1 items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-3 text-[#111318] dark:text-white">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#135bec]/10 text-[#135bec]">
            <Wallet className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">SpendSense</h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">Ethiopia</p>
          </div>
        </Link>

      </div>

      <nav className="flex items-center gap-8 px-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "text-sm font-medium transition-colors",
                isActive ? "text-[#135bec]" : "text-slate-600 hover:text-[#135bec] dark:text-slate-300",
              ].join(" ")}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/alerts"
          className="relative inline-flex size-10 items-center justify-center rounded-full border border-[#dbdfe6] bg-white text-slate-600 transition-colors hover:border-[#135bec]/30 hover:text-[#135bec] dark:border-slate-800 dark:bg-slate-900"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#e73908]" />
        </Link>

        <Link
          href="/dashboard/expenses/new"
          className="inline-flex items-center justify-center rounded-full bg-[#135bec] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#135bec]/20 transition-opacity hover:opacity-95"
        >
          Add Expense
        </Link>

        <div className="flex items-center gap-3 rounded-full border border-[#dbdfe6] bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-right">
            <p className="text-xs font-bold leading-none text-slate-950 dark:text-white">
              {user?.full_name ?? "Abebe Kebede"}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{user?.role ?? "Premium Plan"}</p>
          </div>
          <div className="size-10 rounded-full bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbBNiUzh6h-w1FOiRq11HgEilm9CKLuP1xduf7FkBdPJP6ama6AiiN7nPK5VcoUwE0LyZoCBhQ8A2yiaCO6_fFd2ky8mZ861AVZnDoxM7c3cXl3GaJt14BdmPOgHs_KLeTeZlrm9MQhoXFenCdf2vXV1iEI_88woAVO3EPefcz0ixzq5Ml7-vOF7TgNJ7UqkX_qYCAOjfG_LzIEICLm2KhZGzafuEy_FXFzZHRC72FqnrETtI4m_fPc7xT57SrcKVqG_krPN0BJGI')] bg-cover bg-center shadow-sm" />
        </div>
      </div>

    </header>
  );
}
