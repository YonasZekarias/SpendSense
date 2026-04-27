"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useAuth } from "@/providers/auth-provider";
import { createApiClient } from "@/lib/finance-utils";

export default function ExpenseNewPage() {
  const router = useRouter();
  const { accessToken, status } = useAuth();
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="flex min-h-60 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Add expense</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Amount (ETB)</label>
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description (optional)</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button
        className="w-full"
        disabled={saving || !accessToken}
        onClick={async () => {
          if (!accessToken) return;
          setSaving(true);
          setError(null);
          try {
            const api = createApiClient(accessToken);
            const { data } = await api.post<{ id: number }>("/api/finance/expenses/", {
              category,
              amount: amount || "0",
              date,
              description: description || undefined,
            });
            router.push(`/expenses/${data.id}/edit`);
          } catch {
            setError("Could not create expense.");
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving…" : "Save expense"}
      </Button>
    </div>
  );
}
