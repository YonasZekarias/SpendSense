"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Store,
  ArrowRight,
  ShoppingCart,
  BadgeCheck,
  Star,
  Cpu,
  Utensils,
  Factory,
  Stethoscope,
  HardHat,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import { getMarketItems, getRecommendations, getVendors } from "@/actions/ecommerce";
import type { MarketItem, Recommendation, Vendor } from "@/lib/ecommerce-types";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";

function categoryIcon(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("electronic") || normalized.includes("tech")) return <Cpu size={18} />;
  if (normalized.includes("food") || normalized.includes("grocery")) return <Utensils size={18} />;
  if (normalized.includes("industrial") || normalized.includes("factory")) return <Factory size={18} />;
  if (normalized.includes("health")) return <Stethoscope size={18} />;
  if (normalized.includes("construct")) return <HardHat size={18} />;
  return <Store size={18} />;
}

function recommendationToVendor(row: Recommendation): Vendor {
  return {
    id: row.vendor_id,
    shop_name: row.shop_name,
    city: row.city,
    address: null,
    contact_phone: null,
    latitude: null,
    longitude: null,
    is_verified: true,
    rating_avg: row.rating_avg,
    rating_count: row.rating_count,
    joined_at: new Date().toISOString(),
  };
}

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [deals, setDeals] = useState<Recommendation[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadMarketplace() {
      setLoading(true);
      setError(null);

      try {
        const itemRows = await getMarketItems();
        if (!active) return;
        setItems(itemRows);

        const firstItem = itemRows[0];
        const recs = firstItem ? await getRecommendations({ item_id: firstItem.id, limit: 20 }) : [];
        if (!active) return;
        setDeals(recs);

        try {
          const vendorRows = await getVendors();
          if (!active) return;
          setVendors(vendorRows);
        } catch {
          const deduped = new Map<string, Vendor>();
          recs.forEach((row) => {
            if (!deduped.has(row.vendor_id)) {
              deduped.set(row.vendor_id, recommendationToVendor(row));
            }
          });
          if (active) setVendors(Array.from(deduped.values()));
        }
      } catch {
        if (active) {
          setError("Unable to load marketplace data.");
          setItems([]);
          setDeals([]);
          setVendors([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMarketplace();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category).filter(Boolean))).slice(0, 5);
    return unique.map((name) => ({ name, icon: categoryIcon(name) }));
  }, [items]);

  const displayedDeals = useMemo(() => {
    if (activeCategory === "all") {
      return deals;
    }

    const categoryItems = new Set(
      items.filter((item) => item.category === activeCategory).map((item) => item.id),
    );
    return deals.filter((deal) => categoryItems.has(deal.item_id));
  }, [activeCategory, deals, items]);

  const featuredVendors = vendors.slice(0, 4);
  const strategicDeals = displayedDeals.slice(0, 4);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-8 text-sm text-muted-foreground">Loading marketplace...</div>;
  }

  return (
    <div className="max-w-400 mx-auto p-8 space-y-12">
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 relative rounded-[2.5rem] overflow-hidden bg-primary min-h-110 flex flex-col justify-end p-12 text-white shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[url('/warehouse-bg.jpg')] bg-cover bg-center mix-blend-overlay opacity-30" />
          <div className="relative z-10 space-y-6">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 backdrop-blur-md uppercase tracking-tighter font-bold">
              B2B Marketplace
            </Badge>
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
              Sourcing Ethiopia's<br />Finest Commodities.
            </h2>
            <p className="text-lg text-white/80 max-w-lg font-medium">
              Direct access to verified suppliers across the region. Transparent pricing, secure logistics, and export-grade quality.
            </p>
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 rounded-2xl h-14">
                Browse Catalog <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold px-8 rounded-2xl h-14">
                Verify Business
              </Button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
                <Zap fill="currentColor" size={28} />
              </div>
              <Badge variant="destructive" className="rounded-full px-3 py-1 text-[10px] font-black uppercase">Ending Soon</Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black">{strategicDeals[0]?.item_name ?? "Featured Deal"}</h3>
              <p className="text-muted-foreground text-sm">{strategicDeals[0]?.shop_name ?? "Top supplier pricing from verified vendors."}</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-black text-primary">ETB {Number(strategicDeals[0]?.price ?? 0).toFixed(2)}</span>
                <span className="text-muted-foreground text-xs ml-1 font-bold">/{strategicDeals[0]?.unit ?? "unit"}</span>
              </div>
              <Button size="icon" className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20">
                <ShoppingCart size={20} />
              </Button>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none bg-slate-950 p-8 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">SpendSense Plus</h3>
              <p className="text-slate-400 text-sm">You earned 12,450 points this month.</p>
            </div>
            <div className="space-y-4">
              <Progress value={72} className="h-2 bg-white/10" />
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>72% to Next Tier</span>
                <span className="text-white">Platinum Status</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        <Button className="rounded-2xl h-14 px-8 font-bold text-lg gap-3 shadow-xl shadow-primary/20" onClick={() => setActiveCategory("all")}>
          <Store size={20} /> All Categories
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.name}
            variant="outline"
            onClick={() => setActiveCategory(cat.name)}
            className="rounded-2xl h-14 px-8 font-bold text-lg gap-3 border-muted bg-white dark:bg-slate-900 hover:border-primary hover:text-primary transition-all"
          >
            {cat.icon} {cat.name}
          </Button>
        ))}
      </section>

      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tight">Verified Vendors</h2>
            <p className="text-muted-foreground font-medium">Top rated suppliers with certified logistics and trade history.</p>
          </div>
          <Link href="/shop">
            <Button variant="link" className="text-primary font-black text-lg gap-2">
              View All Vendors <ArrowRight size={20} />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="group rounded-[2rem] border-muted/50 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white dark:bg-slate-900"
            >
              <div className="h-32 bg-slate-100 dark:bg-slate-800 relative">
                <div className="absolute -bottom-8 left-6 w-20 h-20 bg-white dark:bg-slate-950 rounded-2xl p-1 shadow-xl border dark:border-slate-800">
                  <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center">
                    <Store className="text-primary/20" size={32} />
                  </div>
                </div>
              </div>
              <CardContent className="pt-12 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black group-hover:text-primary transition-colors">{vendor.shop_name}</h3>
                    <p className="text-[10px] font-black uppercase text-secondary flex items-center gap-1 mt-1">
                      <BadgeCheck size={12} fill="currentColor" className="text-white" />
                      {vendor.is_verified ? "Verified Exporter" : "Pending Verification"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> {Number(vendor.rating_avg || 0).toFixed(1)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold rounded-lg border-muted">{vendor.city ?? "Unknown City"}</Badge>
                  <Badge variant="outline" className="text-[10px] font-bold rounded-lg border-muted">Vendor</Badge>
                </div>
                <div className="pt-4 border-t border-muted/50 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-bold">
                    Reviews: <span className="text-foreground">{vendor.rating_count}</span>
                  </span>
                  <Link href={`/shop/vendors/${vendor.id}`}>
                    <Button variant="ghost" className="text-primary font-black text-xs uppercase p-0 h-auto hover:bg-transparent">
                      Storefront
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-6">
          <h2 className="text-4xl font-black tracking-tight whitespace-nowrap">Strategic Deals</h2>
          <div className="h-px bg-muted flex-1" />
          <div className="flex gap-3">
            <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-muted"><ChevronLeft size={20} /></Button>
            <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-muted"><ChevronRight size={20} /></Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <Card className="col-span-12 lg:col-span-5 rounded-[3rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <div className="h-72 bg-slate-200 dark:bg-slate-800 relative">
              <Badge className="absolute top-6 left-6 bg-primary text-white font-black px-4 py-2 rounded-xl text-sm">Top Price</Badge>
            </div>
            <CardContent className="p-10 space-y-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-black leading-tight">{strategicDeals[0]?.item_name ?? "Corporate IT Upgrade Bundle"}</h3>
                <p className="text-muted-foreground font-medium">{strategicDeals[0]?.shop_name ?? "Verified vendor"}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground line-through font-bold block">ETB 0.00</span>
                  <span className="text-4xl font-black text-foreground">ETB {Number(strategicDeals[0]?.price ?? 0).toFixed(2)}</span>
                </div>
                <Button className="h-16 w-16 rounded-[1.5rem] shadow-xl shadow-primary/20">
                  <Plus size={28} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategicDeals.slice(1, 4).map((deal) => (
              <Card key={deal.listing_id} className="rounded-3xl border-muted/50 shadow-none hover:shadow-md transition-shadow bg-white dark:bg-slate-900 overflow-hidden">
                <div className="flex p-4 gap-5">
                  <div className="w-28 h-28 bg-muted rounded-2xl shrink-0" />
                  <div className="flex flex-col justify-between py-1 flex-1">
                    <div>
                      <h4 className="font-black text-lg leading-tight">{deal.item_name}</h4>
                      <p className="text-xs text-muted-foreground font-bold mt-1">{deal.shop_name}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-black text-primary">ETB {Number(deal.price).toFixed(2)}</span>
                      <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/5 rounded-xl"><Plus size={20} /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Card className="rounded-3xl border-dashed border-2 border-primary/20 bg-primary/5 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors">
              <div className="text-center p-6 space-y-2">
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <ArrowRight size={24} />
                </div>
                <span className="font-black text-primary text-sm uppercase tracking-widest">Discover More</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && !loading && featuredVendors.length === 0 && (
        <p className="text-sm text-muted-foreground">No vendor data available right now.</p>
      )}
    </div>
  );
}
