import { VendorPriceComparisonResponse } from "@/types/api/product-details";
import { PriceTrendBadge } from "@/components/shared/price-trend-badge";
import { MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VendorComparisonCardProps {
  vendor: VendorPriceComparisonResponse;
  isBestPrice: boolean;
}

export function VendorComparisonCard({ vendor, isBestPrice }: VendorComparisonCardProps) {
  return (
    <div className={cn(
      "border p-4 rounded-xl space-y-3 shadow-sm transition-all hover:shadow-md",
      isBestPrice ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "bg-card"
    )}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/vendors/${vendor.vendorId}`} className="font-bold text-lg hover:text-primary transition-colors">
              {vendor.shopName}
            </Link>
            {isBestPrice && (
              <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Best Deal
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {vendor.location}, {vendor.region}
            {vendor.distanceKm !== null && <span className="opacity-70">({vendor.distanceKm.toFixed(1)} km)</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl">{vendor.price}</p>
          <p className="text-xs text-muted-foreground">ETB / {vendor.unit}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t border-border/50">
        <PriceTrendBadge trend={vendor.trend7d} showText />
        
        <div className="flex gap-2">
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition-colors">
            <MapPin className="w-3.5 h-3.5" /> Map
          </button>
          <Link 
            href={`/vendors/${vendor.vendorId}`}
            className="text-xs bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-md font-medium transition-colors"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
