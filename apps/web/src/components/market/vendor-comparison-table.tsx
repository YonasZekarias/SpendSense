"use client";

import { Star, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface Vendor {
  id: string;
  name: string;
  logoLetter: string;
  location: string;
  stockLevel: number; // 0 to 100
  stockLabel: string;
  rating: number;
  price: number;
  isLowest?: boolean;
  badge?: string;
}

const MOCK_VENDORS: Vendor[] = [
  {
    id: "1",
    name: "Ada's Agricultural Union",
    logoLetter: "AA",
    location: "Bishoftu, Oromia",
    stockLevel: 75,
    stockLabel: "650 Qt Available",
    rating: 4.9,
    price: 4150,
    isLowest: true,
    badge: "SOURCE DIRECT"
  },
  {
    id: "2",
    name: "EthioGrain Global",
    logoLetter: "EG",
    location: "Addis Ababa, Kality",
    stockLevel: 40,
    stockLabel: "125 Qt Available",
    rating: 4.2,
    price: 4320,
    badge: "WHOLESALE"
  },
  {
    id: "3",
    name: "Selam Multi-Action",
    logoLetter: "SM",
    location: "Debre Zeit",
    stockLevel: 60,
    stockLabel: "450 Qt Available",
    rating: 4.5,
    price: 4280,
    badge: "VERIFIED FARM GROUP"
  }
];

export function VendorComparisonTable() {
  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2a3140] flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#111318] dark:text-white">Vendor Comparison</h3>
          <p className="text-sm text-[#616f89] mt-1">Top verified suppliers for this grade</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-[#135bec] px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Real-time Prices</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#f9fafb] dark:bg-[#252b38] border-b border-[#e5e7eb] dark:border-[#2a3140]">
              <th className="py-4 pl-8 pr-4 text-[10px] font-bold uppercase tracking-widest text-[#616f89]">Supplier</th>
              <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-[#616f89]">Location</th>
              <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-[#616f89]">Stock Level</th>
              <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-[#616f89]">Rating</th>
              <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-[#616f89]">Price / Qt</th>
              <th className="py-4 pr-8 pl-4 text-[10px] font-bold uppercase tracking-widest text-[#616f89] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3140]">
            {MOCK_VENDORS.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-[#252b38]/50 transition-colors group">
                <td className="py-6 pl-8 pr-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#616f89] font-black text-xs shrink-0 border border-slate-200 dark:border-slate-700">
                      {vendor.logoLetter}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111318] dark:text-white">{vendor.name}</p>
                      {vendor.badge && (
                        <span className="text-[8px] font-black bg-blue-50 dark:bg-blue-900/30 text-[#135bec] px-1.5 py-0.5 rounded uppercase tracking-tighter mt-1 inline-block">
                          {vendor.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-6 px-4">
                  <div className="flex items-center gap-1.5 text-sm text-[#616f89]">
                    <MapPin className="size-3.5 shrink-0" />
                    <span>{vendor.location}</span>
                  </div>
                </td>
                <td className="py-6 px-4">
                  <div className="w-32">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-[#616f89] truncate">{vendor.stockLabel}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${vendor.stockLevel > 50 ? 'bg-[#135bec]' : 'bg-orange-500'}`}
                        style={{ width: `${vendor.stockLevel}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-6 px-4">
                  <div className="flex items-center gap-1">
                    <Star className="size-3.5 text-blue-500 fill-blue-500" />
                    <span className="text-sm font-bold text-[#111318] dark:text-white">{vendor.rating}</span>
                  </div>
                </td>
                <td className="py-6 px-4">
                  <div>
                    <p className="text-base font-black text-[#111318] dark:text-white tabular-nums">
                      {vendor.price.toLocaleString()} <span className="text-[10px] font-bold uppercase text-[#616f89]">ETB</span>
                    </p>
                    {vendor.isLowest && (
                      <span className="text-[8px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded uppercase tracking-tighter">Lowest Found</span>
                    )}
                  </div>
                </td>
                <td className="py-6 pr-8 pl-4 text-right">
                  <Button variant="ghost" size="sm" className="text-[#616f89] hover:text-[#135bec] hover:bg-blue-50 font-bold text-xs h-8">
                    View <ExternalLink className="size-3 ml-1.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-[#252b38]/30 text-center border-t border-[#e5e7eb] dark:border-[#2a3140]">
        <button className="text-xs font-bold text-[#135bec] hover:underline uppercase tracking-widest">
          View 8 more vendors
        </button>
      </div>
    </div>
  );
}
