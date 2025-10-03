// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jdzbrpylffaeyvxadkxd.supabase.co';
const supabaseKey = 'sbp_5e1a0cacfcdc6273e87c884444fb290ebb714d89';

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

// Bucket List CRUD
export async function addBucketListItem(item: { title: string; description?: string; category: string; priority: string; status: string; difficulty: string; estimatedCost?: number; currency?: string; targetDate?: string; notes?: string; tags?: string[] }) {
  return supabase
    .from('bucket_list')
    .insert([{
      title: item.title,
      description: item.description,
      category: item.category,
      completed: item.status === 'completed',
      notes: item.notes,
      created_at: new Date().toISOString()
    }]);
}


export async function fetchBucketListItems() {
  const { data, error } = await supabase
    .from('bucket_list')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Shared Tasks CRUD
export async function addSharedTask(task: { title: string; description?: string; assignedTo: string; priority: string; dueDate?: string; category: string }) {
  return supabase
    .from('shared_tasks')
    .insert([{
      title: task.title,
      description: task.description,
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
