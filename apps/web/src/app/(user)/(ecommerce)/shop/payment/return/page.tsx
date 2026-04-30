"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";

function PaymentReturnInner() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchase_id") || searchParams.get("id");

  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
      <h1 className="text-2xl font-bold">Payment return</h1>
      <p className="text-slate-600">
        {purchaseId
          ? `We are confirming your order (${purchaseId}). You can check status in orders.`
          : "If you completed payment, your order will appear under Orders shortly."}
      </p>
      <Button asChild>
        <Link href="/orders">View orders</Link>
      </Button>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={<div className="text-center text-slate-500">Loading…</div>}
    >
      <PaymentReturnInner />
    </Suspense>
  );
}
