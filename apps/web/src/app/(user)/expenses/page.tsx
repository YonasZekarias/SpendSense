import { apiClient } from "@/lib/api";
import { ExpenseListingPage } from "@/components/finance/expenses/expense-listing-page";
import type { ExpenseRecord, BudgetRecord } from "@/types/finance";

export default async function ExpensesPageRoute() {
  try {
    const [expenses, budgets] = (await Promise.all([
      apiClient<ExpenseRecord[]>({ method: "GET", endpoint: "/api/finance/expenses/" }).catch(() => []),
      apiClient<BudgetRecord[]>({ method: "GET", endpoint: "/api/finance/budgets/" }).catch(() => []),
    ])) as [ExpenseRecord[], BudgetRecord[]];

    const initial = { expenses, budgets };

    return <ExpenseListingPage initial={initial} />;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Expenses page server fetch error:", err);
    return <ExpenseListingPage initial={{}} />;
  }
}
