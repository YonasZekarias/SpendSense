import { useCallback, useEffect, useMemo, useState } from "react";

import { createApiClient } from "@/lib/finance-utils";
import { useAuth } from "@/providers/auth-provider";
import { BudgetRecord, BudgetSummary, ExpenseRecord } from "@/types/finance";

export type BudgetHistoryRow = {
  budget_id: number;
  month: number;
  year: number;
  total_limit: number;
  total_spent: number;
  remaining: number;
  percent_used: number;
};

function toNumber(value: string | number | null | undefined) {
  const n = typeof value === "string" ? Number.parseFloat(value) : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeHistoryRows(input: unknown): BudgetHistoryRow[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const r = row as Record<string, unknown>;
      const budgetId = toNumber(r.budget_id ?? r.budgetId ?? r.id);
      const month = toNumber(r.month);
      const year = toNumber(r.year);
      const totalLimit = toNumber(r.total_limit ?? r.totalLimit);
      const totalSpent = toNumber(r.total_spent ?? r.totalSpent);
      const remaining =
        r.remaining !== undefined ? toNumber(r.remaining) : Math.max(totalLimit - totalSpent, 0);
      const percentUsed =
        r.percent_used !== undefined
          ? toNumber(r.percent_used)
          : totalLimit > 0
            ? Number(((totalSpent / totalLimit) * 100).toFixed(2))
            : 0;

      if (!month || !year) {
        return null;
      }

      return {
        budget_id: budgetId,
        month,
        year,
        total_limit: totalLimit,
        total_spent: totalSpent,
        remaining,
        percent_used: percentUsed,
      };
    })
    .filter((row): row is BudgetHistoryRow => Boolean(row))
    .sort((a, b) => (b.year - a.year) || (b.month - a.month));
}

export function useBudgetHistory() {
  const { status, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<BudgetHistoryRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  const bootstrap = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = createApiClient(accessToken);
      const [budgetsRes, expensesRes] = await Promise.all([
        api.get<BudgetRecord[]>("/api/finance/budgets/"),
        api.get<ExpenseRecord[]>("/api/finance/expenses/"),
      ]);

      setExpenses(expensesRes.data.slice(0, 8));

      let historyRows: BudgetHistoryRow[] = [];

      try {
        const historyRes = await api.get<unknown>("/api/finance/budgets/history/");
        historyRows = normalizeHistoryRows(historyRes.data);
      } catch {
        historyRows = [];
      }

      if (historyRows.length === 0) {
        const budgets = budgetsRes.data.slice(0, 12);
        const summaries = await Promise.all(
          budgets.map(async (budget) => {
            try {
              const summaryRes = await api.get<BudgetSummary>(`/api/finance/budgets/${budget.id}/summary/`);
              const s = summaryRes.data;
              return {
                budget_id: budget.id,
                month: budget.month,
                year: budget.year,
                total_limit: toNumber(s.total_limit),
                total_spent: toNumber(s.total_spent),
                remaining: toNumber(s.remaining),
                percent_used: toNumber(s.percent_total_used),
              } as BudgetHistoryRow;
            } catch {
              const totalLimit = toNumber(budget.total_limit);
              const totalSpent = expensesRes.data
                .filter((e) => {
                  const d = new Date(e.date);
                  return d.getMonth() + 1 === budget.month && d.getFullYear() === budget.year;
                })
                .reduce((sum, e) => sum + toNumber(e.amount), 0);

              return {
                budget_id: budget.id,
                month: budget.month,
                year: budget.year,
                total_limit: totalLimit,
                total_spent: totalSpent,
                remaining: Math.max(totalLimit - totalSpent, 0),
                percent_used: totalLimit > 0 ? Number(((totalSpent / totalLimit) * 100).toFixed(2)) : 0,
              } as BudgetHistoryRow;
            }
          }),
        );

        historyRows = summaries.sort((a, b) => (b.year - a.year) || (b.month - a.month));
      }

      setRows(historyRows);
    } catch {
      setError("Unable to load budget history right now.");
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
    const totalBudgeted = rows.reduce((sum, row) => sum + row.total_limit, 0);
    const totalSpent = rows.reduce((sum, row) => sum + row.total_spent, 0);
    const totalSaved = rows.reduce((sum, row) => sum + row.remaining, 0);
    const utilization = totalBudgeted > 0 ? Number(((totalSpent / totalBudgeted) * 100).toFixed(2)) : 0;

    return {
      monthsTracked: rows.length,
      totalBudgeted,
      totalSpent,
      totalSaved,
      utilization,
    };
  }, [rows]);

  return {
    status,
    loading,
    error,
    rows,
    expenses,
    totals,
  };
}