import { useMemo } from 'react';
import { addEvent, deleteEvent, fetchEvents, updateEvent, updateEventComplete } from '../services/supabase';
import { useQuery, setQueryData, invalidate } from '../lib/query';
import { parseDay, todayKey } from '../lib/format';

export interface DateEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or ''
  location: string;
  done: boolean;
}

const KEY = 'events';

interface EventRow {
  id: string;
  title?: string;
  event_date?: string;
  date?: string;
  event_time?: string;
  time?: string;
  location?: string;
  description?: string;
  event_complete?: boolean;
}

function toEvent(row: EventRow): DateEvent {
  return {
    id: String(row.id),
    title: row.title ?? 'Untitled',
    date: (row.event_date ?? row.date ?? '').slice(0, 10),
    time: (row.event_time ?? row.time ?? '').slice(0, 5),
    location: row.location ?? row.description ?? '',
    done: !!row.event_complete,
  };
}

async function load() {
  const { data, error } = await fetchEvents();
  return { data: data ? (data as EventRow[]).map(toEvent) : null, error };
}

export type EventInput = Pick<DateEvent, 'title' | 'date' | 'time' | 'location'>;

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
      const { error } = await addEvent({ ...input, event_complete: false });
      if (error) throw error;
      invalidate(KEY);
    },
    async update(id: string, input: EventInput) {
      setQueryData<DateEvent[]>(KEY, (prev = []) =>
        prev.map((e) => (e.id === id ? { ...e, ...input } : e)),
      );
      const { error } = await updateEvent(id, {
        title: input.title,
        event_date: input.date,
        event_time: input.time,
        location: input.location,
      });
      if (error) {
        invalidate(KEY);
        throw error;
      }
    },
    async toggle(id: string, done: boolean) {
      setQueryData<DateEvent[]>(KEY, (prev = []) => prev.map((e) => (e.id === id ? { ...e, done } : e)));
      const { error } = await updateEventComplete(id, done);
      if (error) {
        invalidate(KEY);
        throw error;
      }
    },
    async remove(id: string) {
      setQueryData<DateEvent[]>(KEY, (prev = []) => prev.filter((e) => e.id !== id));
      const { error } = await deleteEvent(id);
      if (error) {
        invalidate(KEY);
        throw error;
      }
    },
  };
}

export function eventDate(e: DateEvent) {
  return parseDay(e.date);
}
