import { apiClient } from "@/lib/api";
import { ExpenseListingPage } from "@/components/finance/expenses/expense-listing-page";
import type { ExpenseRecord, BudgetRecord } from "@/types/finance";

export default async function ExpensesPageRoute() {
  try {
    const [expensesRaw, budgetsRaw] = await Promise.all([
      apiClient<any>({ method: "GET", endpoint: "/api/finance/expenses/" }).catch(() => []),
      apiClient<any>({ method: "GET", endpoint: "/api/finance/budgets/" }).catch(() => []),
    ]);

    const expenses = Array.isArray(expensesRaw) ? expensesRaw : (expensesRaw?.results ?? []);
    const budgets = Array.isArray(budgetsRaw) ? budgetsRaw : (budgetsRaw?.results ?? []);

    const initial = { expenses, budgets };

    return <ExpenseListingPage initial={initial} />;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Expenses page server fetch error:", err);
    return <ExpenseListingPage initial={{}} />;
  }
}
