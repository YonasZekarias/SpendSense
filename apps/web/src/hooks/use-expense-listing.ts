import { useCallback, useEffect, useMemo, useState } from "react";

import { createApiClient } from "@/lib/finance-utils";
import { useAuth } from "@/providers/auth-provider";
import { BudgetRecord, ExpenseRecord } from "@/types/finance";

type ReportSummary = {
  total_spent?: string | number;
  top_category?: string;
  top_category_amount?: string | number;
};

function toNumber(value: string | number | null | undefined) {
  const n = typeof value === "string" ? Number.parseFloat(value || "0") : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function thisMonthOf(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function useExpenseListing() {
  const { status, accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");

  const fetchAll = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = createApiClient(accessToken);
      const [expensesRes, budgetsRes] = await Promise.all([
        api.get<ExpenseRecord[]>("/api/finance/expenses/"),
        api.get<BudgetRecord[]>("/api/finance/budgets/"),
      ]);

      setExpenses(expensesRes.data);
      setBudgets(budgetsRes.data);

      try {
        const reportsRes = await api.get<ReportSummary>("/api/finance/reports/");
        setReportSummary(reportsRes.data);
      } catch {
        setReportSummary(null);
      }
    } catch {
      setError("Unable to load expenses right now.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchAll();
    }
  }, [status, fetchAll]);

  const categories = useMemo(() => {
    const set = new Set(expenses.map((e) => e.category).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const base = categoryFilter === "all" ? expenses : expenses.filter((e) => e.category === categoryFilter);

    return [...base].sort((a, b) => {
      if (sortBy === "date_desc") return b.date.localeCompare(a.date);
      if (sortBy === "date_asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount_desc") return toNumber(b.amount) - toNumber(a.amount);
      return toNumber(a.amount) - toNumber(b.amount);
    });
  }, [expenses, categoryFilter, sortBy]);

  const summary = useMemo(() => {
    const monthExpenses = expenses.filter((e) => thisMonthOf(e.date));
    const monthlyTotalFromData = monthExpenses.reduce((sum, e) => sum + toNumber(e.amount), 0);

    const byCategory = new Map<string, number>();
    for (const e of monthExpenses) {
      const current = byCategory.get(e.category) ?? 0;
      byCategory.set(e.category, current + toNumber(e.amount));
    }

    const [topCategory, topAmount] = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0] ?? [
      "N/A",
      0,
    ];

    const currentBudget = budgets[0] ?? null;
    const budgetLimit = currentBudget ? toNumber(currentBudget.total_limit) : 0;
    const usedPct = budgetLimit > 0 ? (monthlyTotalFromData / budgetLimit) * 100 : 0;

    const reportedTotal = reportSummary?.total_spent !== undefined ? toNumber(reportSummary.total_spent) : monthlyTotalFromData;

    return {
      monthlyTotal: reportedTotal,
      topCategory: reportSummary?.top_category || topCategory,
      topCategoryAmount:
        reportSummary?.top_category_amount !== undefined ? toNumber(reportSummary.top_category_amount) : topAmount,
      transactions: expenses.length,
      budgetLimit,
      usedPct: Number(usedPct.toFixed(2)),
    };
  }, [expenses, budgets, reportSummary]);

  return {
    status,
    loading,
    error,
    summary,
    categories,
    categoryFilter,
    sortBy,
    expenses: filteredExpenses,
    setCategoryFilter,
    setSortBy,
  };
}
