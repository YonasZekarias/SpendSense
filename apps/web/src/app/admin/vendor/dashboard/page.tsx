"use client";

import {
    Activity,
    AlertTriangle,
    Bell,
    CircleUserRound,
    Package,
    Plus,
    Search,
    Star,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    formatMoney,
    getCurrentUserProfile,
    getStoredVendorId,
    getVendorOrders,
    getVendorProducts,
    VendorOrder,
    VendorProduct,
} from "../_lib/vendor-api";
import { VendorSidebar } from "../_components/vendor-shell";

export default function VendorDashboardPage() {
  const [vendorId, setVendorId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = getStoredVendorId();
    setVendorId(id);

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [ordersData, productsData, profileData] = await Promise.all([
          getVendorOrders(),
          id ? getVendorProducts(id) : Promise.resolve([]),
          getCurrentUserProfile().catch(() => null),
        ]);

        setOrders(ordersData);
        setProducts(productsData);
        setProfileName(profileData?.full_name || profileData?.email || "Vendor Team");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
    [orders],
  );

  const activeOrders = useMemo(
    () => orders.filter((order) => (order.status || "").toLowerCase() !== "delivered").length,
    [orders],
  );

  const pendingOrders = useMemo(
    () =>
      orders.filter((order) => {
        const status = normalizeStatus(order.status);
        return status.includes("pending") || status.includes("processing");
      }).length,
    [orders],
  );

  const productReach = useMemo(() => products.length * 427, [products]);

  const salesBars = useMemo(() => {
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals = Array.from({ length: 7 }, () => 0);

    orders.forEach((order) => {
      const createdAt = order.created_at ? new Date(order.created_at) : null;
      const index = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.getDay() : 0;
      totals[index] += Number(order.amount || 0);
    });

    const max = Math.max(...totals, 1);
    return dayLabels.map((day, idx) => ({
      day,
      value: totals[idx],
      height: Math.max(28, Math.round((totals[idx] / max) * 100)),
    }));
  }, [orders]);

  const topProducts = useMemo(() => products.slice(0, 2), [products]);

  const tableOrders = useMemo(() => orders.slice(0, 3), [orders]);

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
      <VendorSidebar />

      <header className="sticky top-0 z-40 h-16 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-md md:ml-64 md:w-[calc(100%-16rem)] md:px-8">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              className="w-full rounded-lg bg-[#f0f2f4] py-2 pl-10 pr-4 text-sm placeholder:text-slate-500/70 focus:outline-none"
              placeholder="Search orders, products, or customers..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 transition hover:text-[#135bec]" type="button">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e73908]" />
            </button>
            <div className="mx-1 hidden h-8 w-px bg-slate-300 sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-slate-900">{profileName || "Vendor Team"}</p>
                <p className="text-[10px] text-slate-500">Live backend store</p>
              </div>
              <img
                alt="Vendor avatar"
                className="h-9 w-9 rounded-full border border-slate-300/40 object-cover shadow-sm"
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Vendor Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back. Here&apos;s what&apos;s happening with your store today.
          </p>
          {vendorId ? (
            <p className="mt-2 text-xs text-slate-500">Vendor ID: <span className="font-semibold">{vendorId}</span></p>
          ) : (
            <p className="mt-2 text-xs text-amber-700">No vendor id found. Register vendor to sync product listings.</p>
          )}
          {error ? <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p> : null}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            badge="+12.5%"
            badgeClass="bg-emerald-100 text-emerald-700"
            iconClass="bg-[#e2e6ff] text-[#135bec]"
            icon={<Wallet size={18} />}
            label="Total Sales"
            value={loading ? "..." : formatMoney(totalRevenue)}
          />
          <MetricCard
            badge={`${pendingOrders || 0} Pending`}
            badgeClass="bg-amber-100 text-amber-700"
            iconClass="bg-[#dbe1ff] text-[#485c9a]"
            icon={<Package size={18} />}
            label="Active Orders"
            value={loading ? "..." : String(activeOrders)}
          />
          <MetricCard
            badge="+4.2k"
            badgeClass="bg-emerald-100 text-emerald-700"
            iconClass="bg-[#ffdbcf] text-[#902e00]"
            icon={<Activity size={18} />}
            label="Product Reach"
            value={loading ? "..." : productReach.toLocaleString()}
          />
          <MetricCard
            badge="Top 5%"
            badgeClass="bg-slate-200 text-slate-700"
            iconClass="bg-[#f0f2f4] text-slate-700"
            icon={<Star size={18} />}
            label="Average Rating"
            value="4.8 / 5.0"
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold">Sales Performance</h3>
              <div className="flex gap-2">
                <button className="rounded-full bg-[#135bec] px-3 py-1 text-xs font-bold text-white" type="button">Weekly</button>
                <button className="rounded-full px-3 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100" type="button">Monthly</button>
              </div>
            </div>

            <div className="flex h-64 items-end justify-between gap-2 px-2">
              {salesBars.map((bar, idx) => (
                <div
                  key={bar.day}
                  className={[
                    "group relative w-full rounded-t-lg transition-all",
                    idx === 4 ? "bg-[#135bec] shadow-lg shadow-blue-500/20" : "bg-[#135bec]/10 hover:bg-[#135bec]/20",
                  ].join(" ")}
                  style={{ height: `${bar.height}%` }}
                >
                  <div className={[
                    "absolute left-1/2 -translate-x-1/2 rounded bg-[#101622] px-2 py-1 text-[10px] text-[#f6f6f8] shadow",
                    idx === 4 ? "-top-10" : "-top-8 opacity-0 transition-opacity group-hover:opacity-100",
                  ].join(" ")}>
                    {idx === 4 ? `Today: ${formatMoney(bar.value)}` : formatMoney(bar.value)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-tight text-slate-500">
              {salesBars.map((bar) => (
                <span key={bar.day}>{bar.day}</span>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <AlertTriangle className="text-[#e73908]" size={18} />
              <h3 className="font-bold">Inventory Alerts</h3>
            </div>

            <div className="space-y-4">
              {topProducts.length ? (
                topProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className={[
                      "flex items-center gap-3 rounded-lg border p-3",
                      idx === 0 ? "border-red-100 bg-red-50/40" : "border-slate-200 bg-[#f0f2f4]",
                    ].join(" ")}
                  >
                    <img
                      alt={product.title}
                      className="h-12 w-12 rounded-lg object-cover"
                      src={idx === 0
                        ? "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=120&h=120&fit=crop"
                        : "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=120&h=120&fit=crop"}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold">{product.title}</p>
                      <p className={[
                        "text-[10px] font-medium",
                        idx === 0 ? "text-red-600" : "text-amber-700",
                      ].join(" ")}>
                        {idx === 0 ? "Only 2 items left" : "5 items left (Low Stock)"}
                      </p>
                    </div>
                    <button
                      className={[
                        "rounded-lg px-3 py-1 text-[10px] font-bold",
                        idx === 0 ? "bg-[#e73908] text-white" : "bg-slate-800 text-white",
                      ].join(" ")}
                      type="button"
                    >
                      {idx === 0 ? "Restock" : "View"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No inventory alerts right now.</p>
              )}

              <div className="border-t border-slate-200 pt-2 text-center">
                <Link className="text-xs font-bold text-[#135bec] hover:underline" href="/admin/vendor/products">
                  Manage All Inventory
                </Link>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="overflow-hidden rounded-xl bg-white shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200/70 p-6">
              <h3 className="font-bold">Recent Orders</h3>
              <Link className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#135bec] transition hover:bg-[#135bec]/5" href="/admin/vendor/orders">
                View Full History
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f0f2f4] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {tableOrders.map((order, idx) => {
                    const initials = ["DA", "SL", "YM"][idx] || "CU";
                    const customer = ["Dawit Alemu", "Sara Lensa", "Yonas Mulu"][idx] || "Customer";
                    const productName = products[idx]?.title || "Store Product";
                    const status = normalizeStatus(order.status) || "processing";
                    const badgeClass = status.includes("deliver")
                      ? "bg-emerald-100 text-emerald-700"
                      : status.includes("ship")
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700";

                    return (
                      <tr key={order.id} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-6 py-4 text-xs font-bold">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dbe1ff] text-[10px] font-bold text-[#00174c]">
                              {initials}
                            </div>
                            <span className="text-xs font-medium">{customer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{productName}</td>
                        <td className="px-6 py-4 text-xs font-bold">{formatMoney(order.amount, order.currency)}</td>
                        <td className="px-6 py-4">
                          <span className={["rounded-full px-2 py-1 text-[10px] font-bold capitalize", badgeClass].join(" ")}>
                            {status || "processing"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && !tableOrders.length ? (
                    <tr>
                      <td className="px-6 py-5 text-sm text-slate-500" colSpan={5}>No recent orders found.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 font-bold">Activity Feed</h3>
            <div className="space-y-6">
              <FeedItem
                color="bg-[#135bec] ring-[#135bec]/10"
                title="New Order Received"
                description={tableOrders[0] ? `Order #${tableOrders[0].id.slice(0, 8).toUpperCase()} has been placed.` : "No new order events yet."}
                time="2 mins ago"
              />
              <FeedItem
                color="bg-amber-500 ring-amber-500/10"
                title="Price Update Required"
                description="Market rates for top products changed by around 4%."
                time="45 mins ago"
              />
              <FeedItem
                color="bg-emerald-500 ring-emerald-500/10"
                title="Payout Successful"
                description="Latest payout has been transferred to your linked account."
                time="3 hours ago"
                last
              />
              <button className="w-full rounded-lg bg-[#f0f2f4] py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-200" type="button">
                Clear Notifications
              </button>
            </div>
          </section>
        </div>
      </main>

      <button className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#135bec] text-white shadow-xl shadow-blue-500/30 transition-transform hover:scale-110 active:scale-95" type="button">
        <Plus size={24} />
      </button>
    </div>
  );
}

function normalizeStatus(value: unknown): string {
  if (typeof value === "string") {
    return value.toLowerCase();
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).toLowerCase();
}

function MetricCard({
  icon,
  iconClass,
  badge,
  badgeClass,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconClass: string;
  badge: string;
  badgeClass: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={["rounded-lg p-2", iconClass].join(" ")}>{icon}</div>
        <span className={["rounded-full px-2 py-1 text-xs font-bold", badgeClass].join(" ")}>{badge}</span>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function FeedItem({
  color,
  title,
  description,
  time,
  last,
}: {
  color: string;
  title: string;
  description: string;
  time: string;
  last?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="relative">
        <div className={["mt-1.5 h-2 w-2 rounded-full ring-4", color].join(" ")} />
        {!last ? <div className="absolute left-1/2 top-4 h-10 w-px -translate-x-1/2 bg-slate-300" /> : null}
      </div>
      <div>
        <p className="text-xs font-bold">{title}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
        <span className="text-[10px] font-medium text-slate-400">{time}</span>
      </div>
    </div>
  );
}
