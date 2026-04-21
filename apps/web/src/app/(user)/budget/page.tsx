"use client";

import { Loader2 } from "lucide-react";

import { BudgetCategoriesSection } from "@/components/finance/budget/budget-categories-section";
import { BudgetErrorBanner } from "@/components/finance/budget/budget-error-banner";
import { BudgetHeader } from "@/components/finance/budget/budget-header";
import { BudgetMetricsRow } from "@/components/finance/budget/budget-metrics-row";
import { BudgetSidebar } from "@/components/finance/budget/budget-sidebar";
import { useBudgetPlanner } from "@/hooks/use-budget-planner";

export default function BudgetPage() {
  const {
    status,
    loading,
    saving,
    error,
    budget,
    suggestedMonth,
    draftCategories,
    expenses,
    totals,
    spentByCategory,
    handleLimitChange,
    handleSave,
  } = useBudgetPlanner();

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading budget data...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <BudgetHeader
        budget={budget}
        suggestedMonth={suggestedMonth}
        saving={saving}
        canSave={!saving && draftCategories.length > 0}
        onSave={handleSave}
      />

      <BudgetErrorBanner error={error} />
      <BudgetMetricsRow totals={totals} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <BudgetCategoriesSection
          draftCategories={draftCategories}
          spentByCategory={spentByCategory}
          onLimitChange={handleLimitChange}
        />
        <BudgetSidebar totals={totals} expenses={expenses} />
      </div>
    </div>
  );
}