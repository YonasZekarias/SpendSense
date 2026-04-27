import { createApiClient } from "./apiClient";
import type { BudgetRecord, BudgetSummary, ExpenseRecord } from "@/types/finance";

export async function listBudgets(accessToken: string): Promise<BudgetRecord[]> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<BudgetRecord[]>("/api/finance/budgets/");
  return data;
}

export async function getBudgetSummary(accessToken: string, budgetId: number): Promise<BudgetSummary> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<BudgetSummary>(`/api/finance/budgets/${budgetId}/summary/`);
  return data;
}

export async function listExpenses(accessToken: string): Promise<ExpenseRecord[]> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<ExpenseRecord[]>("/api/finance/expenses/");
  return data;
}

/** Triggers a browser download of the export (CSV or PDF) using the user JWT. */
export async function downloadFinanceExport(
  accessToken: string,
  format: "csv" | "pdf",
  options?: { month?: number; year?: number }
): Promise<void> {
  const api = createApiClient(() => accessToken);
  const { data, headers } = await api.get<Blob>("/api/finance/export/", {
    params: { format, month: options?.month, year: options?.year },
    responseType: "blob",
  });
  const disposition = headers["content-disposition"] as string | undefined;
  const nameMatch = disposition?.match(/filename="?([^";\n]+)"?/i);
  const filename = nameMatch?.[1] ?? `export.${format === "pdf" ? "pdf" : "csv"}`;
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
