"use client";

import { Sun, Truck, Droplets, Info } from "lucide-react";

interface IntelligenceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: "weather" | "logistics" | "supply" | "info";
  time: string;
}

const MOCK_INTEL: IntelligenceItem[] = [
  {
    id: "1",
    title: "Post-harvest season outlook remains stable in central highlands.",
    subtitle: "LOGISTICS WEEKLY",
    icon: "weather",
    time: "2 HOURS AGO"
  },
  {
    id: "2",
    title: "Fuel price adjustment expected to impact transport costs by 4%.",
    subtitle: "MACRO WATCH",
    icon: "logistics",
    time: "YESTERDAY"
  },
  {
    id: "3",
    title: "Secondary harvest in Wollo region exceeding expectations.",
    subtitle: "AGRI REPORTS",
    icon: "supply",
    time: "2 DAYS AGO"
  }
];

export function MarketIntelligenceList() {
  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 shadow-sm h-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#111318] dark:text-white">Market Intelligence</h3>
        <p className="text-sm text-[#616f89] mt-1">Latest updates impacting supply</p>
      </div>

      <div className="space-y-6">
        {MOCK_INTEL.map((item) => (
          <div key={item.id} className="flex gap-4 group cursor-pointer">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
              item.icon === 'weather' ? 'bg-blue-50 border-blue-100 text-blue-500' :
              item.icon === 'logistics' ? 'bg-orange-50 border-orange-100 text-orange-500' :
              'bg-green-50 border-green-100 text-green-500'
            }`}>
              {item.icon === 'weather' && <Sun className="size-6" />}
              {item.icon === 'logistics' && <Truck className="size-6" />}
              {item.icon === 'supply' && <Droplets className="size-6" />}
              {item.icon === 'info' && <Info className="size-6" />}
            </div>
            <div>
              <p className="text-sm font-bold text-[#111318] dark:text-white leading-tight group-hover:text-[#135bec] transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-black text-[#616f89] uppercase tracking-widest">{item.time}</span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">{item.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-black text-[#616f89] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest">
        View Intel Feed
      </button>
    </div>
  );
}
