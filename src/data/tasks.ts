import { useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Tables } from '../types/database';
import { mutate, setQueryData, useQuery } from '../lib/query';
import { toPerson, todayKey, type Person } from '../lib/format';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'household' | 'planning' | 'shopping' | 'personal' | 'dates' | 'other';

export interface Task {
  id: string;
  title: string;
  notes: string;
  done: boolean;
  who: Person;
  priority: TaskPriority;
  due: string; // YYYY-MM-DD or ''
  category: TaskCategory;
  createdAt: string;
  completedAt: string;
}

export const TASK_CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'household', label: 'Household' },
  { value: 'planning', label: 'Planning' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'dates', label: 'Dates' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string; marks: string }[] = [
  { value: 'low', label: 'Low', marks: '!' },
  { value: 'medium', label: 'Medium', marks: '!!' },
  { value: 'high', label: 'High', marks: '!!!' },
];

const KEY = 'tasks';

function toTask(row: Tables<'tasks'>): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    done: row.done,
    who: toPerson(row.assigned_to),
    priority: row.priority as TaskPriority,
    due: row.due_on ?? '',
    category: row.category as TaskCategory,
    createdAt: row.created_at,
    completedAt: row.done_on ?? '',
  };
}

async function load() {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
  return { data: data ? data.map(toTask) : null, error };
}

export type TaskInput = Pick<Task, 'title' | 'notes' | 'who' | 'priority' | 'due' | 'category'>;

function toRow(input: TaskInput) {
  return {
    title: input.title,
    notes: input.notes,
    assigned_to: input.who,
    priority: input.priority,
    due_on: input.due || null,
    category: input.category,
  };
}

export function isOverdue(t: Task) {
  return !t.done && !!t.due && t.due < todayKey();
}

export function useTasks() {
  const { data, status, reload } = useQuery<Task[]>(KEY, load, []);

  const open = useMemo(
    () =>
      data
        .filter((t) => !t.done)
        .sort((a, b) => {
          if (a.due && b.due) return a.due.localeCompare(b.due);
          if (a.due) return -1;
          if (b.due) return 1;
          return b.createdAt.localeCompare(a.createdAt);
        }),
    [data],
  );
  const done = useMemo(
    () => data.filter((t) => t.done).sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    [data],
  );

  return {
    tasks: data,
    open,
    done,
    status,
    reload,
    async add(input: TaskInput) {
      const { data: row, error } = await supabase.from('tasks').insert(toRow(input)).select().single();
      if (error) throw error;
      setQueryData<Task[]>(KEY, (prev) => [toTask(row), ...prev]);
    },
    update(id: string, input: TaskInput) {
      return mutate<Task[]>(
        KEY,
        (prev) => prev.map((t) => (t.id === id ? { ...t, ...input } : t)),
        () => supabase.from('tasks').update(toRow(input)).eq('id', id),
      );
    },
    toggle(id: string, isDone: boolean) {
      const completedAt = isDone ? todayKey() : '';
      return mutate<Task[]>(
        KEY,
        (prev) => prev.map((t) => (t.id === id ? { ...t, done: isDone, completedAt } : t)),
        () => supabase.from('tasks').update({ done: isDone, done_on: completedAt || null }).eq('id', id),
      );
    },
    remove(id: string) {
      return mutate<Task[]>(
        KEY,
        (prev) => prev.filter((t) => t.id !== id),
        () => supabase.from('tasks').delete().eq('id', id),
      );
    },
  };
}
