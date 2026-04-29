import { BudgetPlannerPage as BudgetPlannerClient } from "@/components/finance/budget-planner-page";
import { cookies } from "next/headers";
import type { BudgetRecord, BudgetSummary, ExpenseRecord } from "@/types/finance";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function fetchWithCookies(path: string) {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return res.json();
}

export default async function BudgetPage() {
  try {
    const [budgets, expenses] = await Promise.all([
      fetchWithCookies("/api/finance/budgets/") as Promise<BudgetRecord[]>,
      fetchWithCookies("/api/finance/expenses/") as Promise<ExpenseRecord[]>,
    ]);

    const latest = (budgets && budgets.length > 0) ? budgets[0] : null;

    let summary: BudgetSummary | null = null;
    let suggested: { month: number; year: number } | null = null;

    let suggestedCategories: any[] = [];
    if (latest) {
      summary = await fetchWithCookies(`/api/finance/budgets/${latest.id}/summary/`);
      suggestedCategories = summary?.by_category ?? [];
    } else {
      const now = new Date();
      const suggestion = await fetchWithCookies(`/api/finance/budgets/suggestions/?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      suggested = { month: suggestion.month, year: suggestion.year };
      suggestedCategories = suggestion?.categories ?? [];
    }

    const initial = {
      budget: latest,
      summary,
      suggestedMonth: suggested,
      draftCategories: suggestedCategories.map((c: any) => ({ category_name: c.category_name, limit_amount: c.limit_amount })),
      expenses: (expenses ?? []).slice(0, 6),
    };

    return <BudgetPlannerClient initial={initial} />;
  } catch (err) {
    // On server errors, render the client with empty initial data so client can show proper UI/errors
    // eslint-disable-next-line no-console
    console.error("BudgetPage server fetch error:", err);
    return <BudgetPlannerClient initial={{}} />;
  }
}