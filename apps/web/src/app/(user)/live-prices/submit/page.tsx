"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useAuth } from "@/providers/auth-provider";
import { getItems, submitPrice, type MarketItem } from "@/services/marketService";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const submitSchema = z.object({
  item_id: z.coerce.number().int().positive("Choose an item."),
  price_value: z.coerce.number().positive("Price must be positive."),
  market_location: z.string().trim().min(2, "Market location is required."),
  city: z.string().trim().min(2, "City is required."),
  date_observed: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD."),
});

type SubmitSchema = z.infer<typeof submitSchema>;

export default function SubmitPricePage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SubmitSchema>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      item_id: 0,
      price_value: 0,
      market_location: "",
      city: "",
      date_observed: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    const boot = async () => {
      try {
        setItems(await getItems());
      } catch {
        setError("Unable to load items. Make sure the backend is running.");
      }
    };
    void boot();
  }, []);

  const itemOptions = useMemo(
    () => items.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  );

  const onSubmit = async (values: SubmitSchema) => {
    setError(null);
    if (!accessToken) {
      setError("You must be signed in to submit prices.");
      return;
    }

    try {
      await submitPrice(accessToken, values);
      router.push("/live-prices");
    } catch {
      setError("Unable to submit price right now. Please try again.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Submit a price</h1>
          <p className="text-sm text-muted-foreground">
            Help keep market averages accurate for everyone.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/live-prices">Back</Link>
        </Button>
      </div>

      {error && <AuthFeedback title="Submission failed" message={error} variant="destructive" />}

      <section className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value={0}>Select an item…</option>
                      {itemOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (ETB)</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_observed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date observed</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="market_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Merkato, Shola Market, Atkilt Tera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Addis Ababa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="h-11 w-full" disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? "Submitting…" : "Submit price"}
            </Button>
          </form>
        </Form>
      </section>
    </main>
  );
}

