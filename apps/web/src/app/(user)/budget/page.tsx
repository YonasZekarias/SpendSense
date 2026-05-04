import { BudgetPlannerPage as BudgetPlannerClient } from "@/components/finance/budget-planner-page";
import { apiClient } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types/pagination";
import type { BudgetRecord, BudgetSuggestion, BudgetSummary, ExpenseRecord } from "@/types/finance";


export default async function BudgetPage() {
  try {
    const [budgets, expenses] = await Promise.all([
      apiClient({endpoint:"/api/finance/budgets/",method:"GET"}) as Promise<BudgetRecord[]>,
      apiClient({endpoint:"/api/finance/expenses/",method:"GET"}) as Promise<PaginatedResponse<ExpenseRecord>>,
    ]);

    const latest = (budgets && budgets.length > 0) ? budgets[0] : null;

    let summary: BudgetSummary | null = null;
    let suggested: { month: number; year: number } | null = null;

    let suggestedCategories: any[] = [];
    if (latest) {
      summary = await apiClient({endpoint:`/api/finance/budgets/${latest.id}/summary/`,method:"GET"});
      suggestedCategories = summary?.by_category ?? [];
    } else {
      const now = new Date();

      const suggestion = await apiClient<BudgetSuggestion>({endpoint:`/api/finance/budgets/suggestions/?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,method:"GET"});
      suggested = { month: suggestion.month, year: suggestion.year };
      suggestedCategories = suggestion?.categories ?? [];
    }

    const initial = {
      budget: latest,
      summary,
      suggestedMonth: suggested,
      draftCategories: suggestedCategories.map((c: any) => ({ category_name: c.category_name, limit_amount: c.limit_amount })),
      expenses: (expenses.results ?? []),
    };

    return <BudgetPlannerClient initial={initial} />;
  } catch (err) {
    // On server errors, render the client with empty initial data so client can show proper UI/errors
    // eslint-disable-next-line no-console
    console.error("BudgetPage server fetch error:", err);
    return <BudgetPlannerClient initial={{}} />;
  }
}