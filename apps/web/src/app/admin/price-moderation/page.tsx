import { CheckCircle2, Filter, Plus, XCircle } from "lucide-react";
import AdminPanelShell from "../_components/admin-panel-shell";

const cards = [
  { item: "Coffee (Buna)", market: "Dire Dawa", price: "850.00 ETB", flag: "Outlier" },
  { item: "Teff (White)", market: "Merkato, Addis Ababa", price: "110.00 ETB", flag: "Matched" },
  { item: "Red Pepper (Berbere)", market: "Adama Central Market", price: "320.00 ETB", flag: "Pending" },
];

export default function PriceModerationPage() {
  return (
    <AdminPanelShell
      activeTab="moderation"
      subtitle="Verify crowdsourced market data from user submissions across Ethiopia."
      title="Price Moderation Queue"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Pending: 124</div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white" type="button">
          <Filter size={16} /> Batch AI Verify
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="overflow-hidden rounded-xl bg-white shadow-sm lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 bg-slate-200" />
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Red Onions (Shinkurt)</h3>
                  <p className="text-sm text-slate-500">Shola Market, Addis Ababa</p>
                </div>
                <p className="text-lg font-black text-blue-700">45.00 ETB/kg</p>
              </div>
              <div className="mb-6 space-y-2 text-xs">
                <p>Submitted by: <span className="font-semibold">@abebe_m</span></p>
                <p>Submission Date: <span className="font-semibold">Oct 24, 10:14 AM</span></p>
                <p>Trust Score: <span className="font-semibold text-green-700">98% (High)</span></p>
              </div>
              <div className="flex gap-3">
                <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-3 font-bold text-red-700" type="button">
                  <XCircle size={16} /> Reject
                </button>
                <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white" type="button">
                  <CheckCircle2 size={16} /> Verify
                </button>
              </div>
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-600">Market Context</h4>
            <p className="text-sm">Addis Ababa Avg: <span className="font-black">40.20 ETB</span></p>
            <p className="text-sm">Regional High: <span className="font-black">48.50 ETB</span></p>
          </div>
          <div className="h-48 rounded-xl bg-slate-200 shadow-sm" />
        </aside>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.item} className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="h-40 bg-slate-200" />
            <div className="p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900">{card.item}</h4>
                  <p className="text-xs text-slate-500">{card.market}</p>
                </div>
                <p className="text-sm font-black text-blue-700">{card.price}</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50" type="button">
                  Reject
                </button>
                <button className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white" type="button">
                  Verify
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button className="fixed bottom-8 right-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg" type="button">
        <Plus size={22} />
      </button>
    </AdminPanelShell>
  );
}
