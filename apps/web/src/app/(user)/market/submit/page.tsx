"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { submitPrice } from "@/services/marketService";

export default function SubmitMarketPricePage() {
  const { accessToken } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#111318] dark:text-white">Submit Market Price</h1>
        <p className="mt-2 text-sm text-[#616f89] dark:text-gray-400">
          Crowdsource a new commodity price for verification.
        </p>
      </div>

      <form
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!accessToken) {
            setMessage("You must be logged in.");
            return;
          }
          const fd = new FormData(e.currentTarget);
          setSubmitting(true);
          setMessage(null);
          try {
            await submitPrice(accessToken, {
              item_id: Number(fd.get("item_id")),
              price_value: String(fd.get("price_value") ?? ""),
              market_location: String(fd.get("market_location") ?? ""),
              city: String(fd.get("city") ?? ""),
              date_observed: String(fd.get("date_observed") ?? ""),
            });
            setMessage("Price submitted successfully and sent for moderation.");
            e.currentTarget.reset();
          } catch (error) {
            const detail = error instanceof Error ? error.message : "Failed to submit price.";
            setMessage(detail);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[#111318] dark:text-white">Item ID</span>
            <input
              name="item_id"
              type="number"
              required
              className="h-10 w-full rounded-lg border border-[#dbdfe6] bg-white px-3 dark:border-gray-700 dark:bg-slate-800"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[#111318] dark:text-white">Price Value</span>
            <input
              name="price_value"
              type="number"
              step="0.01"
              required
              className="h-10 w-full rounded-lg border border-[#dbdfe6] bg-white px-3 dark:border-gray-700 dark:bg-slate-800"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-[#111318] dark:text-white">Market Location</span>
          <input
            name="market_location"
            required
            className="h-10 w-full rounded-lg border border-[#dbdfe6] bg-white px-3 dark:border-gray-700 dark:bg-slate-800"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[#111318] dark:text-white">City</span>
            <input
              name="city"
              required
              className="h-10 w-full rounded-lg border border-[#dbdfe6] bg-white px-3 dark:border-gray-700 dark:bg-slate-800"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[#111318] dark:text-white">Date Observed</span>
            <input
              name="date_observed"
              type="date"
              required
              className="h-10 w-full rounded-lg border border-[#dbdfe6] bg-white px-3 dark:border-gray-700 dark:bg-slate-800"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#135bec] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Price"}
        </button>

        {message && (
          <p className="text-sm text-[#616f89] dark:text-gray-400">{message}</p>
        )}
      </form>
    </div>
  );
}
