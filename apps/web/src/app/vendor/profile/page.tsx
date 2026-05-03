import type { VendorProfile } from "../_lib/vendor-api";
import { apiClient } from "@/lib/api";
import VendorProfileClient from "./VendorProfileClient";

export default async function VendorProfilePage() {
  let profile: VendorProfile | null = null;

  try {
    profile = await apiClient<VendorProfile>({ method: "GET", endpoint: "/api/users/me/" });
  } catch (err) {
    // server-side fetch failed; log and continue — client will render fallback
    console.error("Failed to load profile server-side:", err);
    profile = null;
  }

  return (
    <main className="min-h-[calc(100vh-64px)] p-4 md:ml-64 md:p-8">
      <VendorProfileClient initialProfile={profile} />
    </main>
  );
}

function LocationCard({
  icon,
  title,
  address,
  phone,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  address: string;
  phone: string;
  badge?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-[#f0f2f4]/40 p-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          {icon}
          <div>
            <p className="text-sm font-bold">{title}</p>
            <p className="mt-1 text-xs text-slate-500">{address}</p>
            <p className="text-xs text-slate-500">Phone: {phone}</p>
          </div>
        </div>
        {badge ? <span className="rounded bg-[#dbe1ff] px-2 py-0.5 text-[10px] font-bold text-[#135bec]">{badge}</span> : null}
      </div>
    </div>
  );
}

function FeedbackRow({ image, name, company, text }: { image: string; name: string; company: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[#f0f2f4]">
        <img alt={name} className="h-full w-full object-cover" src={image} />
      </div>
      <div>
        <p className="text-xs font-bold">
          {name} <span className="font-normal text-slate-500">· {company}</span>
        </p>
        <p className="mt-1 text-[11px] text-slate-500">{text}</p>
      </div>
    </div>
  );
}
