import { CheckCircle2, MapPin, ShieldAlert, Store, XCircle } from "lucide-react";
import AdminPanelShell from "../_components/admin-panel-shell";

const queue = [
  { name: "Abyssinia Trading PLC", city: "Addis Ababa", state: "Selecting", applied: "2h ago" },
  { name: "Ethio Telecom Retailer", city: "Bahir Dar", state: "Waiting", applied: "5h ago" },
  { name: "Sheger Agro-Processing", city: "Adama", state: "Waiting", applied: "1d ago" },
];

export default function VendorVerificationPage() {
  return (
    <AdminPanelShell
      activeTab="verification"
      subtitle="Review and approve new vendor business registrations for the Ethiopian market."
      title="Vendor Verification"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Pending Queue ({queue.length})</h3>
            <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">Action Required</span>
          </div>
          {queue.map((item, idx) => (
            <article
              key={item.name}
              className={[
                "cursor-pointer rounded-xl p-5 shadow-sm",
                idx === 0 ? "border-l-4 border-blue-600 bg-white" : "bg-slate-100 hover:bg-slate-200",
              ].join(" ")}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="font-bold text-slate-900">{item.name}</h4>
                <span className="text-[10px] font-bold uppercase text-slate-500">{item.state}</span>
              </div>
              <p className="text-xs text-slate-500">{item.city}</p>
              <p className="mt-3 text-[11px] font-medium text-slate-500">Applied {item.applied}</p>
            </article>
          ))}
        </section>

        <section className="space-y-6 lg:col-span-8">
          <article className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-blue-50/60 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white border border-slate-100">
                  <Store className="text-blue-600" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Abyssinia Trading PLC</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} /> Bole Sub-city, Addis Ababa
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
              <InfoRow label="Owner Name" value="Solomon Teklehaimanot" />
              <InfoRow label="Business TIN" value="0034982104" mono />
              <InfoRow label="Email" value="contact@abyssinia-trading.et" />
              <InfoRow label="Phone" value="+251 911 234 567" />
            </div>
          </article>

          <article className="rounded-xl bg-white p-8 shadow-sm">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-600">Verification Action</h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <textarea
                className="h-28 w-full resize-none rounded-xl border-none bg-slate-100 p-4 text-sm focus:ring-2 focus:ring-red-200"
                placeholder="Reason for rejection (optional for approval)..."
              />
              <div className="flex flex-col justify-end gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white" type="button">
                  <XCircle size={18} /> Reject Application
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white" type="button">
                  <CheckCircle2 size={18} /> Approve Registration
                </button>
              </div>
            </div>
          </article>

          <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
            <ShieldAlert size={18} />
            Verification actions should be audited with reason notes for compliance traceability.
          </div>
        </section>
      </div>
    </AdminPanelShell>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={["font-semibold text-slate-900", mono ? "font-mono" : ""].join(" ")}>{value}</p>
    </div>
  );
}
