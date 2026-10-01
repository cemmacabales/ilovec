import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

export type QueryStatus = 'loading' | 'ready' | 'error';

type Fetcher<T> = () => Promise<{ data: T | null; error: unknown }>;

interface Entry<T> {
  data: T;
  at: number;
}

// Module-level cache so a widget's data is already there when its page opens
// (and vice versa). Every mount refreshes in the background, and live sync
// refetches a key when the other phone changes its table.
const cache = new Map<string, Entry<unknown>>();
const failed = new Set<string>();
const fetchers = new Map<string, Fetcher<unknown>>();
const inflight = new Map<string, Promise<void>>();
const subscribers = new Map<string, Set<() => void>>();

function notify(key: string) {
  subscribers.get(key)?.forEach((fn) => fn());
}

// Fetch a key again, keeping what's on screen until the new data arrives.
export function refetch(key: string): Promise<void> {
  const fetcher = fetchers.get(key);
  if (!fetcher) {
    cache.delete(key);
    return Promise.resolve();
  }
  const running = inflight.get(key);
  if (running) return running;
  const run = (async () => {
    try {
      const { data, error } = await fetcher();
      if (error || data === null) throw error;
      cache.set(key, { data, at: Date.now() });
      failed.delete(key);
    } catch {
      if (!cache.has(key)) failed.add(key);
    }
    notify(key);
  })().finally(() => inflight.delete(key));
  inflight.set(key, run);
  return run;
}

// Refetch a key and any parameterised variants of it ("spend" also covers "spend:2026-10").
export function refetchMatching(prefix: string) {
  for (const key of fetchers.keys()) {
    if (key === prefix || key.startsWith(`${prefix}:`)) void refetch(key);
  }
}

export function refetchAll() {
  for (const key of fetchers.keys()) void refetch(key);
}

// Forget everything, e.g. after signing out.
export function clearQueries() {
  const keys = [...cache.keys(), ...failed];
  cache.clear();
  failed.clear();
  keys.forEach(notify);
}

export function setQueryData<T>(key: string, update: (prev: T) => T) {
  const prev = cache.get(key) as Entry<T> | undefined;
  if (!prev) return;
  cache.set(key, { data: update(prev.data), at: Date.now() });
  notify(key);
}

// Apply a change on screen right away, then write it. If the write fails the
// key is refetched so the screen goes back to what's actually stored.
export async function mutate<T>(
  key: string,
  optimistic: (prev: T) => T,
  write: () => PromiseLike<{ error: unknown }>,
) {
  setQueryData<T>(key, optimistic);
  const { error } = await write();
  if (error) {
    void refetch(key);
    throw error;
  }
}

export function useQuery<T>(key: string, fetcher: Fetcher<T>, fallback: T) {
  const fallbackRef = useRef(fallback);
  fetchers.set(key, fetcher as Fetcher<unknown>);

  const subscribe = useCallback(
    (onChange: () => void) => {
      let set = subscribers.get(key);
      if (!set) subscribers.set(key, (set = new Set()));
      set.add(onChange);
      return () => {
        set.delete(onChange);
      };
    },
    [key],
  );
  const entry = useSyncExternalStore(subscribe, () => cache.get(key) as Entry<T> | undefined);
  const hasFailed = useSyncExternalStore(subscribe, () => failed.has(key));

  useEffect(() => {
    void refetch(key);
  }, [key]);

  const reload = useCallback(() => {
    failed.delete(key);
    notify(key);
    return refetch(key);
  }, [key]);

  const status: QueryStatus = entry ? 'ready' : hasFailed ? 'error' : 'loading';
  return { data: entry ? entry.data : fallbackRef.current, status, reload };
}
