"use client";

import { CheckCircle2, ChevronRight, Info, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { VendorSidebar } from "../../_components/vendor-shell";
import {
    createVendorProduct,
    getMarketItems,
    getStoredVendorId,
    MarketItem,
    VendorApiError,
} from "../../_lib/vendor-api";

interface BackendProductPayload {
  item: number;
  price: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const INITIAL_PAYLOAD: BackendProductPayload = {
  item: 1,
  price: 0,
};

export default function VendorProductCreatePage() {
  const [payload, setPayload] = useState<BackendProductPayload>(INITIAL_PAYLOAD);
  const [payloadText, setPayloadText] = useState<string>(JSON.stringify(INITIAL_PAYLOAD, null, 2));
  const [items, setItems] = useState<MarketItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsLoadError, setItemsLoadError] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setVendorId(getStoredVendorId());

    async function loadItems() {
      setItemsLoading(true);
      setItemsLoadError("");
      try {
        const data = await getMarketItems();
        setItems(data);

        if (data.length > 0) {
          setPayload((prev) => {
            const next = {
              ...prev,
              item: prev.item > 0 ? prev.item : data[0].id,
            };
            setPayloadText(JSON.stringify(next, null, 2));
            return next;
          });
        }
      } catch (err: unknown) {
        setItemsLoadError(err instanceof Error ? err.message : "Failed to load item catalog.");
      } finally {
        setItemsLoading(false);
      }
    }

    void loadItems();
  }, []);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === payload.item) || null,
    [items, payload.item],
  );

  function updatePayload(next: BackendProductPayload) {
    setPayload(next);
    setPayloadText(JSON.stringify(next, null, 2));
  }

  function parsePayloadText(): BackendProductPayload | null {
    try {
      const parsed = JSON.parse(payloadText) as Record<string, unknown>;
      const item = Number(parsed.item);
      const price = Number(parsed.price);

      if (!Number.isFinite(item) || item <= 0) {
        setError("JSON field 'item' must be a positive number.");
        return null;
      }
      if (!Number.isFinite(price) || price <= 0) {
        setError("JSON field 'price' must be greater than zero.");
        return null;
      }

      return { item, price };
    } catch {
      setError("Payload JSON is invalid. Fix the JSON format and try again.");
      return null;
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!vendorId) {
      setError("Vendor id is missing. Register vendor first.");
      return;
    }

    if (!UUID_RE.test(vendorId)) {
      setError("Stored vendor id is invalid. Register vendor again.");
      return;
    }

    const parsedPayload = parsePayloadText();
    if (!parsedPayload) {
      return;
    }

    setSaving(true);
    try {
      const created = await createVendorProduct(vendorId, parsedPayload);
      const listingId = String(created.id ?? "");
      setMessage(listingId ? `Product created successfully. Listing id: ${listingId}` : "Product created successfully.");
    } catch (err: unknown) {
      if (err instanceof VendorApiError) {
        if (err.status === 401 || err.status === 403) {
          setError("You must sign in with your vendor account before creating products.");
        } else if (err.status === 404) {
          setError("Vendor not found. Register vendor again, then retry.");
        } else {
          setError(err.message);
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to create product.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
      <VendorSidebar />

      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur-md md:ml-64 md:w-[calc(100%-16rem)] md:px-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            className="w-full rounded-xl border-none bg-[#f0f2f4] py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#135bec]/20"
            placeholder="Search items..."
            type="text"
          />
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link className="transition-colors hover:text-[#135bec]" href="/admin/vendor/products">
              Products
            </Link>
            <ChevronRight size={12} />
            <span className="text-slate-600">New Product</span>
          </nav>

          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Create Product Listing</h1>
          <p className="mb-6 text-slate-500">Form fields now match backend schema exactly: item and price.</p>

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            Vendor id: <span className="font-semibold text-slate-800">{vendorId || "Not found"}</span>
          </div>

          <form className="space-y-6 rounded-xl bg-white p-8 shadow-sm" onSubmit={onSubmit}>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Item ID (Backend)</label>
              <input
                className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                min="1"
                onChange={(event) => updatePayload({ ...payload, item: Number(event.target.value) })}
                placeholder="Enter numeric item id (e.g. 1)"
                required
                step="1"
                type="number"
                value={Number.isFinite(payload.item) ? payload.item : ""}
              />
              <p className="mt-2 text-xs text-slate-500">This maps directly to backend field: item.</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Select From Catalog (Optional)</label>
              <select
                className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                disabled={itemsLoading || items.length === 0}
                onChange={(event) => updatePayload({ ...payload, item: Number(event.target.value) })}
                value={Number.isFinite(payload.item) ? String(payload.item) : ""}
              >
                {itemsLoading ? <option value="">Loading items...</option> : null}
                {!itemsLoading && items.length === 0 ? <option value="">No items found - use Item ID above</option> : null}
                {items.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name} ({item.unit})
                  </option>
                ))}
              </select>
              {itemsLoadError ? <p className="mt-2 text-xs text-amber-700">{itemsLoadError}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Price (ETB)</label>
              <input
                className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                min="0"
                onChange={(event) => updatePayload({ ...payload, price: Number(event.target.value) })}
                placeholder="0.00"
                required
                step="0.01"
                type="number"
                value={Number.isFinite(payload.price) ? payload.price : ""}
              />
              <p className="mt-2 text-xs text-slate-500">This maps directly to backend field: price.</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">JSON Payload (Exact Backend Insert)</label>
              <textarea
                className="w-full resize-y rounded-lg border-none bg-[#f0f2f4] px-4 py-3 font-mono text-xs leading-5 focus:ring-2 focus:ring-[#135bec]/20"
                onChange={(event) => setPayloadText(event.target.value)}
                rows={8}
                value={payloadText}
              />
              <p className="mt-2 text-xs text-slate-500">Edit this JSON directly if you want manual insert control.</p>
            </div>

            {selectedItem ? (
              <div className="rounded-lg border border-[#135bec]/20 bg-[#e2e6ff]/30 p-3 text-xs text-slate-700">
                <p>
                  Selected item: <span className="font-semibold">{selectedItem.name}</span>
                </p>
                <p>
                  Category: <span className="font-semibold">{selectedItem.category}</span>
                </p>
                <p>
                  Unit: <span className="font-semibold">{selectedItem.unit}</span>
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Link
                className="rounded-xl bg-[#f0f2f4] px-6 py-2.5 text-sm font-semibold text-slate-700"
                href="/admin/vendor/products"
              >
                Cancel
              </Link>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#135bec] px-8 py-2.5 text-sm font-bold text-white"
                disabled={saving || !vendorId}
                type="submit"
              >
                <CheckCircle2 size={16} />
                {saving ? "Saving..." : "Create Listing"}
              </button>
            </div>
          </form>

          {message ? <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <div className="mt-6 flex gap-4 rounded-xl border border-slate-300/30 bg-[#e2e6ff]/20 p-4">
            <Info className="text-[#135bec]" size={18} />
            <p className="text-xs leading-relaxed text-slate-600">
              Backend insert payload format: {`{"item": 1, "price": 125.5}`}. Use an item id from /api/market/items/.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
