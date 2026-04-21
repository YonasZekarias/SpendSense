import { createApiClient } from "./apiClient";

export type BudgetCategory = {
  id?: number;
  category_name: string;
  limit_amount: string;
};

export type BudgetRecord = {
  id: number;
  month: number;
  year: number;
  total_limit: string;
  categories: BudgetCategory[];
  created_at: string;
};

export type BudgetSuggestionResponse = {
  month: number;
  year: number;
  suggested_total: string;
  categories: BudgetCategory[];
};

export type BudgetSummaryCategory = {
  category_name: string;
  limit_amount: string;
  spent: string;
  remaining: string;
  percent_used: number;
  warning_80: boolean;
  warning_100: boolean;
};

export type BudgetSummary = {
  budget_id: number;
  month: number;
  year: number;
  total_limit: string;
  total_spent: string;
  remaining: string;
  percent_total_used: number;
  warning_total_80: boolean;
  warning_total_100: boolean;
  by_category: BudgetSummaryCategory[];
};

export type ExpenseRecord = {
  id: number;
  category: string;
  amount: string;
  date: string;
  description?: string;
  payment_method?: string;
};

type BudgetUpsertPayload = {
  month: number;
  year: number;
  total_limit: string;
  categories: BudgetCategory[];
};

function authClient(accessToken?: string | null) {
  return createApiClient(() => accessToken ?? null);
}

// NEW: Helper function to generate the correct Authorization header
function getAuthHeaders(accessToken?: string | null) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function getBudgetSuggestions(
  accessToken?: string | null,
  params?: { month?: number; year?: number },
): Promise<BudgetSuggestionResponse> {
  const api = authClient(accessToken);
  const { data } = await api.get<BudgetSuggestionResponse>("/api/finance/budgets/suggestions/", {
    params,
    headers: getAuthHeaders(accessToken), // Added headers
  });
  return data;
}

export async function listBudgets(accessToken?: string | null): Promise<BudgetRecord[]> {
  const api = authClient(accessToken);
  const { data } = await api.get<BudgetRecord[]>("/api/finance/budgets/", {
    headers: getAuthHeaders(accessToken), // Added headers
  });
  return data;
}

export async function getBudgetSummary(accessToken: string | null | undefined, budgetId: number): Promise<BudgetSummary> {
  const api = authClient(accessToken);
  const { data } = await api.get<BudgetSummary>(`/api/finance/budgets/${budgetId}/summary/`, {
    headers: getAuthHeaders(accessToken), // Added headers
  });
  return data;
}

export async function createBudget(
  accessToken: string | null | undefined,
  payload: BudgetUpsertPayload,
): Promise<BudgetRecord> {
  const api = authClient(accessToken);
  const { data } = await api.post<BudgetRecord>("/api/finance/budgets/", payload, {
    headers: getAuthHeaders(accessToken), // Added headers
  });
  return data;
}

export async function updateBudget(
  accessToken: string | null | undefined,
  budgetId: number,
  payload: BudgetUpsertPayload,
): Promise<BudgetRecord> {
  const api = authClient(accessToken);
  const { data } = await api.patch<BudgetRecord>(`/api/finance/budgets/${budgetId}/`, payload, {
    headers: getAuthHeaders(accessToken), // Added headers
  });
  return data;
}

export async function listExpenses(accessToken?: string | null): Promise<ExpenseRecord[]> {
  const api = authClient(accessToken);
  const { data } = await api.get<ExpenseRecord[]>("/api/finance/expenses/", {
    headers: getAuthHeaders(accessToken), // Added headers
  });
  return data;
}