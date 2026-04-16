"use client";

import { useEffect, useState } from "react";
import { getMarketCategories } from "@/services/marketService";

type CategoryPillsProps = {
  selected: string | null;
  onSelect: (category: string | null) => void;
};

export function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const values = await getMarketCategories();
        if (cancelled) return;
        setCategories(values);
      } catch {
        if (cancelled) return;
        setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-2 pb-1">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            selected == null
              ? "bg-[#135bec] text-white"
              : "bg-white text-[#616f89] hover:bg-[#f0f2f4] dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
          }`}
        >
          All
        </button>

        {loading && (
          <span className="rounded-full bg-[#f0f2f4] px-4 py-2 text-sm text-[#616f89] dark:bg-slate-800 dark:text-gray-400">
            Loading categories...
          </span>
        )}

        {!loading &&
          categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selected === category
                  ? "bg-[#135bec] text-white"
                  : "bg-white text-[#616f89] hover:bg-[#f0f2f4] dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
              }`}
            >
              {category}
            </button>
          ))}
      </div>
    </div>
  );
}
