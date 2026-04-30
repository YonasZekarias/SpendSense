"use client";

import {
    Bell,
    ChevronLeft,
    ChevronRight,
    Filter,
    Lightbulb,
    Pencil,
    Plus,
    Search,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VendorSidebar } from "../_components/vendor-shell";
import { formatMoney, getStoredVendorId, getVendorProducts, VendorProduct } from "../_lib/vendor-api";

export default function VendorProductsPage() {
  const [vendorId, setVendorId] = useState("");
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = getStoredVendorId();
    setVendorId(id);

    async function loadProducts() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await getVendorProducts(id);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, []);

  const totalListings = products.length;
  const lowStock = useMemo(() => Math.min(products.length, 18), [products.length]);
  const outOfStock = useMemo(() => products.filter((item) => item.availability === false).length, [products]);
  const inventoryValue = useMemo(
    () => products.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [products],
  );

  const tableRows = useMemo(() => products.slice(0, 8), [products]);

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
      <VendorSidebar />

      <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between bg-white/80 px-4 backdrop-blur-md md:ml-64 md:w-[calc(100%-16rem)] md:px-8">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            className="w-full rounded-xl bg-[#f0f2f4] py-2 pl-10 pr-4 text-sm outline-none ring-0 transition-all focus:ring-2 focus:ring-[#135bec]/20"
            placeholder="Search products, SKUs, or categories..."
            type="text"
          />
        </div>

        <div className="ml-4 flex items-center gap-4">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#f0f2f4]" type="button">
            <Bell className="text-slate-500" size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e73908]" />
          </button>
          <div className="mx-1 h-8 w-px bg-slate-300/60" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-tight">Abebe Balcha</p>
              <p className="text-[10px] font-semibold uppercase text-slate-500">Premium Vendor</p>
            </div>
            <img
              alt="Vendor profile"
              className="h-10 w-10 rounded-full border-2 border-[#135bec]/10 object-cover"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
            />
          </div>
        </div>
      </header>

      <main className="min-h-screen p-4 pt-24 md:ml-64 md:p-8 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <nav className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                <span>Inventory</span>
                <ChevronRight size={14} />
                <span className="text-[#135bec]">All Products</span>
              </nav>
              <h2 className="text-3xl font-extrabold tracking-tight">Product Catalog</h2>
              <p className="mt-1 text-slate-500">Manage your storefront inventory and real-time availability.</p>
              {!vendorId ? <p className="mt-2 text-xs text-amber-700">No vendor id found. Register vendor first.</p> : null}
              {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
            </div>

            <Link
              href="/admin/vendor/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#135bec] px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus size={18} />
              Add New Product
            </Link>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard label="Total Listings" value={String(totalListings)} badge="+4 this week" badgeClass="bg-green-100 text-green-700" />
            <StatCard label="Low Stock Items" value={String(lowStock)} valueClass="text-[#e73908]" badge="Requires Action" badgeClass="bg-red-100 text-red-700" />
            <StatCard label="Out of Stock" value={String(outOfStock)} badge="Archived" badgeClass="bg-[#f0f2f4] text-slate-600" />
            <StatCard
              label="Inventory Value"
              value={(inventoryValue / 1000).toFixed(1) + "k"}
              badge="ETB"
              badgeClass="bg-[#e2e6ff] text-[#135bec]"
            />
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <FilterChip label="All Products" active />
              <FilterChip label="Traditional Wear" />
              <FilterChip label="Leather Goods" />
              <FilterChip label="Handicrafts" />
              <FilterChip label="Spices" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Sort by:</span>
                <select className="cursor-pointer border-none bg-transparent p-0 pr-6 text-[#135bec] outline-none">
                  <option>Recently Added</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Stock Level</option>
                </select>
              </div>
              <button className="rounded-lg p-2 transition-colors hover:bg-[#f0f2f4]" type="button">
                <Filter className="text-slate-500" size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200/50 bg-[#f0f2f4]/40">
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Product Info</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Category</th>
                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-500">Price (ETB)</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Stock Status</th>
                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40">
                  {loading ? (
                    <tr>
                      <td className="px-6 py-6 text-sm text-slate-500" colSpan={5}>Loading products...</td>
                    </tr>
                  ) : null}

                  {!loading && !tableRows.length ? (
                    <tr>
                      <td className="px-6 py-6 text-sm text-slate-500" colSpan={5}>No products returned from /api/ecommerce/vendors/{'{vendor_id}'}/listings/.</td>
                    </tr>
                  ) : null}

                  {tableRows.map((product, idx) => {
                    const preview = [
                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=140&h=140&fit=crop",
                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=140&h=140&fit=crop",
                      "https://images.unsplash.com/photo-1612196808214-b7e239e5f0b4?w=140&h=140&fit=crop",
                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=140&h=140&fit=crop",
                    ][idx % 4];

                    const stockState = product.availability === false ? "Out of Stock" : idx % 3 === 1 ? "Low Stock" : "In Stock";
                    const stockClass = stockState === "Out of Stock"
                      ? "bg-[#e73908]"
                      : stockState === "Low Stock"
                        ? "bg-orange-400"
                        : "bg-green-500";
                    const stockTextClass = stockState === "Out of Stock"
                      ? "text-[#e73908]"
                      : stockState === "Low Stock"
                        ? "text-orange-700"
                        : "text-green-700";

                    return (
                      <tr key={product.id} className="group transition-colors hover:bg-[#f0f2f4]/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-[#f0f2f4]">
                              <img
                                alt={product.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                src={preview}
                              />
                            </div>
                            <div>
                              <p className="mb-0.5 text-sm font-bold leading-tight">{product.title}</p>
                              <p className="font-mono text-[10px] text-slate-500">SKU: ETH-{product.id.slice(0, 6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-[#dbe1ff] px-2 py-1 text-[10px] font-bold text-[#111318]">
                            {product.category || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black italic">{formatMoney(product.price)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={["h-2 w-2 rounded-full", stockClass].join(" ")} />
                            <span className={["text-xs font-bold", stockTextClass].join(" ")}>
                              {stockState}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f2f4] text-slate-500 transition-all hover:bg-[#e2e6ff] hover:text-[#135bec]"
                              href={`/admin/vendor/products/${product.id}/edit`}
                            >
                              <Pencil size={16} />
                            </Link>
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f2f4] text-slate-500 transition-all hover:bg-red-100 hover:text-[#e73908]"
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/40 bg-[#f0f2f4]/20 px-6 py-4">
              <p className="text-xs font-bold text-slate-500">
                Showing {tableRows.length ? 1 : 0}-{tableRows.length} of {totalListings} products
              </p>
              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded bg-[#f0f2f4] text-slate-500/50" type="button">
                  <ChevronLeft size={14} />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded bg-[#135bec] text-xs font-bold text-white" type="button">1</button>
                <button className="flex h-8 w-8 items-center justify-center rounded bg-[#f0f2f4] text-xs font-bold text-slate-600" type="button">2</button>
                <button className="flex h-8 w-8 items-center justify-center rounded bg-[#f0f2f4] text-xs font-bold text-slate-600" type="button">3</button>
                <button className="flex h-8 w-8 items-center justify-center rounded bg-[#f0f2f4] text-slate-500" type="button">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#135bec] to-[#2f4380] p-6 text-white shadow-xl shadow-blue-500/10">
            <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                <Lightbulb size={20} />
              </div>
              <div className="text-center md:text-left">
                <h4 className="mb-1 text-lg font-bold">Growth Tip: Enhance your Product Visuals</h4>
                <p className="max-w-2xl text-sm text-white/80">
                  Products with at least 3 high-resolution images see a 40% higher conversion rate among Ethiopian shoppers.
                </p>
              </div>
              <button className="whitespace-nowrap rounded-xl bg-white px-5 py-2 text-xs font-bold text-[#135bec] transition-colors hover:bg-[#f0f2f4] md:ml-auto" type="button">
                Learn More
              </button>
            </div>
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
            <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/5" />
          </div>
        </div>
      </main>
    </div>
  );
}

function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={[
        "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
        active ? "bg-[#135bec] text-white" : "bg-[#f0f2f4] text-slate-500 hover:bg-slate-300/40",
      ].join(" ")}
      type="button"
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  badge,
  badgeClass,
  valueClass,
}: {
  label: string;
  value: string;
  badge: string;
  badgeClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-transparent bg-white p-5 transition-all hover:border-[#135bec]/20">
      <p className="mb-2 text-xs font-bold uppercase text-slate-500">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={["text-2xl font-black italic", valueClass || ""].join(" ")}>{value}</span>
        <span className={["rounded-full px-1.5 py-0.5 text-[10px] font-bold", badgeClass].join(" ")}>{badge}</span>
      </div>
    </div>
  );
}
