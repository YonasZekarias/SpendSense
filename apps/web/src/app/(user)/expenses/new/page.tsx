"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { EXPENSE_CATEGORIES } from "../expenseService";
import { useExpenseStore } from "../expenseStore";

const createExpenseSchema = z.object({
  title: z.string().trim().min(2, "Description is required."),
  amount: z.number().positive("Amount must be greater than zero."),
  category: z.enum(EXPENSE_CATEGORIES),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD."),
  notes: z.string().max(300, "Keep notes under 300 characters.").optional().or(z.literal("")),
});

type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;

export default function NewExpensePage() {
  const router = useRouter();
  const addExpense = useExpenseStore((state) => state.addExpense);

  const form = useForm<CreateExpenseSchema>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const onSubmit = async (values: CreateExpenseSchema) => {
    try {
      await addExpense(values);
      router.push("/expenses");
      router.refresh();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      {/* Header Area */}
      <div className="mb-10 flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Log Expense
          </h1>
          <p className="text-lg text-slate-500">
            Enter the details of your transaction below.
          </p>
        </div>
        <Button variant="ghost" className="text-slate-600 hover:text-slate-900" asChild>
          <Link href="/expenses">← Back to list</Link>
        </Button>
      </div>

      {/* Form Container */}
      <div className="bg-white">
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            
            <div className="grid gap-8 md:grid-cols-2">
              
              {/* Left Column: Core Info */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-700">Description</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="What did you spend on?" 
                          {...field} 
                          className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-700">Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                        >
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column: Numbers & Dates */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-700">Amount (ETB)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="h-12 border-slate-200 text-lg font-medium focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-700">Transaction Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bottom Row: Full width notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-700">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4} 
                      placeholder="Add any additional details here..." 
                      {...field} 
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-4 border-t pt-8">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.back()}
                className="h-12 px-8"
              >
                Cancel
              </Button>
              <Button 
                className="h-12 bg-slate-900 px-12 text-white hover:bg-slate-800" 
                disabled={form.formState.isSubmitting} 
                type="submit"
              >
                {form.formState.isSubmitting ? "Processing..." : "Save Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}