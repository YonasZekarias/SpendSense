"use client";

import {
    BarChart3,
    Bell,
    CheckCircle2,
    ChevronRight,
    Circle,
    CircleUserRound,
    FileText,
    Image,
    Info,
    LayoutDashboard,
    LogOut,
    Package2,
    Plus,
    Search,
    ShoppingCart,
    Tag,
    Upload,
    Visibility,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createVendorProduct, getStoredVendorId, VendorApiError } from "../../_lib/vendor-api";
import { VendorSidebar } from "../../_components/vendor-shell";

interface ProductForm {
  item_name: string;
  category: string;
  unit: string;
  price_value: string;
  availability: boolean;
  stock_quantity: string;
  description: string;
  compare_price: string;
  featured: boolean;
}

const INITIAL_FORM: ProductForm = {
  item_name: "",
  category: "Textiles & Apparel",
  unit: "",
  price_value: "",
  availability: true,
  stock_quantity: "",
  description: "",
  compare_price: "",
  featured: false,
};

export default function VendorProductCreatePage() {
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [vendorId, setVendorId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setVendorId(getStoredVendorId());
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vendorId) {
      setError("Vendor id is missing. Register vendor first.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await createVendorProduct(vendorId, {
        item_name: form.item_name,
        category: form.category,
        unit: form.unit || "unit",
        price_value: Number(form.price_value),
        availability: form.availability,
      });

      setForm(INITIAL_FORM);
      setMessage("Product created successfully.");
    } catch (err) {
      if (err instanceof VendorApiError) {
        setError(err.message);
      } else {
        setError("Failed to create product.");
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </main>
        </div>
      );
    }
              className="h-9 w-9 rounded-full ring-2 ring-[#135bec]/10"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
            />
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <nav className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link className="transition-colors hover:text-[#135bec]" href="/admin/vendor/products">Products</Link>
              <ChevronRight size={12} />
              <span className="text-slate-600">New Product</span>
            </nav>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">List New Product</h2>
                <p className="mt-1 text-slate-500">Provide details to showcase your product on the SpendSense marketplace.</p>
                <p className="mt-2 text-xs text-slate-500">Vendor id: <span className="font-semibold">{vendorId || "Not found"}</span></p>
              </div>

              <div className="flex gap-3">
                <Link
                  className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all active:scale-95"
                  href="/admin/vendor/products"
                >
                  Cancel
                </Link>
                <button
                  className="rounded-xl bg-[#135bec] px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  form="create-product-form"
                  type="submit"
                >
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </div>
          </div>

          <form className="grid grid-cols-1 gap-6 lg:grid-cols-3" id="create-product-form" onSubmit={onSubmit}>
            <div className="space-y-6 lg:col-span-2">
              <section className="space-y-6 rounded-xl bg-white p-8 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <FileText className="text-[#135bec]" size={18} />
                  General Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Product Name</label>
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-[#135bec]/20"
                      onChange={(event) => setForm((prev) => ({ ...prev, item_name: event.target.value }))}
                      placeholder="e.g. Hand-Woven Ethiopian Cotton Scarf"
                      required
                      type="text"
                      value={form.item_name}
                    />
                    <p className="mt-1 text-[10px] font-medium text-[#135bec]">Required field</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
                      <div className="relative">
                        <select
                          className="w-full cursor-pointer appearance-none rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                          value={form.category}
                        >
                          <option>Textiles & Apparel</option>
                          <option>Home & Decor</option>
                          <option>Traditional Crafts</option>
                          <option>Electronics</option>
                          <option>Food & Spices</option>
                        </select>
                        <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Stock Quantity</label>
                      <div className="relative">
                        <input
                          className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                          onChange={(event) => setForm((prev) => ({ ...prev, stock_quantity: event.target.value }))}
                          placeholder="0"
                          type="number"
                          value={form.stock_quantity}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">UNITS</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Unit</label>
                      <input
                        className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                        onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
                        placeholder="kg, piece, box"
                        required
                        type="text"
                        value={form.unit}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                      <input
                        className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                        onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                        placeholder="Short highlights"
                        type="text"
                        value={form.description}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                    <textarea
                      className="w-full resize-none rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                      onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Describe the product history, materials, and unique features..."
                      rows={6}
                      value={form.description}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl bg-white p-8 shadow-sm">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <Tag className="text-[#135bec]" size={18} />
                  Pricing & Finance
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Base Price (ETB)</label>
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm font-bold transition-all focus:ring-2 focus:ring-[#135bec]/20"
                      onChange={(event) => setForm((prev) => ({ ...prev, price_value: event.target.value }))}
                      placeholder="0.00"
                      required
                      type="number"
                      value={form.price_value}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Compare at Price</label>
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                      onChange={(event) => setForm((prev) => ({ ...prev, compare_price: event.target.value }))}
                      placeholder="0.00"
                      type="number"
                      value={form.compare_price}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#e2e6ff]/30 p-3 text-[11px] text-slate-600">
                  <Info className="text-[#135bec]" size={14} />
                  SpendSense takes a 2.5% transaction fee on every successful sale.
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-xl bg-white p-8 shadow-sm">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <Image className="text-[#135bec]" size={18} />
                  Media
                </h3>

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-[#f0f2f4]/30 p-8 text-center transition-all hover:border-[#135bec]">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#135bec]/10 text-[#135bec] transition-transform group-hover:scale-110">
                    <Upload size={28} />
                  </div>
                  <p className="text-sm font-bold">Click to upload or drag & drop</p>
                  <p className="mt-1 text-[11px] text-slate-400">PNG, JPG up to 10MB</p>
                  <input className="hidden" type="file" />
                </label>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-lg bg-[#f0f2f4] flex items-center justify-center text-slate-300"><Plus size={18} /></div>
                  <div className="aspect-square rounded-lg bg-[#f0f2f4] flex items-center justify-center text-slate-300"><Plus size={18} /></div>
                  <div className="aspect-square rounded-lg bg-[#f0f2f4] flex items-center justify-center text-slate-300"><Plus size={18} /></div>
                </div>
              </section>

              <section className="rounded-xl bg-white p-8 shadow-sm">
                <h3 className="mb-4 text-lg font-bold">Publish Settings</h3>
                <div className="space-y-4">
                  <label className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-[#f0f2f4]">
                    <div className="flex items-center gap-3">
                      <Visibility className="text-slate-400" size={18} />
                      <span className="text-sm font-medium">Public listing</span>
                    </div>
                    <input
                      checked={form.availability}
                      className="h-5 w-10 cursor-pointer appearance-none rounded-full bg-slate-200 transition-all checked:bg-[#135bec]"
                      onChange={(event) => setForm((prev) => ({ ...prev, availability: event.target.checked }))}
                      type="checkbox"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-[#f0f2f4]">
                    <div className="flex items-center gap-3">
                      <Tag className="text-slate-400" size={18} />
                      <span className="text-sm font-medium">Featured product</span>
                    </div>
                    <input
                      checked={form.featured}
                      className="h-5 w-10 cursor-pointer appearance-none rounded-full bg-slate-200 transition-all checked:bg-[#135bec]"
                      onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
                      type="checkbox"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-xl bg-gradient-to-br from-[#135bec] to-blue-700 p-6 text-white shadow-xl shadow-blue-500/30">
                <h4 className="mb-2 flex items-center gap-2 font-bold">
                  <CheckCircle2 size={16} />
                  Ready to list?
                </h4>
                <p className="mb-4 text-[11px] leading-relaxed text-white/90">
                  Ensure your description includes key materials to help customers find your product easier.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <CheckCircle2 size={14} />
                    BASIC INFO COMPLETE
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/60">
                    <Circle size={14} />
                    IMAGE PENDING
                  </div>
                </div>
              </section>

              {message ? <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
              {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
