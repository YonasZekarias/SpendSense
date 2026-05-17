"use client";

import { VendorPriceComparisonResponse } from "@/types/api/product-details";
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

  // Determine best price (price is a string from the backend)
  const prices = vendors.map(v => parseFloat(v.price)).filter(p => !isNaN(p));
  const bestPrice = prices.length > 0 ? Math.min(...prices) : 0;

  // Filter by location if set
  const filteredVendors = location
    ? vendors.filter(v => v.city.toLowerCase().includes(location.toLowerCase()))
    : vendors;

  // Get unique cities for filter dropdown
  const cities = [...new Set(vendors.map(v => v.city))].sort();

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
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredVendors.length === 0 ? (
        <div className="p-8 text-center border rounded-xl bg-card">
          <p className="text-muted-foreground">No vendors currently listing this item in your selected area.</p>
          <p className="text-sm text-muted-foreground mt-1">Expand search radius or check back later.</p>
        </div>
      ) : (
        <>
          {/* Mobile view: Cards */}
          <div className="grid grid-cols-1 md:hidden gap-4">
            {filteredVendors.map(vendor => (
              <VendorComparisonCard 
                key={`${vendor.vendor_id}-${vendor.id}`} 
                vendor={vendor} 
                isBestPrice={parseFloat(vendor.price) === bestPrice}
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
                  <th className="px-6 py-4 text-right">Price (ETB)</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Verified</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVendors.map((vendor) => {
                  const price = parseFloat(vendor.price);
                  const rating = parseFloat(vendor.rating_avg);
                  const isBest = price === bestPrice;
                  return (
                    <tr 
                      key={`${vendor.vendor_id}-${vendor.id}`}
                      className={cn(
                        "group transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                        isBest && "bg-green-50/30 dark:bg-green-900/10"
                      )}
                    >
                      <td className="px-6 py-4 font-medium">
                        <Link href={`/vendors/${vendor.vendor_id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                          {vendor.vendor_name}
                          {isBest && (
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                              Best Deal
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {vendor.city}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-base">
                        {price.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">ETB</span>
                      </td>
                      <td className="px-6 py-4">
                        {rating > 0 ? `${rating.toFixed(1)} ★` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {vendor.is_verified ? (
                          <span className="text-blue-600 font-medium text-xs">✓ Verified</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Unverified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="View on Map">
                            <MapPin className="w-4 h-4" />
                          </button>
                          <Link 
                            href={`/vendors/${vendor.vendor_id}`}
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
