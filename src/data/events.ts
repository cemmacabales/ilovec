import { useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Tables } from '../types/database';
import { mutate, setQueryData, useQuery } from '../lib/query';
import { parseDay, todayKey } from '../lib/format';

export interface DateEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or ''
  location: string;
  done: boolean;
}

const KEY = 'dates';

function toEvent(row: Tables<'dates'>): DateEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.day,
    time: (row.start_time ?? '').slice(0, 5),
    location: row.location,
    done: row.done,
  };
}

async function load() {
  const { data, error } = await supabase.from('dates').select('*').order('day');
  return { data: data ? data.map(toEvent) : null, error };
}

export type EventInput = Pick<DateEvent, 'title' | 'date' | 'time' | 'location'>;

function toRow(input: EventInput) {
  return { title: input.title, day: input.date, start_time: input.time || null, location: input.location };
}

export function useEvents() {
  const { data, status, reload } = useQuery<DateEvent[]>(KEY, load, []);

  const sorted = useMemo(
    () =>
      [...data].sort((a, b) =>
        a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date),
      ),
    [data],
  );

  const today = todayKey();
  const upcoming = useMemo(() => sorted.filter((e) => e.date >= today && !e.done), [sorted, today]);
  const past = useMemo(
    () => sorted.filter((e) => e.date < today || e.done).reverse(),
    [sorted, today],
  );

  return {
    events: sorted,
    upcoming,
    past,
    next: upcoming[0] ?? null,
    status,
    reload,
    async add(input: EventInput) {
      const { data: row, error } = await supabase.from('dates').insert(toRow(input)).select().single();
      if (error) throw error;
      setQueryData<DateEvent[]>(KEY, (prev) => [...prev, toEvent(row)]);
    },
    update(id: string, input: EventInput) {
      return mutate<DateEvent[]>(
        KEY,
        (prev) => prev.map((e) => (e.id === id ? { ...e, ...input } : e)),
        () => supabase.from('dates').update(toRow(input)).eq('id', id),
      );
    },
    toggle(id: string, done: boolean) {
      return mutate<DateEvent[]>(
        KEY,
        (prev) => prev.map((e) => (e.id === id ? { ...e, done } : e)),
        () => supabase.from('dates').update({ done }).eq('id', id),
      );
    },
    remove(id: string) {
      return mutate<DateEvent[]>(
        KEY,
        (prev) => prev.filter((e) => e.id !== id),
        () => supabase.from('dates').delete().eq('id', id),
      );
    },
  };
}

export function eventDate(e: DateEvent) {
  return parseDay(e.date);
}
