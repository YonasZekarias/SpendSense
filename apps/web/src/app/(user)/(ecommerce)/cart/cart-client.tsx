"use client";

import { useState, useTransition } from "react";
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowRight, Lightbulb,
  TrendingDown, ShieldCheck, HeadphonesIcon, AlertTriangle,
  CheckCircle2, PiggyBank, TrendingUp, Package, Tag,
} from "lucide-react";
import { addToCart } from "@/actions/ecommerce";
import type { CartItem } from "@/lib/ecommerce-types";
import type { BudgetRecord, BudgetSummary, BudgetSummaryCategory } from "@/types/finance";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { Card, CardContent } from "@repo/ui/components/card";
import { toast } from "sonner";
import Link from "next/link";

// ─── constants ─────────────────────────────────────────────────────────────
const DELIVERY_FEE = 50;

// ─── helpers ───────────────────────────────────────────────────────────────
function groupByVendor(items: CartItem[]): Map<string, CartItem[]> {
  const map = new Map<string, CartItem[]>();
  for (const item of items) {
    const g = map.get(item.vendor_id) ?? [];
    g.push(item);
    map.set(item.vendor_id, g);
  }
  return map;
}

// ─── sub-components ────────────────────────────────────────────────────────
function PriceChangeBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 1) return null;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
      up ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
         : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    }`}>
      {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {up ? "+" : ""}{pct.toFixed(1)}% vs when added
    </span>
  );
}

function BudgetWarning({ pct, label }: { pct: number; label: string }) {
  if (pct < 80) return null;
  const over = pct >= 100;
  return (
    <div className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${
      over
        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40"
        : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
    }`}>
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>
        <strong>{label}</strong> {over ? "will exceed" : "will reach"} {pct.toFixed(0)}% of budget
      </span>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={bold ? "font-bold" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-extrabold text-primary" : "font-bold"}>{value}</span>
    </div>
  );
}

// ─── props ─────────────────────────────────────────────────────────────────
interface CartClientProps {
  initialItems: CartItem[];
  budget: BudgetRecord | null;
  summary: BudgetSummary | null;
}

