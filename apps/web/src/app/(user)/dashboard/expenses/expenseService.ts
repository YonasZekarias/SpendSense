export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Health",
  "Education",
  "Entertainment",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type CreateExpenseInput = {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
};

export type Expense = CreateExpenseInput & {
  id: string;
  createdAt: string;
};

// ... keep your existing localStorage logic (readExpenses, writeExpenses, etc.)

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const expenses = await getExpenses();
  const nextExpense: Expense = {
    id: `exp-${Date.now().toString(36)}`,
    ...input,
    createdAt: new Date().toISOString(),
  };
  // logic to save to localStorage...
  window.localStorage.setItem("spendsense.expenses.v1", JSON.stringify([nextExpense, ...expenses]));
  return nextExpense;
}

export async function getExpenses(): Promise<Expense[]> {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem("spendsense.expenses.v1");
  return raw ? (JSON.parse(raw) as Expense[]) : [];
}