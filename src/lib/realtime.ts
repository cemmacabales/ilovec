import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { refetchAll, refetchMatching } from './query';

// Which cached queries each table feeds.
const TABLE_KEYS: Record<string, string[]> = {
  dates: ['dates'],
  tasks: ['tasks'],
  watchlist: ['watch'],
  expenses: ['expenses', 'spend'],
  budgets: ['budgets'],
  savings_goals: ['goals'],
  bucket_list: ['bucket'],
  albums: ['albums'],
  photos: ['photos'],
};

// Bursts of changes (a batch upload, both of you editing) collapse into one refetch per key.
const timers = new Map<string, number>();
function schedule(key: string) {
  window.clearTimeout(timers.get(key));
  timers.set(
    key,
    window.setTimeout(() => {
      timers.delete(key);
      refetchMatching(key);
    }, 200),
  );
}

// Keeps both phones in step: refetch whatever the other person just changed,
// and catch up after the app was in the background or offline.
export function useLiveSync() {
  useEffect(() => {
    let joinedBefore = false;
    const channel = supabase.channel('shared-changes');
    for (const [table, keys] of Object.entries(TABLE_KEYS)) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => keys.forEach(schedule));
    }
    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') return;
      // A rejoin means events may have been missed while disconnected.
      if (joinedBefore) refetchAll();
      joinedBefore = true;
    });

    const catchUp = () => {
      if (document.visibilityState === 'visible') refetchAll();
    };
    document.addEventListener('visibilitychange', catchUp);
    window.addEventListener('online', catchUp);
    return () => {
      document.removeEventListener('visibilitychange', catchUp);
      window.removeEventListener('online', catchUp);
      void supabase.removeChannel(channel);
    };
  }, []);
}
