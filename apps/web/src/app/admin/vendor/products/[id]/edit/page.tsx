"use client";

import { VendorSidebar } from "@/app/admin/vendor/_components/vendor-shell";
import {
    getStoredVendorId,
    getVendorProducts,
    updateVendorProduct,
    VendorApiError,
    VendorProduct,
} from "@/app/admin/vendor/_lib/vendor-api";
import {
    Bell,
    CheckCircle2,
    ChevronRight,
    Image,
    Info,
    Package2,
    Pencil,
    Search,
    Tag,
    Trash2,
    TrendingUp,
    TriangleAlert,
    X
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

interface ProductForm {
  item_name: string;
  description: string;
  category: string;
  unit: string;
  price_value: string;
  discount_price: string;
  stock_quantity: string;
  sku_code: string;
  availability: boolean;
}

export default function VendorProductEditPage() {
  const params = useParams<{ id: string }>();
  const productId = useMemo(() => String(params?.id || ""), [params]);

  const [vendorId, setVendorId] = useState("");
  const [sourceProduct, setSourceProduct] = useState<VendorProduct | null>(null);
  const [form, setForm] = useState<ProductForm>({
    item_name: "",
    description: "",
    category: "",
    unit: "",
    price_value: "",
    discount_price: "",
    stock_quantity: "",
    sku_code: "",
    availability: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const id = getStoredVendorId();
    setVendorId(id);

    async function loadProduct() {
      if (!id || !productId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const products = await getVendorProducts(id);
        const product = products.find((item: VendorProduct) => item.id === productId) || null;
        setSourceProduct(product);

        if (product) {
          setForm({
            item_name: product.title,
            description: `Premium ${product.title} prepared for the local market with consistent quality control.`,
            category: product.category || "",
            unit: product.unit || "",
            price_value: String(product.price || 0),
            discount_price: "",
            stock_quantity: "",
            sku_code: `ETH-${String(product.id).slice(0, 6).toUpperCase()}`,
            availability: product.availability ?? true,
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    void loadProduct();
  }, [productId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const price = Number(form.price_value);
      if (!Number.isFinite(price) || price <= 0) {
        setError("Enter a valid price greater than zero.");
        setSaving(false);
        return;
      }

      await updateVendorProduct(productId, {
        price,
      });
      setMessage("Product updated successfully.");
    } catch (err: unknown) {
      if (err instanceof VendorApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to update product.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
      <VendorSidebar />

      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur-md md:ml-64 md:w-[calc(100%-16rem)] md:px-8">
        <div className="flex w-full max-w-md items-center gap-3 rounded-full bg-[#f0f2f4] px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#135bec]/20">
          <Search className="text-slate-500" size={18} />
          <input
            className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-500"
            placeholder="Search inventory..."
            type="text"
          />
        </div>

        <div className="ml-4 flex items-center gap-4">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#f0f2f4]" type="button">
            <Bell className="text-slate-500" size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e73908]" />
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold leading-tight">Premium Vendor</p>
            <p className="text-[10px] uppercase tracking-tight text-slate-500">Edit Product</p>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)] bg-[#f6f6f8] p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-5xl">
          <form id="product-edit-form" onSubmit={onSubmit}>
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span>Products</span>
                  <ChevronRight size={14} />
                  <span className="text-[#135bec]">Edit Product</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{form.item_name || "Edit Product"}</h2>
              </div>

              <div className="flex gap-3">
                <Link
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition-all hover:bg-[#f0f2f4]"
                  href="/admin/vendor/products"
                >
                  <X size={16} />
                  Discard
                </Link>
                <button
                  className="flex items-center gap-2 rounded-xl bg-[#135bec] px-8 py-2.5 font-bold text-white shadow-sm transition-all active:scale-95"
                  disabled={saving}
                  type="submit"
                >
                  <CheckCircle2 size={16} />
                  {saving ? "Updating..." : "Update Product"}
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
              Vendor id: <span className="font-semibold">{vendorId || "Not found"}</span>
            </div>
            {loading ? <p className="mb-4 text-sm text-slate-600">Loading product...</p> : null}
            {!loading && !sourceProduct ? (
              <p className="mb-4 text-sm text-amber-700">Product {productId} was not found in vendor listing results.</p>
            ) : null}
            {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            {message ? <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

            {sourceProduct ? (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                  <section className="rounded-xl bg-white p-8 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                      <Pencil className="text-[#135bec]" size={18} />
                      General Information
                    </h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Name</label>
                        <input
                          className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 font-medium focus:ring-2 focus:ring-[#135bec]/20"
                          onChange={(event) => setForm((prev) => ({ ...prev, item_name: event.target.value }))}
                          type="text"
                          value={form.item_name}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                        <textarea
                          className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 font-medium leading-relaxed focus:ring-2 focus:ring-[#135bec]/20"
                          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                          rows={5}
                          value={form.description}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="rounded-xl bg-white p-8 shadow-sm">
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                        <TrendingUp className="text-[#135bec]" size={18} />
                        Pricing
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Base Price (ETB)</label>
                          <input
                            className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-xl font-bold focus:ring-2 focus:ring-[#135bec]/20"
                            onChange={(event) => setForm((prev) => ({ ...prev, price_value: event.target.value }))}
                            type="number"
                            value={form.price_value}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Discounted Price</label>
                          <input
                            className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 font-medium focus:ring-2 focus:ring-[#135bec]/20"
                            onChange={(event) => setForm((prev) => ({ ...prev, discount_price: event.target.value }))}
                            type="number"
                            value={form.discount_price}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-8 shadow-sm">
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                        <Package2 className="text-[#135bec]" size={18} />
                        Inventory
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock Quantity</label>
                          <input
                            className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-xl font-bold focus:ring-2 focus:ring-[#135bec]/20"
                            onChange={(event) => setForm((prev) => ({ ...prev, stock_quantity: event.target.value }))}
                            type="number"
                            value={form.stock_quantity}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SKU Code</label>
                          <input
                            className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-[#135bec]/20"
                            onChange={(event) => setForm((prev) => ({ ...prev, sku_code: event.target.value }))}
                            type="text"
                            value={form.sku_code}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-[#e73908]/20 bg-white p-8 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-[#e73908]">
                      <TriangleAlert size={18} />
                      Danger Zone
                    </h3>
                    <div className="flex items-start gap-4 rounded-lg bg-red-100 p-4">
                      <Info className="mt-1 text-[#e73908]" size={18} />
                      <div className="flex-1">
                        <h4 className="font-bold text-[#93000a]">Delete Product</h4>
                        <p className="mb-4 text-sm text-[#93000a]/80">Deleting this product is permanent and cannot be undone.</p>
                        <button className="rounded-lg bg-[#e73908] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700" type="button">
                          Delete This Product
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="rounded-xl bg-white p-8 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                      <Image className="text-[#135bec]" size={18} />
                      Product Media
                    </h3>
                    <div className="space-y-4">
                      <div className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                        <img
                          alt="Product hero"
                          className="h-full w-full object-cover"
                          src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=700&h=700&fit=crop"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#135bec]" type="button">
                            <Pencil size={16} />
                          </button>
                          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#e73908]" type="button">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-[#f0f2f4] text-slate-500 transition-colors hover:bg-slate-200">
                          <Image size={18} />
                          <span className="mt-1 text-[10px] font-bold uppercase">Add</span>
                        </div>
                        <img
                          alt="Thumbnail one"
                          className="aspect-square rounded-lg border border-slate-200 object-cover"
                          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=200&h=200&fit=crop"
                        />
                        <img
                          alt="Thumbnail two"
                          className="aspect-square rounded-lg border border-slate-200 object-cover"
                          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl bg-white p-8 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                      <Tag className="text-[#135bec]" size={18} />
                      Organization
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                        <select
                          className="w-full appearance-none rounded-lg border-none bg-[#f0f2f4] px-4 py-3 font-medium focus:ring-2 focus:ring-[#135bec]/20"
                          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                          value={form.category}
                        >
                          <option>Beverages & Coffee</option>
                          <option>Organic Foods</option>
                          <option>Gourmet Items</option>
                          <option>Handmade Crafts</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tags</label>
                        <div className="flex flex-wrap gap-2 rounded-lg bg-[#f0f2f4] p-3">
                          {[
                            "ORGANIC",
                            "PREMIUM",
                            "EXPORT_QUALITY",
                          ].map((tag) => (
                            <span key={tag} className="flex items-center gap-1 rounded-full bg-[#135bec]/10 px-2 py-1 text-[10px] font-bold text-[#135bec]">
                              {tag}
                              <button className="transition-colors hover:text-[#e73908]" type="button">
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                          <button className="px-2 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:text-[#135bec]" type="button">
                            + ADD TAG
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-bold">Publish Product</span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            checked={form.availability}
                            className="peer sr-only"
                            onChange={(event) => setForm((prev) => ({ ...prev, availability: event.target.checked }))}
                            type="checkbox"
                          />
                          <div className="h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:bg-[#135bec] peer-checked:after:translate-x-full" />
                        </label>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl bg-gradient-to-br from-[#135bec] to-blue-700 p-8 text-white shadow-xl">
                    <div className="mb-4 flex items-center justify-between">
                      <TrendingUp size={28} />
                      <span className="rounded bg-white/20 px-2 py-1 text-[10px] font-bold">30D PERFORMANCE</span>
                    </div>
                    <p className="mb-1 text-sm font-medium text-white/80">Sales Impact</p>
                    <h4 className="mb-4 text-3xl font-bold">+24.8%</h4>
                    <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-[78%] bg-white" />
                    </div>
                    <p className="text-xs leading-relaxed text-white/90">This product is in your top revenue generators. Keep stock above 100 units to maintain momentum.</p>
                  </section>
                </div>
              </div>
            ) : null}

            <footer className="mt-12 flex items-center justify-between border-t border-slate-300/40 pt-8 text-slate-500">
              <div className="flex items-center gap-6">
                <div className="text-[10px] font-bold uppercase tracking-widest">
                  Last edited: <span className="text-slate-900">May 24, 2024 at 14:32</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest">
                  Created: <span className="text-slate-900">Jan 12, 2024</span>
                </div>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-tighter">Product ID: #{productId || "N/A"}</p>
            </footer>
          </form>
        </div>
      </main>
    </div>
  );
}
