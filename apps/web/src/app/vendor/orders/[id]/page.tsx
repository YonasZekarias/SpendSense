"use client";

import {
    ArrowLeft,
    Bell,
    ChevronRight,
    Search
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { VendorSidebar } from "../../_components/vendor-shell";
import { formatMoney, getVendorOrderDetail, VendorOrder } from "../../_lib/vendor-api";

export default function VendorOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = useMemo(() => String(params?.id || ""), [params]);

  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await getVendorOrderDetail(orderId);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order detail");
      } finally {
        setLoading(false);
      }
    }

    void loadOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
      <VendorSidebar />

      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur-md md:ml-64 md:w-[calc(100%-16rem)] md:px-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            className="w-full rounded-xl border-none bg-[#f0f2f4] py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#135bec]/20"
            placeholder="Search orders, clients..."
            type="text"
          />
        </div>
        <button className="relative p-2 text-slate-500 transition hover:text-[#135bec]" type="button">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e73908]" />
        </button>
      </header>

      <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <span>Orders</span>
              <ChevronRight size={14} />
              <span className="text-[#135bec]">Order Detail</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-extrabold tracking-tight">Order #{orderId || "-"}</h2>
              <Link
                href="/admin/vendor/orders"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#135bec] hover:text-[#135bec]"
              >
                <ArrowLeft size={16} />
                Back to Orders
              </Link>
            </div>
          </div>

          {loading ? <p className="mb-4 text-sm text-slate-600">Loading order detail...</p> : null}
          {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          {order ? (
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Amount" value={formatMoney(order.amount, order.currency)} />
                <Detail label="Quantity" value={String(order.quantity || 0)} />
                <Detail label="Status" value={normalizeStatus(order.status) || "pending"} />
                <Detail label="Payment" value={normalizeStatus(order.payment_status) || "unknown"} />
                <Detail label="Delivery" value={normalizeStatus(order.delivery_status) || "unknown"} />
                <Detail label="Listing ID" value={order.listing_id || "N/A"} />
                <Detail label="Vendor ID" value={order.vendor_id || "N/A"} />
                <Detail label="Created At" value={order.created_at || "N/A"} />
                <Detail label="Order ID" value={order.id || "N/A"} />
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function normalizeStatus(value: unknown): string {
  if (typeof value === "string") return value.toLowerCase();
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#f0f2f4]/50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">{value}</p>
    </div>
  );
}
