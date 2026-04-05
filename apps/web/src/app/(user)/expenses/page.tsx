"use client";

import { Button } from "@repo/ui/components/button";
import {
    ArrowRight,
    ArrowUpRight,
    Calendar,
    Download,
    Landmark,
    Loader2,
    Printer,
    Receipt,
    Save,
    ShoppingBag,
    Soup,
    Train,
    Wallet,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
    EXPENSE_CATEGORIES,
    type CreateExpenseInput,
    type Expense,
    type ExpenseCategory,
} from "./expenseService";
import { useExpenseStore, type ExpenseStoreState } from "./expenseStore";

export default function ExpensesPage() {
  const expenses = useExpenseStore((state: ExpenseStoreState) => state.expenses);
  const isLoading = useExpenseStore((state: ExpenseStoreState) => state.isLoading);
  const loadExpenses = useExpenseStore((state: ExpenseStoreState) => state.loadExpenses);
  const addExpense = useExpenseStore((state: ExpenseStoreState) => state.addExpense);

  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"All" | ExpenseCategory>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [formState, setFormState] = useState<CreateExpenseInput>({
    title: "",
    amount: 0,
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseDate = (dateValue: string) => new Date(`${dateValue}T00:00:00`);

  const filteredExpenses = useMemo(() => {
    const scoped =
      selectedCategory === "All"
        ? expenses
        : expenses.filter((expense: Expense) => expense.category === selectedCategory);

    return [...scoped].sort((a: Expense, b: Expense) => {
      if (sortBy === "highest") return b.amount - a.amount;
      if (sortBy === "lowest") return a.amount - b.amount;
      if (sortBy === "oldest") return parseDate(a.date).getTime() - parseDate(b.date).getTime();
      return parseDate(b.date).getTime() - parseDate(a.date).getTime();
    });
  }, [expenses, selectedCategory, sortBy]);

  const totalSpent = useMemo(
    () => expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0),
    [expenses],
  );

  const monthlyBudget = 25000;
  const remaining = Math.max(0, monthlyBudget - totalSpent);
  const daysElapsed = Math.max(1, new Date().getDate());
  const dailyAverage = totalSpent / daysElapsed;
  const spentPercent = Math.min(100, (totalSpent / monthlyBudget) * 100);

  const categoryBreakdown = useMemo(() => {
    return EXPENSE_CATEGORIES.map((category) => {
      const amount = expenses
        .filter((expense: Expense) => expense.category === category)
        .reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

      return {
        category,
        amount,
        percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      };
    })
      .filter((entry) => entry.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalSpent]);

  const categoryColorClass = (category: ExpenseCategory) => {
    if (category === "Food") return "bg-orange-50 text-orange-700 border-orange-100";
    if (category === "Transport") return "bg-blue-50 text-blue-700 border-blue-100";
    if (category === "Utilities") return "bg-violet-50 text-violet-700 border-violet-100";
    if (category === "Housing") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (category === "Entertainment") return "bg-pink-50 text-pink-700 border-pink-100";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const categoryIcon = (category: ExpenseCategory) => {
    if (category === "Food") return Soup;
    if (category === "Transport") return Train;
    if (category === "Utilities") return Zap;
    return ShoppingBag;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title.trim() || formState.amount <= 0) return;

    try {
      setIsSaving(true);
      await addExpense({
        title: formState.title.trim(),
        amount: formState.amount,
        category: formState.category,
        date: formState.date,
        notes: formState.notes?.trim() ? formState.notes.trim() : undefined,
      });

      setFormState((prev) => ({
        ...prev,
        title: "",
        amount: 0,
        notes: "",
      }));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-3 text-slate-600">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm font-medium">Loading expenses...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f8] text-[#111318]">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#135bec]/10 text-[#135bec]">
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight">SpendSense</h2>
          </div>
          <div className="hidden items-center gap-9 md:flex">
            <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-[#135bec]" href="#">
              Dashboard
            </Link>
            <span className="text-sm font-bold text-[#135bec]">Expenses</span>
            <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-[#135bec]" href="#">
              Budget
            </Link>
            <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-[#135bec]" href="#">
              Shopping List
            </Link>
          </div>
          <Button className="hidden h-9 bg-[#135bec] px-4 text-white hover:bg-blue-700 md:inline-flex" asChild>
            <Link href="/expenses/new">Add Expense</Link>
          </Button>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Expense Tracker</h1>
            <p className="text-base text-slate-500">
              Track your daily spending in ETB and manage your cost of living.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" className="h-10 border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Total Budget</p>
              <span className="rounded bg-[#135bec]/10 p-1 text-[#135bec]">
                <Landmark className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(monthlyBudget)}</p>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Increased by 10%
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Total Spent</p>
              <span className="rounded bg-orange-100 p-1 text-orange-600">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200">
              <div className="h-1.5 rounded-full bg-orange-500" style={{ width: `${spentPercent}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Remaining</p>
              <span className="rounded bg-emerald-100 p-1 text-emerald-600">
                <Wallet className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(remaining)}</p>
            <p className="mt-1 text-xs text-slate-500">Based on current monthly budget.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Daily Avg.</p>
              <span className="rounded bg-blue-100 p-1 text-blue-600">
                <Calendar className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(dailyAverage)}</p>
            <p className="mt-1 text-xs text-slate-500">Average based on days elapsed this month.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <h3 className="text-lg font-bold">Add New Expense</h3>
              </div>
              <form className="flex flex-col gap-5 p-6" onSubmit={onSubmit}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-[#135bec]/40 transition focus:ring-2"
                    placeholder="e.g. Lunch at Taitu Hotel"
                    value={formState.title}
                    onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Category</label>
                  <select
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-[#135bec]/40 transition focus:ring-2"
                    value={formState.category}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        category: event.target.value as ExpenseCategory,
                      }))
                    }
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Amount (ETB)</label>
                    <input
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-[#135bec]/40 transition focus:ring-2"
                      min={0}
                      placeholder="0"
                      type="number"
                      value={formState.amount || ""}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          amount: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Date</label>
                    <input
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-[#135bec]/40 transition focus:ring-2"
                      type="date"
                      value={formState.date}
                      onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    className="min-h-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-[#135bec]/40 transition focus:ring-2"
                    placeholder="Optional notes"
                    value={formState.notes ?? ""}
                    onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                  />
                </div>

                <Button className="mt-2 h-10 bg-[#135bec] text-white hover:bg-blue-700" disabled={isSaving} type="submit">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Expense
                </Button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                <button
                  className={`h-8 shrink-0 rounded-lg border px-3 text-sm font-medium transition ${
                    selectedCategory === "All"
                      ? "border-[#135bec]/20 bg-[#135bec]/10 text-[#135bec]"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  onClick={() => setSelectedCategory("All")}
                  type="button"
                >
                  View All
                </button>
                {EXPENSE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    className={`h-8 shrink-0 rounded-lg border px-3 text-sm font-medium transition ${
                      selectedCategory === category
                        ? "border-[#135bec]/20 bg-[#135bec]/10 text-[#135bec]"
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select
                  className="h-8 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-700"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as "newest" | "oldest" | "highest" | "lowest")
                  }
                >
                  <option value="newest">Date (Newest)</option>
                  <option value="oldest">Date (Oldest)</option>
                  <option value="highest">Amount (Highest)</option>
                  <option value="lowest">Amount (Lowest)</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-lg font-bold">Recent Transactions</h3>
                <Link className="text-sm font-medium text-[#135bec] hover:underline" href="#">
                  View Full History
                </Link>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Receipt className="mb-2 h-8 w-8 text-slate-400" />
                  <p className="font-medium text-slate-700">No transactions for this filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExpenses.map((expense: Expense) => {
                        const Icon = categoryIcon(expense.category);
                        return (
                          <tr key={expense.id} className="transition-colors hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium">
                              {new Date(expense.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${categoryColorClass(expense.category)}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {expense.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">{expense.title}</td>
                            <td className="px-6 py-4 text-right text-sm font-bold">- {formatCurrency(expense.amount)}</td>
                            <td className="px-6 py-4 text-center">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/expenses/${expense.id}`}>
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 p-4 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-900">1</span> to{" "}
                  <span className="font-semibold text-slate-900">{Math.min(filteredExpenses.length, 10)}</span> of{" "}
                  <span className="font-semibold text-slate-900">{filteredExpenses.length}</span> results
                </p>
                <div className="flex gap-2">
                  <Button className="h-8 border border-slate-200 bg-white px-3 text-sm font-medium text-slate-500" disabled>
                    Previous
                  </Button>
                  <Button className="h-8 border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                    Next
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold">Spending by Category (This Month)</h3>
                <Button variant="ghost" className="h-8 text-sm font-medium text-[#135bec] hover:bg-transparent hover:underline">
                  View Details
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-500">No category data yet.</p>
                ) : (
                  categoryBreakdown.map((entry) => {
                    const Icon = categoryIcon(entry.category);
                    return (
                      <div key={entry.category} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex justify-between">
                            <span className="text-sm font-medium">{entry.category}</span>
                            <span className="text-sm font-medium">{entry.percent}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-[#135bec]" style={{ width: `${entry.percent}%` }} />
                          </div>
                        </div>
                        <div className="w-24 text-right text-sm font-bold">{formatCurrency(entry.amount)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
