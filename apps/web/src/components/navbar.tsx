"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Expenses", href: "/expenses" },
  { label: "Budget", href: "/budget" },
  { label: "Shopping List", href: "/shopping-list" },
];

interface NavbarProps {
  avatarUrl?: string;
}

export function Navbar({ avatarUrl }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-gray-800 bg-white dark:bg-[#1a202c] px-4 sm:px-10 py-3 sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-4 text-[#111318] dark:text-white">
        <div className="size-8 flex items-center justify-center rounded bg-[#135bec]/10 text-[#135bec]">
          <Wallet className="size-5" />
        </div>
        <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          SpendSense
        </h2>
      </Link>

      <nav className="hidden md:flex items-center gap-9">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive
                  ? "text-[#135bec] text-sm font-bold leading-normal"
                  : "text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal hover:text-[#135bec] transition-colors"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/expenses/new"
          className="hidden md:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-[#135bec] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="truncate">Add Expense</span>
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="User profile"
          className="rounded-full size-10 border-2 border-white dark:border-gray-700 shadow-sm object-cover"
          src={
            avatarUrl ??
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA7lDnp5BJ2ycXIpRHUjtvsAYsNEtPGJJlzz7yFAxI1D3XcFFZzRAxSV-j-LPtZqDpOWKFzfgCYNt777wy4ymmRbeHhLFofDSyz_YbANee7szCOy7RK4NbxEitq5eeq31OnEk-qWa3s5dvGTqgCIrFIt5mnWrP0kogOh9rjtwyG3VvPacjticvmvV9HFaNDY4zOxilTy0lcX5DP3yenqxAKBCBOMG-TCmSXeGI_hNgotKR8ZBwIdHvSASiebN9dLFTigY2BZLflKqM"
          }
        />
      </div>
    </header>
  );
}
