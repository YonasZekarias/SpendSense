import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MarketItemDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Link href="/market" className="inline-flex items-center gap-2 text-sm font-semibold text-[#135bec]">
        <ArrowLeft className="size-4" />
        Back to Market
      </Link>

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h1 className="text-2xl font-extrabold text-[#111318] dark:text-white">Commodity Detail #{id}</h1>
        <p className="mt-2 text-sm text-[#616f89] dark:text-gray-400">
          Detail route scaffold for historical trends, forecasts, and city-level variance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-base font-bold text-[#111318] dark:text-white">Current Snapshot</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#616f89] dark:text-gray-400">National Avg</span>
              <span className="font-semibold">ETB 8,450</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#616f89] dark:text-gray-400">Weekly Change</span>
              <span className="font-semibold text-red-600">+12.0%</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-base font-bold text-[#111318] dark:text-white">Top Region</h2>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#f0f2f4] px-3 py-2 text-sm dark:bg-slate-800">
            <MapPin className="size-4 text-[#135bec]" />
            Addis Ababa
          </div>
        </div>
      </div>
    </div>
  );
}