// ─── main client component ─────────────────────────────────────────────────
export function CartClient({ initialItems, budget, summary }: CartClientProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [, startTransition] = useTransition();

  // ── mutations ──────────────────────────────────────────────────────────

  const adjustQty = (item: CartItem, delta: number) => {
    const next = item.quantity + delta;
    if (next < 1) { removeItem(item.listing_id); return; }

    // Optimistic update
    setItems(prev => prev.map(i =>
      i.listing_id === item.listing_id && i.vendor_id === item.vendor_id
        ? { ...i, quantity: next }
        : i
    ));

    // Sync with server only on increment
    if (delta > 0) {
      startTransition(async () => {
        try {
          const updated = await addToCart({
            listing_id: item.listing_id,
            vendor_id: item.vendor_id,
            vendor_name: item.vendor_name,
            item_name: item.item_name,
            unit: item.unit,
            quantity: delta,
            unit_price: item.unit_price,
          });
          setItems(updated.items);
        } catch {
          toast.error("Failed to update quantity — please try again.");
          // Revert
          setItems(prev => prev.map(i =>
            i.listing_id === item.listing_id && i.vendor_id === item.vendor_id
              ? { ...i, quantity: item.quantity }
              : i
          ));
        }
      });
    }
  };

  const removeItem = (listingId: number) => {
    setItems(prev => prev.filter(i => i.listing_id !== listingId));
    toast.success("Item removed from cart");
  };

  // ── derived values ─────────────────────────────────────────────────────

  const groups     = groupByVendor(items);
  const subtotal   = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const delivery   = groups.size * DELIVERY_FEE;
  const tax        = subtotal * 0.08;
  const grandTotal = subtotal + delivery + tax;

  // Budget impact
  const budgetTotal  = budget ? parseFloat(budget.total_limit) : 0;
  const currentSpent = summary ? parseFloat(summary.total_spent) : 0;
  const cartPct      = budgetTotal > 0 ? ((currentSpent + subtotal) / budgetTotal) * 100 : 0;
  const cartOnlyPct  = budgetTotal > 0 ? (subtotal / budgetTotal) * 100 : 0;

  type CategoryImpact = {
    name: string;
    pctAfter: number;
    cat: BudgetSummaryCategory;
  };

  const categoryImpact: CategoryImpact[] = summary?.by_category.map(cat => {
    const catSpend = items
      .filter(i =>
        i.item_name.toLowerCase().includes(cat.category_name.toLowerCase()) ||
        cat.category_name.toLowerCase().includes("food") ||
        cat.category_name.toLowerCase().includes("grocery")
      )
      .reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const currentCatSpent = parseFloat(cat.spent);
    const limit = parseFloat(cat.limit_amount);
    return {
      name: cat.category_name,
      pctAfter: limit > 0 ? ((currentCatSpent + catSpend) / limit) * 100 : 0,
      cat,
    };
  }) ?? [];

  // ── render ─────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* LEFT: Vendor-grouped items */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 flex flex-col items-center text-center gap-3">
              <Package className="w-12 h-12 text-muted-foreground/40" />
              <p className="font-semibold text-lg">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Browse vendors to add items.</p>
              <Button asChild className="mt-2">
                <Link href="/vendors">Browse Market</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          Array.from(groups.entries()).map(([vendorId, vendorItems]) => {
            const vendorSubtotal = vendorItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
            const vendorName = vendorItems[0]?.vendor_name ?? `Vendor #${vendorId.slice(0, 8)}…`;
            const avatarLetter = vendorName.charAt(0).toUpperCase();

            return (
              <Card key={vendorId} className="border shadow-sm overflow-hidden">
                {/* Vendor header */}
                <div className="px-5 py-3 bg-muted/50 border-b flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {avatarLetter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{vendorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {vendorItems.length} item{vendorItems.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/vendors/${vendorId}`}
                    className="text-xs text-blue-600 hover:underline shrink-0"
                  >
                    View store →
                  </Link>
                </div>

                {/* Items */}
                <div className="divide-y">
                  {vendorItems.map(item => (
                    <div key={item.listing_id} className="flex items-start gap-4 p-5">
                      {/* Image placeholder */}
                      <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 text-primary/30">
                        <ShoppingCart className="w-7 h-7" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-semibold text-sm leading-tight">{item.item_name}</p>
                            {item.vendor_name && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                {item.vendor_name}
                              </span>
                            )}
                            <p className="text-xs text-muted-foreground mt-1.5">
                              ETB {item.unit_price.toFixed(2)} / {item.unit ?? "unit"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-extrabold text-base">
                              ETB {(item.unit_price * item.quantity).toFixed(2)}
                            </p>
                            {/* Price change badge — 0% for now; extend when stored_price added */}
                            <PriceChangeBadge pct={0} />
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center bg-secondary rounded-lg overflow-hidden">
                            <button
                              onClick={() => adjustQty(item, -1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-background transition-colors active:scale-90"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="px-3 font-bold text-sm min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => adjustQty(item, 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-background transition-colors active:scale-90"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.listing_id)}
                            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vendor footer */}
                <div className="px-5 py-3 bg-muted/30 border-t flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                  <span className="text-muted-foreground">
                    Subtotal <span className="font-semibold text-foreground">ETB {vendorSubtotal.toFixed(2)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Delivery <span className="font-semibold text-foreground">ETB {DELIVERY_FEE.toFixed(2)}</span>
                  </span>
                  <span className="ml-auto font-bold">
                    Vendor Total: ETB {(vendorSubtotal + DELIVERY_FEE).toFixed(2)}
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* RIGHT: Order summary + budget */}
      <aside className="col-span-12 lg:col-span-4 space-y-5">

        {/* Order Summary */}
        <Card className="border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-extrabold text-base">Order Summary</h3>
          </div>
          <CardContent className="p-6 space-y-3">
            <SummaryRow label={`Subtotal (${items.length} items)`} value={`ETB ${subtotal.toFixed(2)}`} />
            <SummaryRow
              label={`Delivery (${groups.size} vendor${groups.size !== 1 ? "s" : ""})`}
              value={`ETB ${delivery.toFixed(2)}`}
            />
            <SummaryRow label="Infrastructure Tax (8%)" value={`ETB ${tax.toFixed(2)}`} />
            <Separator className="border-dashed" />
            <SummaryRow label="Grand Total" value={`ETB ${grandTotal.toFixed(2)}`} bold />

            <Button className="w-full h-12 rounded-xl font-bold gap-2 mt-2 shadow-md shadow-primary/20" asChild>
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight size={17} />
              </Link>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
              Secure Payment · EthioPay
            </p>
          </CardContent>
        </Card>

        {/* Budget Impact */}
        {(budget || items.length > 0) && (
          <Card className="border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm">Budget Impact</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {budget ? (
                <>
                  {/* Overall bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Monthly Budget</span>
                      <span className="font-semibold">{cartPct.toFixed(0)}% used after cart</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cartPct >= 100 ? "bg-red-500" : cartPct >= 80 ? "bg-amber-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(cartPct, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cart adds{" "}
                      <span className="font-semibold text-foreground">ETB {subtotal.toFixed(2)}</span>
                      {" "}({cartOnlyPct.toFixed(1)}% of your budget)
                    </p>
                  </div>

                  {/* Per-category bars */}
                  {categoryImpact.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        By Category
                      </p>
                      {categoryImpact.slice(0, 4).map(c => (
                        <div key={c.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium truncate max-w-[130px]">{c.name}</span>
                            <span className={
                              c.pctAfter >= 100 ? "text-red-500 font-bold"
                              : c.pctAfter >= 80 ? "text-amber-500 font-bold"
                              : "text-muted-foreground"
                            }>
                              {c.pctAfter.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.pctAfter >= 100 ? "bg-red-500"
                                : c.pctAfter >= 80 ? "bg-amber-500"
                                : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(c.pctAfter, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warnings */}
                  <div className="space-y-2">
                    <BudgetWarning pct={cartPct} label="Total monthly budget" />
                    {categoryImpact
                      .filter(c => c.pctAfter >= 80)
                      .map(c => (
                        <BudgetWarning key={c.name} pct={c.pctAfter} label={c.name} />
                      ))}
                    {cartPct < 80 && (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cart fits within your monthly budget
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <Tag className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">No budget set up yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/budget">Set up Budget</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SpendSense Tip */}
        <div className="relative overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <Lightbulb size={14} fill="currentColor" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">SpendSense Tip</span>
            </div>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              Bundling items per vendor reduces delivery costs. You could save up to{" "}
              <strong>ETB {(delivery * 0.4).toFixed(0)}</strong> by consolidating orders.
            </p>
          </div>
          <TrendingDown className="absolute -right-4 -bottom-4 h-28 w-28 opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
            <ShieldCheck className="text-primary shrink-0" size={16} />
            <span className="text-[10px] font-bold leading-tight">256-bit AES Encryption</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
            <HeadphonesIcon className="text-primary shrink-0" size={16} />
            <span className="text-[10px] font-bold leading-tight">24/7 Expert Support</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
