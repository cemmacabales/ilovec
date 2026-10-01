import { useMemo } from 'react';
import { addSharedTask, deleteSharedTask, fetchSharedTasks, updateSharedTask } from '../services/supabase';
import { invalidate, setQueryData, useQuery } from '../lib/query';
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

interface TaskRow {
  id: string;
  task?: string;
  title?: string;
  notes?: string;
  description?: string;
  is_completed?: boolean;
  assigned_to?: string;
  priority?: string;
  due_date?: string | null;
  category?: string;
  created_at?: string;
  completed_date?: string | null;
}

function toTask(row: TaskRow): Task {
  const priority = (['low', 'medium', 'high'] as const).find((p) => p === row.priority) ?? 'medium';
  const category = TASK_CATEGORIES.find((c) => c.value === row.category)?.value ?? 'other';
  return {
    id: String(row.id),
    title: row.title ?? row.task ?? 'Untitled',
    notes: row.description ?? row.notes ?? '',
    done: !!row.is_completed,
    who: toPerson(row.assigned_to),
    priority,
    due: (row.due_date ?? '').slice(0, 10),
    category,
    createdAt: row.created_at ?? '',
    completedAt: (row.completed_date ?? '').slice(0, 10),
  };
}

async function load() {
  const { data, error } = await fetchSharedTasks();
  return { data: data ? (data as TaskRow[]).map(toTask) : null, error };
}

export type TaskInput = Pick<Task, 'title' | 'notes' | 'who' | 'priority' | 'due' | 'category'>;

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
      const { error } = await addSharedTask({
        title: input.title,
        description: input.notes || undefined,
        assignedTo: input.who,
        priority: input.priority,
        dueDate: input.due || undefined,
        category: input.category,
      });
      if (error) throw error;
      invalidate(KEY);
    },
    async update(id: string, input: TaskInput) {
      setQueryData<Task[]>(KEY, (prev = []) => prev.map((t) => (t.id === id ? { ...t, ...input } : t)));
      const { error } = await updateSharedTask(id, {
        title: input.title,
        description: input.notes,
        assignedTo: input.who,
        priority: input.priority,
        dueDate: input.due || null,
        category: input.category,
      });
      if (error) {
        invalidate(KEY);
        throw error;
      }
    },
    async toggle(id: string, isDone: boolean) {
      const completedAt = isDone ? todayKey() : '';
      setQueryData<Task[]>(KEY, (prev = []) =>
        prev.map((t) => (t.id === id ? { ...t, done: isDone, completedAt } : t)),
      );
      const { error } = await updateSharedTask(id, {
        is_completed: isDone,
        completed_date: isDone ? completedAt : null,
      });
      if (error) {
        invalidate(KEY);
        throw error;
      }
    },
    async remove(id: string) {
      setQueryData<Task[]>(KEY, (prev = []) => prev.filter((t) => t.id !== id));
      const { error } = await deleteSharedTask(id);
      if (error) {
        invalidate(KEY);
        throw error;
      }
    },
  };
}
