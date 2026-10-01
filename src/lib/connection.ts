import { useSyncExternalStore } from 'react';
import { demoMode } from '../dev/flag';

// Tracks whether the shared database is reachable, based on real requests.
// 'unknown' until the first request settles.
export type ConnectionState = 'unknown' | 'online' | 'offline';

let state: ConnectionState = 'unknown';
const listeners = new Set<() => void>();

function set(next: ConnectionState) {
  if (next === state) return;
  state = next;
  listeners.forEach((l) => l());
}

export const connection = {
  markOnline: () => set('online'),
  markOffline: () => set('offline'),
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// fetch wrapper handed to the Supabase client: network failures flip the
// app into offline mode, any HTTP response means the server is reachable.
export const trackedFetch: typeof fetch = async (input, init) => {
  if (import.meta.env.DEV && demoMode) {
    const demo = await import('../dev/demo');
    const res = await demo.demoFetch(input, init);
    if (res) {
      connection.markOnline();
      return res;
    }
  }
  try {
    const res = await fetch(input, init);
    connection.markOnline();
    return res;
  } catch (err) {
    connection.markOffline();
    throw err;
  }
};

export function useConnection(): ConnectionState {
  return useSyncExternalStore(connection.subscribe, connection.get, connection.get);
}
