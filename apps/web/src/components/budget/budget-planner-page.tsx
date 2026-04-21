"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Loader2, Save, Wallet } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useAuth } from "@/providers/auth-provider";
import {
  createBudget,
  getBudgetSuggestions,
  getBudgetSummary,
  listBudgets,
  listExpenses,
  updateBudget,
  type BudgetCategory,
  type BudgetRecord,
  type BudgetSummary,
  type BudgetSummaryCategory,
  type ExpenseRecord,
} from "@/services/finance";

type EditableCategory = {
  category_name: string;
  limit_amount: string;
};

function money(value: string | number) {
  const amount = typeof value === "string" ? Number.parseFloat(value || "0") : value;
  return Number.isFinite(amount) ? amount.toLocaleString() : "0";
}

function monthLabel(month: number, year: number) {
  const date = new Date(year, Math.max(0, month - 1), 1);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function BudgetPlannerPage() {
  const { status, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [budget, setBudget] = useState<BudgetRecord | null>(null);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [suggestedMonth, setSuggestedMonth] = useState<{ month: number; year: number } | null>(null);
  const [draftCategories, setDraftCategories] = useState<EditableCategory[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  const bootstrap = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [budgets, expensesResult] = await Promise.all([
        listBudgets(accessToken),
        listExpenses(accessToken),
      ]);

      setExpenses(expensesResult.slice(0, 6));

      if (budgets.length > 0) {
        const latestBudget = budgets[0];
        setBudget(latestBudget);
        setSuggestedMonth(null);

        const detail = await getBudgetSummary(accessToken, latestBudget.id);
        setSummary(detail);
        setDraftCategories(
          detail.by_category.map((c) => ({
            category_name: c.category_name,
            limit_amount: c.limit_amount,
          })),
        );
      } else {
        setBudget(null);
        setSummary(null);

        const now = new Date();
        const suggestion = await getBudgetSuggestions(accessToken, {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });

        setSuggestedMonth({ month: suggestion.month, year: suggestion.year });
        setDraftCategories(
          suggestion.categories.map((c) => ({
            category_name: c.category_name,
            limit_amount: c.limit_amount,
          })),
        );
      }
    } catch {
      setError("Unable to load your finance data right now.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      void bootstrap();
    }
  }, [status, bootstrap]);

  const totals = useMemo(() => {
    const totalLimit = draftCategories.reduce(
      (sum, category) => sum + Number.parseFloat(category.limit_amount || "0"),
      0,
    );
    const totalSpent = Number.parseFloat(summary?.total_spent ?? "0");
    const remaining = Math.max(totalLimit - totalSpent, 0);
    const pct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    return { totalLimit, totalSpent, remaining, pct };
  }, [draftCategories, summary?.total_spent]);

  const spentByCategory = useMemo(() => {
    const map = new Map<string, BudgetSummaryCategory>();
    for (const category of summary?.by_category ?? []) {
      map.set(category.category_name.toLowerCase(), category);
    }
    return map;
  }, [summary?.by_category]);

  const onLimitChange = (categoryName: string, nextValue: string) => {
    setDraftCategories((current) =>
      current.map((item) =>
        item.category_name === categoryName
          ? { ...item, limit_amount: nextValue }
          : item,
      ),
    );
  };

  const onSave = async () => {
    if (!accessToken || draftCategories.length === 0) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const totalLimit = draftCategories
        .reduce((sum, item) => sum + Number.parseFloat(item.limit_amount || "0"), 0)
        .toFixed(2);

      const payload = {
        month: budget?.month ?? suggestedMonth?.month ?? new Date().getMonth() + 1,
        year: budget?.year ?? suggestedMonth?.year ?? new Date().getFullYear(),
        total_limit: totalLimit,
        categories: draftCategories.map((item) => ({
          category_name: item.category_name,
          limit_amount: Number.parseFloat(item.limit_amount || "0").toFixed(2),
        })) as BudgetCategory[],
      };

      let savedBudget = budget;

      if (savedBudget) {
        savedBudget = await updateBudget(accessToken, savedBudget.id, payload);
      } else {
        savedBudget = await createBudget(accessToken, payload);
      }

      setBudget(savedBudget);
      setSuggestedMonth(null);

      const freshSummary = await getBudgetSummary(accessToken, savedBudget.id);
      setSummary(freshSummary);
      setDraftCategories(
        freshSummary.by_category.map((item) => ({
          category_name: item.category_name,
          limit_amount: item.limit_amount,
        })),
      );
    } catch {
      setError("Unable to save budget changes.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading budget data...
      </div>
    );
  }

  if (status !== "authenticated") {
    return <div className="p-6 text-slate-500">Please sign in to view your budget planner.</div>;
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#135bec]">Finance</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Budget Planner
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {budget
              ? `Editing ${monthLabel(budget.month, budget.year)} budget`
              : suggestedMonth
                ? `No budget found. Suggestions for ${monthLabel(suggestedMonth.month, suggestedMonth.year)}`
                : "Build your first monthly budget."}
          </p>
        </div>

        <Button className="h-11 rounded-xl px-5" disabled={saving || draftCategories.length === 0} onClick={onSave}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {budget ? "Apply Changes" : "Create Budget"}
        </Button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4" />
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard label="Budget Limit" value={`${money(totals.totalLimit)} ETB`} />
        <SummaryCard label="Spent" value={`${money(totals.totalSpent)} ETB`} />
        <SummaryCard label="Remaining" value={`${money(totals.remaining)} ETB`} />
        <SummaryCard label="Used" value={`${totals.pct}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="space-y-4 xl:col-span-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Budget Categories</h2>

          {draftCategories.length === 0 ? (
            <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              No categories available.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {draftCategories.map((category) => {
                const stat = spentByCategory.get(category.category_name.toLowerCase());
                const spent = Number.parseFloat(stat?.spent ?? "0");
                const limit = Number.parseFloat(category.limit_amount || "0");
                const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

                return (
                  <div
                    key={category.category_name}
                    className="rounded-2xl border border-[#dbdfe6] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{category.category_name}</p>
                      <span className="text-xs font-semibold text-slate-500">{percent}% used</span>
                    </div>

                    <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full bg-[#135bec]" style={{ width: `${percent}%` }} />
                    </div>

                    <div className="mb-4 text-xs text-slate-500">
                      Spent {money(spent)} ETB of {money(limit)} ETB
                    </div>

                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      Limit Amount
                    </label>

                    <input
                      className="h-10 w-full rounded-lg border border-[#dbdfe6] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#135bec]/30 dark:border-slate-700 dark:bg-slate-950"
                      min="0"
                      step="10"
                      type="number"
                      value={category.limit_amount}
                      onChange={(event) => onLimitChange(category.category_name, event.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4 xl:col-span-4">
          <div className="rounded-2xl border border-[#dbdfe6] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Recent Expenses</h3>

            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500">No expenses found.</p>
            ) : (
              <ul className="space-y-3">
                {expenses.map((expense) => (
                  <li key={expense.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{expense.category}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{money(expense.amount)} ETB</p>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{expense.date}</span>
                      <span>{expense.payment_method || "-"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-[#dbdfe6] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CalendarDays className="size-4" />
              <p className="text-sm font-semibold">Budget Scope</p>
            </div>
            <p className="text-sm text-slate-500">
              This page only shows data backed by finance endpoints: budgets, category limits, summary metrics, and recent expenses.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#dbdfe6] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <Wallet className="size-4 text-[#135bec]" />
        <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
