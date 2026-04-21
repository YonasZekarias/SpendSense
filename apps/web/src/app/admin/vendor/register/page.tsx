"use client";

import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { registerVendor, setStoredVendorId, VendorApiError } from "../_lib/vendor-api";

interface RegisterForm {
  shop_name: string;
  business_type: string;
  city: string;
  address: string;
  contact_phone: string;
  tin_number: string;
  vat_registered: boolean;
  latitude: string;
  longitude: string;
}

const INITIAL_FORM: RegisterForm = {
  shop_name: "Abyssinia Coffee Roasters Ltd.",
  business_type: "Private Limited Company",
  city: "Addis Ababa",
  address: "Bole Road, Mega Building 4th Floor",
  contact_phone: "+251911234567",
  tin_number: "0012345678",
  vat_registered: true,
  latitude: "",
  longitude: "",
};

export default function VendorRegisterPage() {
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [usedDemoMode, setUsedDemoMode] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await registerVendor({
        shop_name: form.shop_name,
        city: form.city,
        address: form.address,
        contact_phone: form.contact_phone,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });

      const vendorId = String(response.id ?? response.vendor_id ?? "");
      if (vendorId) {
        setStoredVendorId(vendorId);
      }

      setSuccessMessage(vendorId ? `Vendor registered. Saved vendor id: ${vendorId}` : "Vendor registered successfully.");
      setUsedDemoMode(false);
    } catch (error) {
      if (error instanceof VendorApiError) {
        const demoId = `VDR-DEMO-${Date.now()}`;
        setStoredVendorId(demoId);
        setUsedDemoMode(true);
        setSuccessMessage(`Backend unavailable, demo vendor created. Saved vendor id: ${demoId}`);
        setErrorMessage(`Backend response: ${error.message}`);
      } else {
        const demoId = `VDR-DEMO-${Date.now()}`;
        setStoredVendorId(demoId);
        setUsedDemoMode(true);
        setSuccessMessage(`Backend unavailable, demo vendor created. Saved vendor id: ${demoId}`);
        setErrorMessage("Unable to register vendor right now. Demo mode activated.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white/80 px-8 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[#135bec]">SpendSense</span>
          <span className="rounded-full bg-[#e2e6ff] px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#00174c]">
            Vendor Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 transition-colors hover:text-[#135bec]" type="button">
            <HelpCircle size={18} />
          </button>
          <div className="h-8 w-px bg-slate-300/50" />
          <Link className="text-sm font-medium text-slate-500 transition-all hover:text-[#135bec]" href="/login">
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center justify-start px-4 pb-24 pt-12 sm:px-6">
        <div className="mb-12 w-full max-w-3xl text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Join the SpendSense Ecosystem</h1>
          <p className="text-lg text-slate-500">Set up your vendor account to start managing orders across Ethiopia.</p>
        </div>

        <div className="mb-12 w-full max-w-2xl">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-300" />
            <StepperStep number="1" label="Business Profile" completed />
            <StepperStep number="2" label="Legal Documents" active />
            <StepperStep number="3" label="Bank Settlement" />
          </div>
        </div>

        <div className="w-full max-w-2xl">
          <div className="overflow-hidden rounded-xl bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-10 opacity-70">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Step 1: Completed</h3>
                <span className="text-emerald-600">✓</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-[#f0f2f4] p-3">
                  <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Entity Name</label>
                  <p className="font-medium">{form.shop_name}</p>
                </div>
                <div className="rounded-lg bg-[#f0f2f4] p-3">
                  <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Business Type</label>
                  <p className="font-medium">{form.business_type}</p>
                </div>
              </div>
            </div>

            <form className="space-y-8" onSubmit={onSubmit}>
              <div className="border-t border-slate-300/60 pt-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-[#e2e6ff] p-2">
                    <span className="text-[#135bec]">📄</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Legal Documents</h2>
                    <p className="text-sm text-slate-500">Regulatory verification for Ethiopian commerce.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold" htmlFor="tin_number">
                      TIN Number (Taxpayer Identification Number)
                    </label>
                    <div className="relative">
                      <input
                        id="tin_number"
                        className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20"
                        placeholder="0012345678"
                        type="text"
                        value={form.tin_number}
                        onChange={(event) => setForm((prev) => ({ ...prev, tin_number: event.target.value }))}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Enter the 10-digit number found on your Ministry of Revenue card.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">TIN Certificate Upload</label>
                    <div className="group mt-1 flex cursor-pointer justify-center rounded-xl border-2 border-dashed border-slate-300 bg-[#f0f2f4]/30 px-6 pb-6 pt-5 transition-colors hover:border-[#135bec]/50">
                      <div className="space-y-1 text-center">
                        <div className="text-4xl text-slate-500 transition-colors group-hover:text-[#135bec]">☁</div>
                        <div className="flex text-sm text-slate-500">
                          <span className="relative cursor-pointer rounded-md font-bold text-[#135bec] hover:text-[#135bec]/80">Upload a file</span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500/70">PDF, PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#f0f2f4] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">🧾</span>
                      <div>
                        <p className="text-sm font-bold">VAT Registered Business?</p>
                        <p className="text-xs text-slate-500">Required for annual turnover &gt; 500k ETB</p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        checked={form.vat_registered}
                        className="peer sr-only"
                        type="checkbox"
                        onChange={(event) => setForm((prev) => ({ ...prev, vat_registered: event.target.checked }))}
                      />
                      <div className="h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:bg-[#135bec] peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="City"
                      type="text"
                      value={form.city}
                      onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    />
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="Contact Phone"
                      type="text"
                      value={form.contact_phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, contact_phone: event.target.value }))}
                    />
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20 sm:col-span-2"
                      placeholder="Address"
                      type="text"
                      value={form.address}
                      onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <button className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800" type="button">
                  <ArrowLeft size={14} />
                  Back
                </button>
                <button
                  className="flex items-center gap-2 rounded-xl bg-[#135bec] px-10 py-3 font-bold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Continue to Bank Details"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>

            {successMessage ? (
              <p className={[
                "mt-4 rounded-lg p-3 text-sm",
                usedDemoMode ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
              ].join(" ")}>{successMessage}</p>
            ) : null}
            {errorMessage ? <p className="mt-2 text-xs text-slate-500">{errorMessage}</p> : null}
          </div>

          <div className="mt-8 flex gap-4 rounded-xl border border-slate-300/30 bg-[#e2e6ff]/20 p-4">
            <Info className="text-[#135bec]" size={18} />
            <div>
              <h4 className="text-sm font-bold text-[#00174c]">Why we need this</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#00174c]/80">
                We verify tax status to ensure smooth fund settlements and VAT compliance.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed -left-20 top-32 -z-10 h-64 w-64 rounded-full bg-[#135bec]/5 blur-3xl" />
      <div className="fixed -right-20 bottom-10 -z-10 h-96 w-96 rounded-full bg-[#485c9a]/5 blur-3xl" />

      <footer className="mt-auto border-t border-slate-300/20 py-8 text-center text-slate-500">
        <p className="text-xs font-medium tracking-tight">© 2024 SpendSense Ethiopia. All rights reserved.</p>
      </footer>
    </div>
  );
}

function StepperStep({ number, label, active, completed }: { number: string; label: string; active?: boolean; completed?: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center">
      <div
        className={[
          "flex h-10 w-10 items-center justify-center rounded-full font-bold shadow-sm",
          completed
            ? "bg-[#135bec] text-white"
            : active
              ? "border-2 border-[#135bec] bg-white text-[#135bec]"
              : "bg-slate-200 text-slate-500",
        ].join(" ")}
      >
        {number}
      </div>
      <span className={[
        "absolute -bottom-7 whitespace-nowrap text-xs font-medium",
        active || completed ? "font-bold text-[#135bec]" : "text-slate-500",
      ].join(" ")}>
        {label}
      </span>
    </div>
  );
      </div>
    </VendorShell>
  );
}
