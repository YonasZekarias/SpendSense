"use client";

import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a202c] border-b border-[#dbdfe6] dark:border-gray-800 sticky top-0 z-10">
      <h1 className="text-lg font-bold text-[#111318] dark:text-white">
        SpendSense
      </h1>
      <button
        className="p-2 text-[#111318] dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onMenuOpen}
      >
        <Menu className="size-5" />
      </button>
    </div>
  );
}
