"use client";

    Star,
    Store,
    Verified,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
    getCurrentUserProfile,
    getStoredVendorId,
    updateCurrentUserProfile,
    VendorApiError,
    VendorProfile,
} from "../_lib/vendor-api";
import { VendorSidebar } from "../_components/vendor-shell";

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [vendorId, setVendorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setVendorId(getStoredVendorId());

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const data = await getCurrentUserProfile();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updated = await updateCurrentUserProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        income_bracket: profile.income_bracket,
        household_size: profile.household_size,
      });
      setProfile(updated);
      setMessage("Profile updated successfully.");
    } catch (err) {
      if (err instanceof VendorApiError) {
        setError(err.message);
      } else {
        setError("Unable to save profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-sans text-[#111318] antialiased">
      <VendorSidebar />

      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur-md md:ml-64 md:w-[calc(100%-16rem)] md:px-8">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            </main>
          </div>
        );
      }
            <img
              alt="Vendor profile"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-[#135bec]/10"
              src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&h=120&fit=crop"
            />
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] p-4 md:ml-64 md:p-8">
        <form onSubmit={onSave}>
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="flex items-start gap-6">
              <div className="group relative">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-4 ring-white">
                  <img
                    alt="Business logo"
                    className="h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=240&h=240&fit=crop"
                  />
                </div>
                <button className="absolute -bottom-2 -right-2 rounded-xl bg-[#135bec] p-2 text-white shadow-lg transition-transform active:scale-95" type="button">
                  <Pencil size={14} />
                </button>
              </div>

              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    {profile?.full_name || "Tekle Integrated Logistics"}
                  </h2>
                  <span className="flex items-center gap-1 rounded-full bg-[#135bec]/10 px-3 py-1 text-[10px] font-bold text-[#135bec]">
                    <Verified size={12} />
                    VERIFIED VENDOR
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-slate-500">
                  Premier end-to-end supply chain management and regional distribution partner based in Addis Ababa.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="text-[#902e00]" size={16} />
                    <span className="text-sm font-bold">4.9</span>
                    <span className="text-xs text-slate-500">(1.2k Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <CheckCircle2 size={16} />
                    <span className="text-sm">Member since 2018</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="rounded-xl bg-white px-6 py-2.5 font-semibold text-slate-700 shadow-sm transition-all hover:bg-[#f0f2f4]" type="button">
                Preview Public
              </button>
              <button
                className="rounded-xl bg-[#135bec] px-6 py-2.5 font-semibold text-white shadow-md transition-transform active:scale-95"
                disabled={saving}
                type="submit"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {loading ? <p className="mb-4 text-sm text-slate-600">Loading profile...</p> : null}
          {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 space-y-6 lg:col-span-8">
              <section className="rounded-xl bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Business Profile Details</h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#135bec]">Editable Section</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Official Business Name</label>
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      onChange={(event) => setProfile((prev) => (prev ? { ...prev, full_name: event.target.value } : prev))}
                      type="text"
                      value={profile?.full_name || ""}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Business Category</label>
                    <select className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20">
                      <option>Logistics & Supply Chain</option>
                      <option>Manufacturing</option>
                      <option>Retail Distribution</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Business Description</label>
                    <textarea
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      rows={4}
                      value={
                        profile?.income_bracket
                          ? `Income profile: ${profile.income_bracket}. Serving customers in ${profile.city || "major cities"}.`
                          : "Specializing in reliable logistics, distribution, and warehouse coordination across Ethiopia."
                      }
                      onChange={() => undefined}
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Phone</label>
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      onChange={(event) => setProfile((prev) => (prev ? { ...prev, phone: event.target.value } : prev))}
                      type="text"
                      value={profile?.phone || ""}
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="mb-2 block text-xs font-bold uppercase text-slate-500">City</label>
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      onChange={(event) => setProfile((prev) => (prev ? { ...prev, city: event.target.value } : prev))}
                      type="text"
                      value={profile?.city || ""}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Office Locations</h3>
                  <button className="flex items-center gap-1 text-sm font-bold text-[#135bec] hover:underline" type="button">
                    <MapPin size={14} />
                    Add Branch
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <LocationCard
                    badge="HQ"
                    icon={<Building2 size={16} className="text-[#135bec]" />}
                    title="Headquarters (Addis Ababa)"
                    address="Bole Road, Mega Building 4th Floor"
                    phone={profile?.phone || "+251 11 662 4455"}
                  />
                  <LocationCard
                    icon={<Store size={16} className="text-[#485c9a]" />}
                    title="Dire Dawa Branch"
                    address="Industrial Zone Road, Warehouse 4B"
                    phone="+251 25 111 0092"
                  />
                </div>

                <div className="relative mt-6 h-48 overflow-hidden rounded-xl bg-[#f0f2f4]">
                  <img
                    alt="Map preview"
                    className="h-full w-full object-cover opacity-50 grayscale"
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=500&fit=crop"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-xl border border-white bg-white/90 p-4 shadow-lg backdrop-blur">
                      <p className="text-center text-xs font-bold">HQ: {profile?.city || "Addis Ababa"}</p>
                      <p className="text-center text-[10px] text-slate-500">Interactive map loading...</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="col-span-12 space-y-6 lg:col-span-4">
              <div className="relative overflow-hidden rounded-xl bg-[#135bec] p-6 text-white shadow-xl">
                <div className="relative z-10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                      <Verified size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-white/70">Status</p>
                      <p className="text-lg font-bold">Premium Verified</p>
                    </div>
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-white/80">
                    Your business has passed compliance checks and is authorized for high-volume contracts.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Verification Score</span>
                      <span>98%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-[98%] bg-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              </div>

              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-sm font-bold">Client Trust Metrics</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-extrabold">4.9 / 5.0</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Satisfaction rate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-[#135bec]">124</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Contracts Fulfilled</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/50 pt-6">
                    <p className="mb-4 text-xs font-bold">Recent Feedback Summary</p>
                    <div className="space-y-4">
                      <FeedbackRow
                        image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
                        name="Sara M."
                        company="Commercial Bank of Eth"
                        text="Exceptional logistics support. Always on time."
                      />
                      <FeedbackRow
                        image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop"
                        name="Abebe K."
                        company="Safaricom ET"
                        text="Reliable fleet and professional drivers for regional distribution."
                      />
                    </div>
                    <button className="mt-6 w-full rounded-lg py-2 text-xs font-bold text-[#135bec] transition-colors hover:bg-[#135bec]/5" type="button">
                      View All Reviews
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#902e00]/10 bg-[#ffdbcf] p-6">
                <div className="mb-3 flex items-center gap-2 text-[#902e00]">
                  <Lightbulb size={16} />
                  <h4 className="text-sm font-bold uppercase">Growth Tip</h4>
                </div>
                <p className="text-xs leading-relaxed text-[#380d00]">
                  Vendors with detailed branch descriptions receive 35% more inquiries from corporate clients.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                Stored vendor id: <span className="font-semibold text-slate-700">{vendorId || "Not found"}</span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200",
        active
          ? "bg-white font-bold text-[#135bec] shadow-sm"
          : "text-slate-500 hover:bg-[#f0f2f4] hover:text-[#135bec]",
      ].join(" ")}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
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
