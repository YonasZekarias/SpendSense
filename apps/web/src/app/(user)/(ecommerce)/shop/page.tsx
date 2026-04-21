"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Verified,
  Star,
  MapPin,
  Filter,
  ArrowRight,
  Computer,
  Shirt,
  Construction,
  Truck,
  Printer,
  Armchair,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Rocket,
  Store,
} from "lucide-react";

import { getMarketItems, getRecommendations, getVendors } from "../../../../actions/ecommerce";
import type { Recommendation, Vendor } from "../../../../lib/ecommerce-types";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";

const CATEGORY_ICONS = {
  "it hardware": <Computer />,
  apparel: <Shirt />,
  construction: <Construction />,
  wholesale: <Truck />,
  services: <Printer />,
  furnishing: <Armchair />,
} as const;

function inferCategory(vendor: Vendor): string {
  const source = `${vendor.shop_name} ${vendor.city ?? ""}`.toLowerCase();
  if (source.includes("tech") || source.includes("it") || source.includes("digital")) return "IT Hardware";
  if (source.includes("textile") || source.includes("fashion") || source.includes("apparel")) return "Apparel";
  if (source.includes("build") || source.includes("construct") || source.includes("engineering")) return "Construction";
  if (source.includes("print") || source.includes("media")) return "Services";
  if (source.includes("furniture") || source.includes("decor")) return "Furnishing";
  return "Wholesale";
}

function iconForCategory(category: string) {
  return CATEGORY_ICONS[category.toLowerCase() as keyof typeof CATEGORY_ICONS] ?? <Store />;
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

export default function VendorDirectory() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadVendors() {
      setLoading(true);
      setError(null);

      try {
        const directVendors = await getVendors();
        if (!active) return;
        setVendors(directVendors);
      } catch {
        try {
          const items = await getMarketItems();
          const firstItem = items[0];
          if (!firstItem) {
            if (active) {
              setVendors([]);
            }
            return;
          }

          const recs = await getRecommendations({ item_id: firstItem.id, limit: 50 });
          if (!active) return;

          const deduped = new Map<string, Vendor>();
          recs.forEach((row) => {
            if (!deduped.has(row.vendor_id)) {
              deduped.set(row.vendor_id, recommendationToVendor(row));
            }
          });
          setVendors(Array.from(deduped.values()));
        } catch {
          if (active) {
            setError("Unable to load vendors.");
            setVendors([]);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadVendors();

    return () => {
      active = false;
    };
  }, []);

  const averageRating = useMemo(() => {
    if (!vendors.length) return 0;
    return vendors.reduce((sum, vendor) => sum + Number(vendor.rating_avg || 0), 0) / vendors.length;
  }, [vendors]);

  const ratingCountTotal = useMemo(
    () => vendors.reduce((sum, vendor) => sum + (vendor.rating_count || 0), 0),
    [vendors],
  );

  if (loading) {
    return <div className="max-w-7xl mx-auto p-8 text-sm text-muted-foreground">Loading vendors...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <span>Market</span>
            <ChevronRight size={12} />
            <span>Verified Vendors</span>
          </nav>
          <h2 className="text-4xl font-black tracking-tighter">Vendor Directory</h2>
          <p className="text-muted-foreground font-medium">Manage relationships with verified local suppliers.</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-bold gap-2">
            <Filter size={16} /> Filters
          </Button>
          <Button variant="outline" className="rounded-xl font-bold gap-2">
            Sort by Rating
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Verified Total",
            val: `${vendors.filter((vendor) => vendor.is_verified).length} Vendors`,
            trend: null,
            icon: <Verified className="text-primary" />,
          },
          {
            label: "Average Rating",
            val: `${averageRating.toFixed(1)} / 5.0`,
            trend: null,
            icon: <Star className="text-tertiary" />,
          },
          {
            label: "Review Count",
            val: `${ratingCountTotal.toLocaleString("en-ET")} Reviews`,
            trend: null,
            icon: <TrendingUp className="text-primary" />,
          },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">{stat.icon}</div>
              {stat.trend && <Badge className="bg-green-50 text-green-700 border-none font-bold">{stat.trend}</Badge>}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-black mt-1">{stat.val}</h3>
          </Card>
        ))}

        <Card className="rounded-2xl bg-primary text-white p-6 shadow-xl relative overflow-hidden group">
          <Rocket className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Premium Program</p>
          <h3 className="text-lg font-bold leading-tight mb-4">Unlock preferred vendor rates</h3>
          <Button className="w-full bg-white text-primary hover:bg-blue-50 font-black rounded-xl">Upgrade</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vendors.map((vendor) => {
          const category = inferCategory(vendor);
          const icon = iconForCategory(category);

          return (
            <Card
              key={vendor.id}
              className="rounded-3xl overflow-hidden border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="h-40 bg-slate-100 relative">
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-xs font-black">
                  <Star size={12} fill="#f59e0b" className="text-amber-500" /> {Number(vendor.rating_avg || 0).toFixed(1)}
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{vendor.shop_name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                      <MapPin size={14} /> {vendor.city ?? "Location unavailable"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-primary border border-slate-100">{icon}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Status</p>
                    <p className="text-xs font-mono font-bold tracking-tighter">{vendor.is_verified ? "Verified" : "Pending"}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Category</p>
                    <p className="text-xs font-bold">{category}</p>
                  </div>
                </div>

                <Link href={`/shop/vendors/${vendor.id}`}>
                  <Button className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-primary text-foreground hover:text-white font-black transition-all gap-2 border-none">
                    View Details <ArrowRight size={16} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loading && !error && vendors.length === 0 && (
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 text-sm text-muted-foreground">No vendors available yet.</CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="flex justify-center items-center gap-2 pt-8">
        <Button variant="outline" size="icon" className="rounded-xl">
          <ChevronLeft size={20} />
        </Button>
        <Button className="rounded-xl font-black px-5">1</Button>
        <Button variant="ghost" className="rounded-xl font-bold">2</Button>
        <Button variant="ghost" className="rounded-xl font-bold">3</Button>
        <span className="px-2 text-muted-foreground font-bold">...</span>
        <Button variant="ghost" className="rounded-xl font-bold">12</Button>
        <Button variant="outline" size="icon" className="rounded-xl">
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}
