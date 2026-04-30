"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getItem, type MarketItem } from "@/services/marketService";

export default function MarketItemDetailPage() {
  const params = useParams();
  const id = Number.parseInt(String(params.id), 10);
  const [item, setItem] = useState<MarketItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setError("Invalid item");
      setLoading(false);
      return;
    }
    void getItem(id)
      .then(setItem)
      .catch(() => setError("Item not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading item…
      </div>
    );
  }

  if (error || !item) {
    return <p className="text-slate-600">{error ?? "Not found."}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">{item.name}</h1>
      <p className="text-slate-500">
        {item.category} · {item.unit}
      </p>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href={`/market/trends?item_id=${item.id}`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          View trends
        </Link>
        <Link
          href="/market/submit"
          className="rounded-lg border border-slate-200 px-4 py-2"
        >
          Submit a price
        </Link>
      </div>
    </div>
  );
}
