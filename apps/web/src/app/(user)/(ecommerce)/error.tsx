"use client";

import { EcommerceErrorState } from "@/components/ecommerce/ecommerce-feedback";

type EcommerceRouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function EcommerceRouteError({ error, reset }: EcommerceRouteErrorProps) {
  return (
    <section className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">
      <EcommerceErrorState
        title="Ecommerce route failed"
        message={error.message || "Something went wrong while loading this route."}
      />
      <button
        className="rounded-md border px-4 py-2 text-sm font-medium"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </section>
  );
}
