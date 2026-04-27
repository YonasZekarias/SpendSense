"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useAuth } from "@/providers/auth-provider";
import { getItems, submitPrice, type MarketItem } from "@/services/marketService";

export default function MarketSubmitPage() {
  const { accessToken, status } = useAuth();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [itemId, setItemId] = useState<number | "">("");
  const [price, setPrice] = useState("");
  const [marketLocation, setMarketLocation] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [dateObserved, setDateObserved] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);

  useEffect(() => {
    void getItems()
      .then((list) => {
        setItems(list);
        if (list[0]) setItemId(list[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-60 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit a price</h1>
        <p className="text-sm text-slate-500">Crowdsource a price observation for moderation.</p>
      </div>

      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      {warn && <p className="text-sm text-amber-700">{warn}</p>}

      <div className="space-y-2">
        <label className="text-sm font-medium">Item</label>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={itemId === "" ? "" : String(itemId)}
          onChange={(e) => setItemId(Number(e.target.value))}
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} ({i.unit})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Price (ETB)</label>
        <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" min="0" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Market / store location</label>
        <Input value={marketLocation} onChange={(e) => setMarketLocation(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">City</label>
        <Input value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Date observed</label>
        <Input type="date" value={dateObserved} onChange={(e) => setDateObserved(e.target.value)} />
      </div>

      <Button
        className="w-full"
        disabled={saving || !accessToken || itemId === ""}
        onClick={async () => {
          if (!accessToken || itemId === "") return;
          setSaving(true);
          setMsg(null);
          setWarn(null);
          try {
            const res = await submitPrice(accessToken, {
              item_id: itemId,
              price_value: price,
              market_location: marketLocation,
              city,
              date_observed: dateObserved,
            });
            if (res.outlier_warning) setWarn(res.outlier_warning);
            setMsg("Submitted for review. Thank you!");
          } catch {
            setMsg("Submission failed. Check that you are signed in.");
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Submitting…" : "Submit price"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        <Link href="/market/trends" className="text-[#135bec] underline">
          View price trends
        </Link>
      </p>
    </div>
  );
}
