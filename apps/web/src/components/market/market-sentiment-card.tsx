"use client";

import { TrendingUp, Activity } from "lucide-react";

interface MarketSentimentCardProps {
  sentiment: "High Volatility" | "Stable" | "Rising" | "Falling";
  predictionText: string;
  yearOverYear: number;
}

export function MarketSentimentCard({ sentiment, predictionText, yearOverYear }: MarketSentimentCardProps) {
  return (
    <div className="bg-[#135bec] rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 flex flex-col h-full">
      <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Market Sentiment</p>
      <h3 className="text-2xl font-black mb-4">{sentiment}</h3>
      
      <p className="text-blue-100 text-sm leading-relaxed mb-8 flex-1">
        {predictionText}
      </p>

      <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/10 flex items-center justify-center">
          <Activity className="size-5" />
        </div>
        <div>
          <p className="text-xl font-black">
            {yearOverYear > 0 ? "+" : ""}{yearOverYear}%
          </p>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">vs Last Year</p>
        </div>
      </div>
    </div>
  );
}
