import { create } from "zustand";
import {
    createExpense,
    getExpenses,
    type CreateExpenseInput,
    type Expense,
} from "./expenseService";

export type ExpenseStoreState = {
  expenses: Expense[];
  isLoading: boolean;
  isLoaded: boolean;
  loadExpenses: (force?: boolean) => Promise<void>;
  addExpense: (input: CreateExpenseInput) => Promise<Expense>;
};

type ExpenseStoreSetter = (
  partial:
    | Partial<ExpenseStoreState>
    | ((state: ExpenseStoreState) => Partial<ExpenseStoreState>)
) => void;

type ExpenseStoreGetter = () => ExpenseStoreState;

export const useExpenseStore = create<ExpenseStoreState>((set: ExpenseStoreSetter, get: ExpenseStoreGetter) => ({
  expenses: [],
  isLoading: false,
  isLoaded: false,

  loadExpenses: async (force = false) => {
    if (get().isLoading) return;
    if (get().isLoaded && !force) return;

    set({ isLoading: true });
    try {
      const data = await getExpenses();
      set({ expenses: data, isLoaded: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addExpense: async (input: CreateExpenseInput) => {
    const created = await createExpense(input);
    set((state: ExpenseStoreState) => ({ expenses: [created, ...state.expenses], isLoaded: true }));
    return created;
  },
}));
