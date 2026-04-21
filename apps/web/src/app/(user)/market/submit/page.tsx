"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { CategoryPills } from "@/components/market/category-pills";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/providers/auth-provider";
import { getItems, submitPrice, type MarketItem } from "@/services/marketService";

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

export default function SubmitMarketPricePage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  const selectedItemId = useWatch({ control: form.control, name: "item_id" });

  useEffect(() => {
    const boot = async () => {
      try {
        setItems(await getItems());
      } catch {
        setError("Unable to load market items. Please make sure the API is running.");
      }
    };
    void boot();
  }, []);

  const itemOptions = useMemo(() => {
    const scoped = selectedCategory
      ? items.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase())
      : items;
    return scoped.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [items, selectedCategory]);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === Number(selectedItemId)) ?? null;
  }, [items, selectedItemId]);

  const onSubmit = async (values: SubmitSchema) => {
    setError(null);
    setSuccessMessage(null);

    if (!accessToken) {
      setError("You must be signed in to submit prices.");
      return;
    }

    try {
      await submitPrice(accessToken, values);
      setSuccessMessage("Price submitted successfully and sent for moderation.");
      form.reset({
        ...form.getValues(),
        item_id: values.item_id,
        price_value: 0,
        market_location: "",
      });
    } catch (submitError) {
      const detail = submitError instanceof Error ? submitError.message : "Failed to submit price.";
      setError(detail);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111318] dark:text-white">Submit Market Price</h1>
          <p className="mt-2 text-sm text-[#616f89] dark:text-gray-400">
            Submit verified field prices to improve trend accuracy for everyone.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/market">Back to Market</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose category and item</CardTitle>
          <CardDescription>
            Categories use `GET /api/market/categories` and items load from `GET /api/market/items/`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />
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

              {selectedItem && (
                <div className="rounded-lg bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">{selectedItem.name}</span> (
                  {selectedItem.category} · {selectedItem.unit})
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price value (ETB)</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="decimal" step="0.01" placeholder="0.00" {...field} />
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

              <div className="flex flex-wrap gap-3">
                <Button className="bg-[#135bec] hover:bg-blue-700" disabled={form.formState.isSubmitting} type="submit">
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Price"}
                </Button>
                {selectedItem && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/market/${selectedItem.id}`)}
                  >
                    View Item Detail
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && <AuthFeedback title="Submission failed" message={error} variant="destructive" />}
      {successMessage && <AuthFeedback title="Submitted" message={successMessage} variant="default" />}
    </div>
  );
}
