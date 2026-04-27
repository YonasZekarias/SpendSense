import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { createApiClient } from "@/lib/finance-utils";
import { 
  BudgetRecord, BudgetSummary, ExpenseRecord, EditableCategory, 
  BudgetSuggestionResponse, BudgetSummaryCategory 
} from "@/types/finance";

export function useBudgetPlanner() {
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
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const api = createApiClient(accessToken);

    try {
      const [budgetsRes, expensesRes] = await Promise.all([
        api.get<BudgetRecord[]>("/api/finance/budgets/"),
        api.get<ExpenseRecord[]>("/api/finance/expenses/"),
      ]);

      const budgets = budgetsRes.data;
      setExpenses(expensesRes.data.slice(0, 6));

      if (budgets.length > 0) {
        const latestBudget = budgets[0];
        setBudget(latestBudget);
        setSuggestedMonth(null);

        const summaryRes = await api.get<BudgetSummary>(`/api/finance/budgets/${latestBudget.id}/summary/`);
        const detail = summaryRes.data;
        
        setSummary(detail);
        setDraftCategories(
          detail.by_category.map((c) => ({ category_name: c.category_name, limit_amount: c.limit_amount }))
        );
      } else {
        setBudget(null);
        setSummary(null);

        const now = new Date();
        const suggestionRes = await api.get<BudgetSuggestionResponse>("/api/finance/budgets/suggestions/", {
          params: { month: now.getMonth() + 1, year: now.getFullYear() },
        });
        
        setSuggestedMonth({ month: suggestionRes.data.month, year: suggestionRes.data.year });
        setDraftCategories(
          suggestionRes.data.categories.map((c) => ({ category_name: c.category_name, limit_amount: c.limit_amount }))
        );
      }
    } catch {
      setError("Unable to load your finance data right now.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated") void bootstrap();
  }, [status, bootstrap]);

  const totals = useMemo(() => {
    const totalLimit = draftCategories.reduce((sum, cat) => sum + Number.parseFloat(cat.limit_amount || "0"), 0);
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

  const handleLimitChange = (categoryName: string, nextValue: string) => {
    setDraftCategories((current) =>
      current.map((item) => (item.category_name === categoryName ? { ...item, limit_amount: nextValue } : item))
    );
  };

  const handleSave = async () => {
    if (!accessToken || draftCategories.length === 0) return;

    setSaving(true);
    setError(null);
    const api = createApiClient(accessToken);

    try {
      const totalLimit = draftCategories.reduce((sum, item) => sum + Number.parseFloat(item.limit_amount || "0"), 0).toFixed(2);
      const payload = {
        month: budget?.month ?? suggestedMonth?.month ?? new Date().getMonth() + 1,
        year: budget?.year ?? suggestedMonth?.year ?? new Date().getFullYear(),
        total_limit: totalLimit,
        categories: draftCategories.map((item) => ({
          category_name: item.category_name,
          limit_amount: Number.parseFloat(item.limit_amount || "0").toFixed(2),
        })),
      };

      let savedBudget = budget;

      if (savedBudget) {
        const patchRes = await api.patch<BudgetRecord>(`/api/finance/budgets/${savedBudget.id}/`, payload);
        savedBudget = patchRes.data;
      } else {
        const postRes = await api.post<BudgetRecord>("/api/finance/budgets/", payload);
        savedBudget = postRes.data;
      }

      setBudget(savedBudget);
      setSuggestedMonth(null);

      const summaryRes = await api.get<BudgetSummary>(`/api/finance/budgets/${savedBudget.id}/summary/`);
      setSummary(summaryRes.data);
      setDraftCategories(summaryRes.data.by_category.map((item) => ({ category_name: item.category_name, limit_amount: item.limit_amount })));
    } catch {
      setError("Unable to save budget changes.");
    } finally {
      setSaving(false);
    }
  };

  return {
    status,
    loading,
    saving,
    error,
    budget,
    summary,
    suggestedMonth,
    draftCategories,
    expenses,
    totals,
    spentByCategory,
    handleLimitChange,
    handleSave,
  };
}