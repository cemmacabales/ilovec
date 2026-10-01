import { supabase } from '../services/supabase';
import type { Tables } from '../types/database';
import { mutate, setQueryData, useQuery } from '../lib/query';
import { todayKey } from '../lib/format';

export type BucketCategory =
  | 'travel'
  | 'adventure'
  | 'experiences'
  | 'learning'
  | 'relationships'
  | 'creativity'
  | 'health'
  | 'personal'
  | 'career'
  | 'financial'
  | 'spiritual'
  | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ItemStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface BucketItem {
  id: string;
  title: string;
  description: string;
  category: BucketCategory;
  priority: Priority;
  status: ItemStatus;
  difficulty: Difficulty;
  progress: number; // 0-100
  estimatedCost: number | null;
  currency: string;
  targetDate: string; // YYYY-MM-DD or ''
  completedOn: string; // YYYY-MM-DD or ''
  location: string;
}

export type BucketInput = Pick<
  BucketItem,
  'title' | 'description' | 'category' | 'priority' | 'status' | 'difficulty' | 'progress' | 'estimatedCost' | 'targetDate' | 'location'
>;

const KEY = 'bucket';

function toItem(row: Tables<'bucket_list'>): BucketItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as BucketCategory,
    priority: row.priority as Priority,
    status: row.status as ItemStatus,
    difficulty: row.difficulty as Difficulty,
    progress: row.progress,
    estimatedCost: row.estimated_cost === null ? null : Number(row.estimated_cost),
    currency: row.currency,
    targetDate: row.target_date ?? '',
    completedOn: row.completed_on ?? '',
    location: row.location,
  };
}

// Keeps status, progress and the completion day consistent, which the
// database also enforces: done means 100% and a completion day.
function settle<T extends Partial<BucketInput>>(input: T, completedOn: string) {
  if (input.status === undefined) return { input, completedOn };
  if (input.status === 'completed') return { input: { ...input, progress: 100 }, completedOn: completedOn || todayKey() };
  return { input, completedOn: '' };
}

function toRow(input: Partial<BucketInput>, completedOn?: string) {
  return {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.difficulty !== undefined && { difficulty: input.difficulty }),
    ...(input.progress !== undefined && { progress: input.progress }),
    ...(input.estimatedCost !== undefined && { estimated_cost: input.estimatedCost }),
    ...(input.targetDate !== undefined && { target_date: input.targetDate || null }),
    ...(input.location !== undefined && { location: input.location }),
    ...(completedOn !== undefined && { completed_on: completedOn || null }),
  };
}

async function load() {
  const { data, error } = await supabase.from('bucket_list').select('*').order('created_at', { ascending: false });
  return { data: data ? data.map(toItem) : null, error };
}

export function useBucketList() {
  const { data, status, reload } = useQuery<BucketItem[]>(KEY, load, []);

  return {
    items: data,
    status,
    reload,
    async add(raw: BucketInput) {
      const { input, completedOn } = settle(raw, '');
      const { data: row, error } = await supabase
        .from('bucket_list')
        .insert({ ...toRow(input, completedOn), title: input.title })
        .select()
        .single();
      if (error) throw error;
      setQueryData<BucketItem[]>(KEY, (prev) => [toItem(row), ...prev]);
    },
    update(id: string, raw: Partial<BucketInput>) {
      const current = data.find((i) => i.id === id);
      const { input, completedOn } = settle(raw, current?.completedOn ?? '');
      const touchesStatus = raw.status !== undefined;
      return mutate<BucketItem[]>(
        KEY,
        (prev) => prev.map((i) => (i.id === id ? { ...i, ...input, ...(touchesStatus && { completedOn }) } : i)),
        () => supabase.from('bucket_list').update(toRow(input, touchesStatus ? completedOn : undefined)).eq('id', id),
      );
    },
    remove(id: string) {
      return mutate<BucketItem[]>(
        KEY,
        (prev) => prev.filter((i) => i.id !== id),
        () => supabase.from('bucket_list').delete().eq('id', id),
      );
    },
  };
}
