"use client";

import {
    Bell,
    ChevronRight,
    Search
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VendorSidebar } from "../_components/vendor-shell";
import { formatMoney, getVendorOrders, VendorOrder } from "../_lib/vendor-api";

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const deliveredCount = useMemo(
    () => orders.filter((order) => normalizeStatus(order.status).includes("deliver")).length,
    [orders],
  );

  const pendingCount = useMemo(
    () =>
      orders.filter((order) => {
        const status = normalizeStatus(order.status);
        return status.includes("pending") || status.includes("processing");
      }).length,
    [orders],
  );

  const totalAmount = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
    [orders],
  );

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const data = await getVendorOrders();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, []);

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

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 transition hover:text-[#135bec]" type="button">
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e73908]" />
          </button>
          <div className="mx-1 hidden h-8 w-px bg-slate-300 sm:block" />
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-slate-900">Vendor Team</p>
            <p className="text-[10px] text-slate-500">Orders Console</p>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                <span>Sales</span>
                <ChevronRight size={14} />
                <span className="text-[#135bec]">Orders</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Order Management</h2>
              <p className="mt-1 text-slate-500">Track order flow, fulfillment status, and payment health.</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard label="Total Orders" value={String(orders.length)} />
            <StatCard label="Pending" value={String(pendingCount)} valueClass="text-amber-600" />
            <StatCard label="Delivered" value={String(deliveredCount)} valueClass="text-emerald-600" />
            <StatCard label="Revenue" value={formatMoney(totalAmount)} />
          </div>

          {loading ? <p className="mb-4 text-sm text-slate-600">Loading orders...</p> : null}
          {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f0f2f4] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3">Delivery</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50">
                  {orders.map((order) => {
                    const status = normalizeStatus(order.status) || "pending";
                    return (
                      <tr key={order.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-6 py-4 text-xs font-bold">#{order.id}</td>
                        <td className="px-6 py-4">
                          <Badge text={status} tone={statusTone(status)} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">{normalizeStatus(order.payment_status) || "unknown"}</td>
                        <td className="px-6 py-4 text-xs text-slate-600">{normalizeStatus(order.delivery_status) || "unknown"}</td>
                        <td className="px-6 py-4 text-right text-sm font-bold">{formatMoney(order.amount, order.currency)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            className="inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#135bec] hover:text-[#135bec]"
                            href={`/admin/vendor/orders/${order.id}`}
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && !orders.length ? (
                    <tr>
                      <td className="px-6 py-6 text-sm text-slate-500" colSpan={6}>No orders found.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
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

function statusTone(status: string): "green" | "amber" | "red" {
  if (status.includes("deliver") || status.includes("ship") || status.includes("paid")) return "green";
  if (status.includes("cancel") || status.includes("fail")) return "red";
  return "amber";
}

function StatCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="mb-2 text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className={["text-2xl font-extrabold", valueClass || ""].join(" ")}>{value}</p>
    </div>
  );
}

function Badge({ text, tone }: { text: string; tone: "green" | "amber" | "red" }) {
  const cls =
    tone === "green"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "red"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";

  return <span className={["rounded-full px-2 py-1 text-[10px] font-bold uppercase", cls].join(" ")}>{text}</span>;
}
