"use client";

import { MapPin } from "lucide-react";

export function SourcingMap() {
  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#111318] dark:text-white">Sourcing Regions</h3>
        <p className="text-sm text-[#616f89] mt-1">Concentration of premium yields</p>
      </div>

      <div className="flex-1 relative rounded-2xl bg-slate-100 dark:bg-slate-800/50 overflow-hidden min-h-[240px] flex items-center justify-center">
        {/* Placeholder for the Ethiopia map image */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ethiopia_adm_location_map.svg/800px-Ethiopia_adm_location_map.svg.png')] bg-contain bg-center bg-no-repeat grayscale" />
        
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
            <div className="relative h-10 w-10 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-blue-500">
              <MapPin className="size-4 text-blue-500 fill-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-[#1e2330] px-3 py-1.5 rounded-lg shadow-xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black text-[#135bec] uppercase tracking-widest">Primary Source</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Ada'a / Bishoftu</p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="bg-white/80 dark:bg-[#1e2330]/80 backdrop-blur-md p-2 rounded-lg border border-white/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">High Production</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-blue-200" />
              <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Secondary Growth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
