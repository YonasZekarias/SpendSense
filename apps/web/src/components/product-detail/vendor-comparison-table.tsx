"use client";

import { VendorPriceComparisonResponse } from "@/types/api/product-details";
import { PriceTrendBadge } from "@/components/shared/price-trend-badge";
import { VendorComparisonCard } from "./vendor-comparison-card";
import { MapPin, Map } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { MapModal } from "@/components/shared/map-modal";

interface VendorComparisonTableProps {
  vendors: VendorPriceComparisonResponse[];
}

export function VendorComparisonTable({ vendors }: VendorComparisonTableProps) {
  const [location, setLocation] = useQueryState("location", { shallow: false });
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Determine best price
  const bestPrice = vendors.length > 0 ? Math.min(...vendors.map(v => v.price)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Vendor Comparison
            <button 
              onClick={() => setIsMapOpen(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-2 bg-blue-50 px-2.5 py-1 rounded-full transition-colors"
            >
              <Map className="w-4 h-4" /> View Map
            </button>
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground font-medium">Filter:</label>
          <select 
            value={location || ""}
            onChange={(e) => setLocation(e.target.value || null)}
            className="border-border bg-background rounded-md text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Locations</option>
            <option value="Addis Ababa">Addis Ababa</option>
            <option value="Adama">Adama</option>
            <option value="Hawassa">Hawassa</option>
            <option value="Dire Dawa">Dire Dawa</option>
          </select>
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="p-8 text-center border rounded-xl bg-card">
          <p className="text-muted-foreground">No vendors currently listing this item in your selected area.</p>
          <p className="text-sm text-muted-foreground mt-1">Expand search radius or check back later.</p>
        </div>
      ) : (
        <>
          {/* Mobile view: Cards */}
          <div className="grid grid-cols-1 md:hidden gap-4">
            {vendors.map(vendor => (
              <VendorComparisonCard 
                key={vendor.vendorId} 
                vendor={vendor} 
                isBestPrice={vendor.price === bestPrice}
              />
            ))}
          </div>

          {/* Desktop view: Table */}
          <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Price / Unit</th>
                  <th className="px-6 py-4">Trend (7D)</th>
                  <th className="px-6 py-4">Distance</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vendors.map((vendor) => {
                  const isBest = vendor.price === bestPrice;
                  return (
                    <tr 
                      key={vendor.vendorId} 
                      className={cn(
                        "group transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                        isBest && "bg-green-50/30 dark:bg-green-900/10"
                      )}
                    >
                      <td className="px-6 py-4 font-medium">
                        <Link href={`/vendors/${vendor.vendorId}`} className="hover:text-primary transition-colors flex items-center gap-2">
                          {vendor.shopName}
                          {isBest && (
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                              Best Deal
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {vendor.location}, {vendor.region}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-base">
                        {vendor.price} <span className="text-xs text-muted-foreground font-normal">ETB</span>
                      </td>
                      <td className="px-6 py-4">
                        <PriceTrendBadge trend={vendor.trend7d} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {vendor.distanceKm ? `${vendor.distanceKm.toFixed(1)} km` : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="View on Map">
                            <MapPin className="w-4 h-4" />
                          </button>
                          <Link 
                            href={`/vendors/${vendor.vendorId}`}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md font-medium text-xs transition-colors"
                          >
                            Go to Shop
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} title="Vendors Map" />
    </div>
  );
}
