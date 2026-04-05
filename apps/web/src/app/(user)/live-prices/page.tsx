"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getItems, getPriceAverages, type MarketItem, type PriceAverageRow } from "@/services/marketService";
import { Button } from "@repo/ui/components/button";

type Row = {
  itemId: number;
  itemName: string;
  unit: string;
  category: string;
  city: string;
  averagePrice?: string;
  count?: number;
};

export default function LivePricesPage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [averages, setAverages] = useState<PriceAverageRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      setError(null);
      try {
        const [itemsResult, averagesResult] = await Promise.all([getItems(), getPriceAverages()]);
        setItems(itemsResult);
        setAverages(averagesResult);
      } catch (err) {
        setError("Unable to load market prices right now.");
      } finally {
        setLoading(false);
      }
    };

    void boot();
  }, []);

  const averageIndex = useMemo(() => {
    const map = new Map<number, PriceAverageRow[]>();
    for (const row of averages) {
      const list = map.get(row.item_id) ?? [];
      list.push(row);
      map.set(row.item_id, list);
    }
    return map;
  }, [averages]);

  const rows = useMemo<Row[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items
      .filter((item) => {
        if (!normalizedQuery) return true;
        return (
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery) ||
          item.unit.toLowerCase().includes(normalizedQuery)
        );
      })
      .map((item) => {
        const avgRows = averageIndex.get(item.id) ?? [];
        const first = avgRows[0];
        return {
          itemId: item.id,
          itemName: item.name,
          unit: item.unit,
          category: item.category,
          city: first?.city ?? "—",
          averagePrice: first?.average_price,
          count: first?.count,
        };
      });
  }, [averageIndex, items, query]);

  return (
    <main className="mx-auto w-full max-w-360 px-4 py-8 md:px-10 lg:px-16">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Current Market Prices</h1>
          <p className="text-muted-foreground">
            Live tracking of essential goods and cost-of-living metrics across Ethiopia.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/live-prices/submit">Submit price</Link>
          </Button>
        </div>
      </header>

      <section className="mb-6 rounded-xl border border-border/60 bg-background p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items (e.g. Teff, Coffee, Onions)..."
              className="h-11 w-full rounded-lg border border-border/60 bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full border border-border/60 bg-muted px-3 py-2">
              {loading ? "Loading…" : `${rows.length} items`}
            </span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Avg. Price</th>
                <th className="px-6 py-4 text-right">Submissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {error && (
                <tr>
                  <td className="px-6 py-6 text-sm text-destructive" colSpan={6}>
                    {error}
                  </td>
                </tr>
              )}
              {!error && loading && (
                <tr>
                  <td className="px-6 py-6 text-sm text-muted-foreground" colSpan={6}>
                    Loading market data…
                  </td>
                </tr>
              )}
              {!error && !loading && rows.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-sm text-muted-foreground" colSpan={6}>
                    No items found.
                  </td>
                </tr>
              )}
              {!error &&
                !loading &&
                rows.map((row) => (
                  <tr key={row.itemId} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{row.itemName}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{row.unit}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.category}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.city}</td>
                    <td className="px-6 py-4 font-semibold tabular-nums">
                      {row.averagePrice ? `${row.averagePrice} ETB` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground tabular-nums">{row.count ?? 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

