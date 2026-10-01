import { useSyncExternalStore } from 'react';
import { supabase } from '../services/supabase';
import { clearQueries, useQuery } from './query';
import type { Person } from './format';
import { demoMode } from '../dev/flag';

// Who is signed in on this device. Accounts are created in the Supabase
// dashboard (no public sign-up) and linked to Him or Her in `members`.
export type AuthState = { status: 'loading' } | { status: 'signed-out' } | { status: 'signed-in'; userId: string };

let state: AuthState = { status: 'loading' };
const listeners = new Set<() => void>();

function set(next: AuthState) {
  const same =
    next.status === state.status &&
    (next.status !== 'signed-in' || (state.status === 'signed-in' && state.userId === next.userId));
  if (same) return;
  state = next;
  listeners.forEach((l) => l());
}

// Fires once with the stored session (INITIAL_SESSION), then on every change.
supabase.auth.onAuthStateChange((_event, session) => {
  set(session ? { status: 'signed-in', userId: session.user.id } : { status: 'signed-out' });
});

export function useAuth(): AuthState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
  clearQueries();
}

interface Member {
  userId: string;
  person: Exclude<Person, 'both'>;
}

async function loadMembers() {
  const { data, error } = await supabase.from('members').select('user_id, person');
  return {
    data: data ? data.map((m) => ({ userId: m.user_id, person: m.person === 'her' ? 'her' : 'him' }) as Member) : null,
    error,
  };
}

// The signed-in account's place in the couple. RLS only returns member rows
// to members, so an account that isn't linked yet sees none.
export function useMe() {
  const auth = useAuth();
  const { data, status, reload } = useQuery<Member[]>('members', loadMembers, []);
  const userId = demoMode ? 'demo' : auth.status === 'signed-in' ? auth.userId : null;
  const me = data.find((m) => m.userId === userId) ?? null;
  return { person: me?.person ?? null, status, reload };
}
