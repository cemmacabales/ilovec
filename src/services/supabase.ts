// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jdzbrpylffaeyvxadkxd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkemJycHlsZmZhZXl2eGFka3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODY4NTQsImV4cCI6MjA3NTA2Mjg1NH0.GrPyAEO-rrBcH3FZAfODL3OO0DoKzS408_0CdzYInzc';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Upcoming Dates CRUD
export async function addEvent(event: { title: string; date: string; time: string; location?: string }) {
  return supabase
    .from('upcoming_dates')
    .insert([{ title: event.title, event_date: event.date, description: event.location, created_at: new Date().toISOString() }]);
}

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('upcoming_dates')
    .select('*')
    .order('event_date', { ascending: true });
  return { data, error };
}

// Movie Series Tracker CRUD
export async function addMovieSeries(item: { tmdbId: number; type: string; title: string; poster_path?: string; status: string }) {
  return supabase
    .from('movie_series_tracker')
    .insert([{
      title: item.title,
      status: item.status,
      notes: item.poster_path || '',
      tmdb_id: item.tmdbId,
      type: item.type,
      created_at: new Date().toISOString()
    }]);
}

export async function fetchMovieSeries() {
  const { data, error } = await supabase
    .from('movie_series_tracker')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function updateMovieSeries(id: string, updates: Partial<{ status: string; notes: string }>) {
  return supabase
    .from('movie_series_tracker')
    .update(updates)
    .eq('id', id);
}


export async function removeMovieSeries(id: string) {
  return supabase
    .from('movie_series_tracker')
    .delete()
    .eq('id', id);
}

// Budget Tracker CRUD
export async function addExpense(expense: { amount: number; category: string; description: string; date: string; paidBy: string }) {
  return supabase
    .from('budget_tracker')
    .insert([{
      item: expense.description,
      amount: expense.amount,
      category: expense.category,
      notes: expense.paidBy,
      created_at: expense.date
    }]);
}


export async function fetchExpenses() {
  const { data, error } = await supabase
    .from('budget_tracker')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function updateExpense(id: string, updates: Partial<{ amount: number; category: string; description: string; date: string; paidBy: string }>) {
  return supabase
    .from('budget_tracker')
    .update({
      ...(updates.amount !== undefined ? { amount: updates.amount } : {}),
      ...(updates.category !== undefined ? { category: updates.category } : {}),
      ...(updates.description !== undefined ? { item: updates.description } : {}),
      ...(updates.date !== undefined ? { created_at: updates.date } : {}),
      ...(updates.paidBy !== undefined ? { notes: updates.paidBy } : {}),
    })
    .eq('id', id);
}

export async function deleteExpense(id: string) {
  return supabase
    .from('budget_tracker')
    .delete()
    .eq('id', id);
}

// Budgets CRUD
export async function addBudget(budget: { category: string; monthlyLimit: number; alertThreshold: number; isActive: boolean }) {
  return supabase
    .from('budgets')
    .insert([{
      category: budget.category,
      monthly_limit: budget.monthlyLimit,
      alert_threshold: budget.alertThreshold,
      is_active: budget.isActive,
      created_at: new Date().toISOString()
    }]);
}

export async function fetchBudgets() {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function updateBudget(id: string, updates: Partial<{ category: string; monthlyLimit: number; alertThreshold: number; isActive: boolean; currentSpent: number }>) {
  return supabase
    .from('budgets')
    .update({
      ...(updates.category !== undefined ? { category: updates.category } : {}),
      ...(updates.monthlyLimit !== undefined ? { monthly_limit: updates.monthlyLimit } : {}),
      ...(updates.alertThreshold !== undefined ? { alert_threshold: updates.alertThreshold } : {}),
      ...(updates.isActive !== undefined ? { is_active: updates.isActive } : {}),
      ...(updates.currentSpent !== undefined ? { current_spent: updates.currentSpent } : {}),
    })
    .eq('id', id);
}

export async function deleteBudget(id: string) {
  return supabase
    .from('budgets')
    .delete()
    .eq('id', id);
}

// Savings Goals CRUD
export async function addSavingsGoal(goal: { title: string; targetAmount: number; currentAmount: number; targetDate: string; category: string; description?: string }) {
  return supabase
    .from('savings_goals')
    .insert([{
      title: goal.title,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      target_date: goal.targetDate,
      category: goal.category,
      description: goal.description || '',
      created_at: new Date().toISOString()
    }]);
}

export async function fetchSavingsGoals() {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function updateSavingsGoal(id: string, updates: Partial<{ title: string; targetAmount: number; currentAmount: number; targetDate: string; category: string; description?: string }>) {
  return supabase
    .from('savings_goals')
    .update({
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.targetAmount !== undefined ? { target_amount: updates.targetAmount } : {}),
      ...(updates.currentAmount !== undefined ? { current_amount: updates.currentAmount } : {}),
      ...(updates.targetDate !== undefined ? { target_date: updates.targetDate } : {}),
      ...(updates.category !== undefined ? { category: updates.category } : {}),
      ...(updates.description !== undefined ? { description: updates.description } : {}),
    })
    .eq('id', id);
}

export async function deleteSavingsGoal(id: string) {
  return supabase
    .from('savings_goals')
    .delete()
    .eq('id', id);
}

// Bucket List CRUD
export async function addBucketListItem(item: { title: string; description?: string; category: string; priority: string; status: string; difficulty: string; estimatedCost?: number; currency?: string; targetDate?: string; notes?: string; tags?: string[] }) {
  // Only include defined fields
  const payload: any = {
    title: item.title,
    category: item.category,
    priority: item.priority,
    status: item.status,
    difficulty: item.difficulty,
    completed: item.status === 'completed',
    created_at: new Date().toISOString()
  };
  if (item.description !== undefined) payload.description = item.description;
  if (item.estimatedCost !== undefined) payload.estimated_cost = item.estimatedCost;
  if (item.currency !== undefined) payload.currency = item.currency;
  if (item.targetDate !== undefined) payload.target_date = item.targetDate;
  if (item.notes !== undefined) payload.notes = item.notes;
  if (item.tags !== undefined && Array.isArray(item.tags)) payload.tags = item.tags;

  return supabase
    .from('bucket_list')
    .insert([payload]);
}


export async function fetchBucketListItems() {
  const { data, error } = await supabase
    .from('bucket_list')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}


export async function deleteBucketListItem(id: string) {
  return supabase
    .from('bucket_list')
    .delete()
    .eq('id', id);
}

// Update Bucket List Item
export async function updateBucketListItem(id: string, updates: Partial<{ status: string; progress: number; completedDate?: Date; title?: string; description?: string; category?: string; priority?: string; difficulty?: string; estimatedCost?: number; currency?: string; targetDate?: string; notes?: string; tags?: string[] }>) {
  // Map camelCase to snake_case for Supabase fields
  const payload: any = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.progress !== undefined) payload.progress = updates.progress;
  if (updates.completedDate !== undefined) payload.completed_date = updates.completedDate instanceof Date ? updates.completedDate.toISOString() : updates.completedDate;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
  if (updates.estimatedCost !== undefined) payload.estimated_cost = updates.estimatedCost;
  if (updates.currency !== undefined) payload.currency = updates.currency;
  if (updates.targetDate !== undefined) payload.target_date = updates.targetDate;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.tags !== undefined) payload.tags = updates.tags;

  return supabase
    .from('bucket_list')
    .update(payload)
    .eq('id', id);
}

// Shared Tasks CRUD
export async function addSharedTask(task: { title: string; description?: string; assignedTo: string; priority: string; dueDate?: string; category: string }) {
  return supabase
    .from('shared_tasks')
    .insert([{
      task: task.title,
      notes: task.description,
      assigned_to: task.assignedTo,
      priority: task.priority,
      due_date: task.dueDate,
      category: task.category,
      is_completed: false,
      created_at: new Date().toISOString()
    }]);
}

export async function fetchSharedTasks() {
  const { data, error } = await supabase
    .from('shared_tasks')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function deleteSharedTask(id: string) {
  return supabase
    .from('shared_tasks')
    .delete()
    .eq('id', id);
}

// Update Shared Task status and completed date
export async function updateSharedTask(id: string, updates: Partial<{ is_completed: boolean; completed_date?: string }>) {
  return supabase
    .from('shared_tasks')
    .update({
      ...(updates.is_completed !== undefined ? { is_completed: updates.is_completed } : {}),
      ...(updates.completed_date !== undefined ? { completed_date: updates.completed_date } : {}),
    })
    .eq('id', id);
}
