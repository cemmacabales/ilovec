import { useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Tables } from '../types/database';
import { mutate, refetch, refetchMatching, setQueryData, useQuery } from '../lib/query';

export type ExpenseCategory =
  | 'restaurants'
  | 'entertainment'
  | 'activities'
  | 'travel'
  | 'gifts'
  | 'groceries'
  | 'transportation'
  | 'shopping'
  | 'subscriptions'
  | 'utilities'
  | 'healthcare'
  | 'other';

export type Payer = 'him' | 'her';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // YYYY-MM-DD
  paidBy: Payer;
}

export type ExpenseInput = Omit<Expense, 'id'>;

// A monthly spending limit for one category.
export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  alertThreshold: number;
  isActive: boolean;
}

export type SavingsGoalKind = 'vacation' | 'home' | 'wedding' | 'emergency' | 'other';

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: SavingsGoalKind;
  description: string;
}

export type SavingsGoalInput = Omit<SavingsGoal, 'id'>;

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Expenses ----------------------------------------------------------------

function toExpense(row: Tables<'expenses'>): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category as ExpenseCategory,
    description: row.description,
    date: row.spent_on,
    paidBy: row.paid_by === 'her' ? 'her' : 'him',
  };
}

function expenseRow(input: Partial<ExpenseInput>) {
  return {
    ...(input.amount !== undefined && { amount: input.amount }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.date !== undefined && { spent_on: input.date }),
    ...(input.paidBy !== undefined && { paid_by: input.paidBy }),
  };
}

async function loadExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('spent_on', { ascending: false })
    .order('created_at', { ascending: false });
  return { data: data ? data.map(toExpense) : null, error };
}

const EXPENSES = 'expenses';

export function useExpenses() {
  const { data, status, reload } = useQuery<Expense[]>(EXPENSES, loadExpenses, []);
  return {
    expenses: data,
    status,
    reload,
    async add(input: ExpenseInput) {
      const { data: row, error } = await supabase
        .from('expenses')
        .insert({
          amount: input.amount,
          category: input.category,
          description: input.description,
          spent_on: input.date,
          paid_by: input.paidBy,
        })
        .select()
        .single();
      if (error) throw error;
      setQueryData<Expense[]>(EXPENSES, (prev) => [toExpense(row), ...prev]);
      refetchMatching('spend');
    },
    async update(id: string, input: Partial<ExpenseInput>) {
      await mutate<Expense[]>(
        EXPENSES,
        (prev) => prev.map((e) => (e.id === id ? { ...e, ...input } : e)),
        () => supabase.from('expenses').update(expenseRow(input)).eq('id', id),
      );
      refetchMatching('spend');
    },
    async remove(id: string) {
      await mutate<Expense[]>(
        EXPENSES,
        (prev) => prev.filter((e) => e.id !== id),
        () => supabase.from('expenses').delete().eq('id', id),
      );
      refetchMatching('spend');
    },
  };
}

// Monthly spend, totalled by the database (the `monthly_spend` view) ------

export interface MonthSpend {
  total: number;
  him: number;
  her: number;
  byCategory: Partial<Record<ExpenseCategory, number>>;
}

const NO_SPEND: MonthSpend = { total: 0, him: 0, her: 0, byCategory: {} };

export function useMonthSpend(month = monthKey()) {
  const key = `spend:${month}`;
  const load = async () => {
    const { data, error } = await supabase.from('monthly_spend').select('*').eq('month', `${month}-01`);
    if (!data) return { data: null, error };
    const spend: MonthSpend = { total: 0, him: 0, her: 0, byCategory: {} };
    for (const row of data) {
      spend.total += Number(row.total ?? 0);
      spend.him += Number(row.him ?? 0);
      spend.her += Number(row.her ?? 0);
      spend.byCategory[row.category as ExpenseCategory] = Number(row.total ?? 0);
    }
    return { data: spend, error };
  };
  return useQuery<MonthSpend>(key, load, NO_SPEND);
}

// Monthly limits ------------------------------------------------------------

function toBudget(row: Tables<'budgets'>): Budget {
  return {
    id: row.id,
    category: row.category as ExpenseCategory,
    monthlyLimit: Number(row.monthly_limit),
    alertThreshold: row.alert_threshold,
    isActive: row.is_active,
  };
}

async function loadBudgets() {
  const { data, error } = await supabase.from('budgets').select('*').order('created_at');
  return { data: data ? data.map(toBudget) : null, error };
}

const BUDGETS = 'budgets';

export function useBudgets() {
  const { data, status } = useQuery<Budget[]>(BUDGETS, loadBudgets, []);
  const active = useMemo(() => data.filter((b) => b.isActive), [data]);
  return {
    budgets: data,
    activeLimit: active.reduce((s, b) => s + b.monthlyLimit, 0),
    status,
    // One limit per category: setting a category that already has one replaces it.
    async set(category: ExpenseCategory, monthlyLimit: number) {
      const { error } = await supabase
        .from('budgets')
        .upsert({ category, monthly_limit: monthlyLimit, is_active: true }, { onConflict: 'category' });
      if (error) throw error;
      await refetch(BUDGETS);
    },
    async update(id: string, input: { category: ExpenseCategory; monthlyLimit: number }) {
      const { error } = await supabase
        .from('budgets')
        .update({ category: input.category, monthly_limit: input.monthlyLimit })
        .eq('id', id);
      if (error) throw error;
      await refetch(BUDGETS);
    },
    remove(id: string) {
      return mutate<Budget[]>(
        BUDGETS,
        (prev) => prev.filter((b) => b.id !== id),
        () => supabase.from('budgets').delete().eq('id', id),
      );
    },
  };
}

// Savings goals -------------------------------------------------------------

function toGoal(row: Tables<'savings_goals'>): SavingsGoal {
  return {
    id: row.id,
    title: row.title,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date,
    category: row.category as SavingsGoalKind,
    description: row.description,
  };
}

function goalRow(input: SavingsGoalInput) {
  return {
    title: input.title,
    target_amount: input.targetAmount,
    current_amount: input.currentAmount,
    target_date: input.targetDate,
    category: input.category,
    description: input.description,
  };
}

async function loadGoals() {
  const { data, error } = await supabase.from('savings_goals').select('*').order('target_date');
  return { data: data ? data.map(toGoal) : null, error };
}

const GOALS = 'goals';

export function useSavingsGoals() {
  const { data, status } = useQuery<SavingsGoal[]>(GOALS, loadGoals, []);
  return {
    goals: data,
    status,
    async add(input: SavingsGoalInput) {
      const { data: row, error } = await supabase.from('savings_goals').insert(goalRow(input)).select().single();
      if (error) throw error;
      setQueryData<SavingsGoal[]>(GOALS, (prev) =>
        [...prev, toGoal(row)].sort((a, b) => a.targetDate.localeCompare(b.targetDate)),
      );
    },
    update(id: string, input: SavingsGoalInput) {
      return mutate<SavingsGoal[]>(
        GOALS,
        (prev) => prev.map((g) => (g.id === id ? { ...g, ...input } : g)),
        () => supabase.from('savings_goals').update(goalRow(input)).eq('id', id),
      );
    },
    remove(id: string) {
      return mutate<SavingsGoal[]>(
        GOALS,
        (prev) => prev.filter((g) => g.id !== id),
        () => supabase.from('savings_goals').delete().eq('id', id),
      );
    },
  };
}
