"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] text-[#111318] dark:text-gray-100">
      <Sidebar />

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
        </>
      )}

      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f6f6f8] dark:bg-[#101622]">
        <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />
        <div className="p-6 md:p-8 lg:p-12 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
