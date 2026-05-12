"use client";

import { updateListingAction } from "@/actions/vendor/listingActions";
import type { MarketCategory, MarketItem, VendorPriceResponse } from "@/types/api/vendor";
import { ChevronDown, ChevronRight, Image as ImageIcon, Info, Upload, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type ProductEditFormProps = {
  productId: string;
  initialItems: MarketItem[];
  initialCategories: MarketCategory[];
  initialProduct: VendorPriceResponse;
};

export default function ProductEditForm({
  productId,
  initialItems,
  initialCategories,
  initialProduct,
}: ProductEditFormProps) {
  const [sourceProduct, setSourceProduct] = useState(initialProduct);
  const initialCategory = initialItems.find((item) => item.id === initialProduct.item)?.category || "";
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategory);
  const [selectedItemId, setSelectedItemId] = useState<number | "">(initialProduct.item);
  const [price, setPrice] = useState<string>(String(initialProduct.price ?? ""));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialProduct.image || null);
  const [saving, setSaving] = useState(false);

  const filteredItems = useMemo(() => {
    if (!selectedCategoryId) return initialItems;
    return initialItems.filter((item) => item.category === selectedCategoryId);
  }, [selectedCategoryId, initialItems]);

  const selectedItem = useMemo(() => {
    return initialItems.find((item) => item.id === selectedItemId) || null;
  }, [selectedItemId, initialItems]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(sourceProduct.image || null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      if (!selectedItemId) {
        toast.error("Please select a product from the catalog.");
        setSaving(false);
        return;
      }

      const priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        toast.error("Enter a valid price greater than zero.");
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("item", String(selectedItemId));
      formData.append("price", String(priceNum));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const result = await updateListingAction(productId, formData);
      if (result.success) {
        setSourceProduct(result.data);
        setSelectedItemId(result.data.item);
        setPrice(String(result.data.price));
        setImageFile(null);
        setImagePreview(result.data.image || null);
        toast.success("Product updated successfully", {
          description: `Listing #${result.data.id} — ${result.data.item_name} at ETB ${result.data.price}`,
        });
      } else {
        toast.error("Failed to update listing", { description: result.message });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update product.";
      toast.error("Something went wrong", { description: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="product-edit-form" onSubmit={onSubmit}>
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link className="transition-colors hover:text-[#135bec]" href="/vendor/products">
            Products
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-600">Edit Product</span>
        </nav>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{sourceProduct.item_name || "Edit Product"}</h2>
            <p className="mt-1 text-slate-500">Update pricing and media for this listing.</p>
          </div>
          <div className="flex gap-3">
            <Link
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-[#f0f2f4]"
              href="/vendor/products"
            >
              Cancel
            </Link>
            <button
              className="flex items-center gap-2 rounded-xl bg-[#135bec] px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#135bec]/20 transition-all hover:bg-[#135bec]/90 disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-6 rounded-xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">General Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Filter By Category</label>
                <div className="relative">
                  <select
                    className="w-full cursor-pointer appearance-none rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      setSelectedItemId("");
                    }}
                  >
                    <option value="">All Categories</option>
                    {initialCategories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Select Product</label>
                <div className="relative">
                  <select
                    className="w-full cursor-pointer appearance-none rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                    required
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">-- Choose Product --</option>
                    {filteredItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            </div>

            {selectedItem ? (
              <div className="rounded-lg border border-blue-100/50 bg-blue-50/50 p-4">
                <p className="text-sm font-bold text-slate-800">{selectedItem.name}</p>
                <p className="text-[11px] font-medium uppercase tracking-tight text-slate-500">
                  Category: {selectedItem.category} • Unit: {selectedItem.unit}
                </p>
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Base Price (ETB)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">ETB</span>
                <input
                  className="w-full rounded-lg border-none bg-[#f0f2f4] py-3 pl-12 pr-4 text-sm font-bold transition-all focus:ring-2 focus:ring-[#135bec]/20"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Info size={12} className="text-[#135bec]" />
                Enter the price per {selectedItem?.unit || sourceProduct.unit || "unit"}.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
              <ImageIcon size={18} className="text-[#135bec]" />
              Product Media
            </h3>

            {imagePreview ? (
              <div className="relative group">
                <div className="aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-500 shadow-sm transition-colors hover:bg-white"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-[#f0f2f4]/30 p-8 text-center transition-all hover:border-[#135bec] hover:bg-white shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#135bec]/10 text-[#135bec] transition-transform group-hover:scale-110 shadow-inner">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-slate-700">Upload Image</p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">JPG, PNG or WEBP (Max 5MB)</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </section>
        </div>
      </div>
    </form>
  );
}
