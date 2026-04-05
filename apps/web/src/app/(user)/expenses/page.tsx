"use client";

import { Button } from "@repo/ui/components/button";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  Plus,
  Receipt,
  Tag,
  TrendingDown
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useExpenseStore, type ExpenseStoreState } from "./expenseStore";
import type { Expense } from "./expenseService";

export default function ExpensesPage() {
  const expenses = useExpenseStore((state: ExpenseStoreState) => state.expenses);
  const isLoading = useExpenseStore((state: ExpenseStoreState) => state.isLoading);
  const loadExpenses = useExpenseStore((state: ExpenseStoreState) => state.loadExpenses);

  // Load expenses on mount
  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      {/* Header section with Stats */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Expenses</h1>
          <p className="mt-2 text-lg text-slate-500">
            You have logged <span className="font-semibold text-slate-900">{expenses.length}</span> transactions.
          </p>
        </div>
        <Button className="h-12 bg-slate-900 px-6 text-white hover:bg-slate-800" asChild>
          <Link href="/expenses/new">
            <Plus className="mr-2 h-5 w-5" />
            Log New Expense
          </Link>
        </Button>
      </div>

      {expenses.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          <div className="mb-4 rounded-full bg-slate-50 p-4">
            <Receipt className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">No expenses found</h3>
          <p className="mt-2 max-w-sm text-slate-500">
            Start tracking your spending by adding your first expense today.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/expenses/new">Create first entry</Link>
          </Button>
        </div>
      ) : (
        /* Expenses List */
        <div className="grid gap-4">
          {expenses.map((expense: Expense) => (
            <div 
              key={expense.id}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4 sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">
                    {expense.title}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {expense.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {expense.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4 sm:mt-0 sm:border-0 sm:pt-0">
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">
                    {formatCurrency(expense.amount)}
                  </p>
                  {expense.notes && (
                    <p className="mt-0.5 text-xs text-slate-400 italic truncate max-w-[150px]">
                      {expense.notes}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="ml-4 text-slate-300 hover:text-slate-900" asChild>
                   <Link href={`/expenses/${expense.id}`}>
                      <ArrowRight className="h-5 w-5" />
                   </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}