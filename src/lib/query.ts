import { useCallback, useEffect, useRef, useState } from 'react';

export type QueryStatus = 'loading' | 'ready' | 'error';

interface Entry<T> {
  data: T;
  at: number;
}

// Module-level cache so a widget's data is already there when its page opens
// (and vice versa). Entries are refreshed in the background on every mount.
const cache = new Map<string, Entry<unknown>>();
const subscribers = new Map<string, Set<() => void>>();

function notify(key: string) {
  subscribers.get(key)?.forEach((fn) => fn());
}

export function invalidate(key: string) {
  cache.delete(key);
  notify(key);
}

export function setQueryData<T>(key: string, update: (prev: T | undefined) => T) {
  const prev = cache.get(key) as Entry<T> | undefined;
  cache.set(key, { data: update(prev?.data), at: Date.now() });
  notify(key);
}

type Fetcher<T> = () => Promise<{ data: T | null; error: unknown }>;

export function useQuery<T>(key: string, fetcher: Fetcher<T>, fallback: T) {
  const cached = cache.get(key) as Entry<T> | undefined;
  const [data, setData] = useState<T>(cached ? cached.data : fallback);
  const [status, setStatus] = useState<QueryStatus>(cached ? 'ready' : 'loading');
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    const { data: next, error } = await fetcherRef.current();
    if (error || next === null) {
      if (!cache.has(key)) setStatus('error');
      return;
    }
    cache.set(key, { data: next, at: Date.now() });
    notify(key);
  }, [key]);

  useEffect(() => {
    const onChange = () => {
      const entry = cache.get(key) as Entry<T> | undefined;
      if (entry) {
        setData(entry.data);
        setStatus('ready');
      } else {
        void load();
      }
    };
    let set = subscribers.get(key);
    if (!set) {
      set = new Set();
      subscribers.set(key, set);
    }
    set.add(onChange);
    void load();
    return () => {
      set?.delete(onChange);
    };
  }, [key, load]);

  const reload = useCallback(() => {
    setStatus((s) => (s === 'error' ? 'loading' : s));
    return load();
  }, [load]);

  return { data, status, reload };
}
