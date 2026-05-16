import { type PriceSubmissionResponse } from "@/types/api/product-details";
import { ThumbsUp, MapPin, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PriceSubmissionsProps {
  submissions: PriceSubmissionResponse[];
}

export function PriceSubmissions({ submissions }: PriceSubmissionsProps) {
  if (submissions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#111318] dark:text-white">Community Prices</h3>
          <p className="text-sm text-[#616f89] mt-1">Recent submissions from local buyers</p>
        </div>
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="h-10 w-10 rounded-full bg-[#135bec]/10 text-[#135bec] flex items-center justify-center font-black text-sm shrink-0">
              {submission.userInitial}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-sm text-[#111318] dark:text-white truncate">{submission.location}</span>
                  {submission.verified && (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  )}
                </div>
                <span className="font-black text-[#111318] dark:text-white whitespace-nowrap">
                  {submission.price.toFixed(2)} <span className="text-[10px] text-[#616f89]">ETB</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-[#616f89]">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> Local Market
                </span>
                <span>{formatDistanceToNow(new Date(submission.date), { addSuffix: true })}</span>
              </div>
              
              <div className="mt-3 flex items-center gap-2">
                <button className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-[#135bec] transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">
                  <ThumbsUp size={10} /> Helpful ({submission.helpfulCount})
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
