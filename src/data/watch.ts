import { useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Tables } from '../types/database';
import { mutate, setQueryData, useQuery } from '../lib/query';
import { tmdbImageUrl } from '../services/tmdb';
import type { TMDBMovie, TMDBTVShow } from '../types/tmdb';

export type WatchStatus = 'watchlist' | 'watching' | 'completed';
export type MediaKind = 'movie' | 'tv';

export interface Tracked {
  id: string;
  tmdbId: number;
  kind: MediaKind;
  title: string;
  posterPath: string;
  status: WatchStatus;
  createdAt: string;
}

export const WATCH_STATUSES: { value: WatchStatus; label: string }[] = [
  { value: 'watchlist', label: 'Want to watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Watched' },
];

const KEY = 'watch';

function toTracked(row: Tables<'watchlist'>): Tracked {
  return {
    id: row.id,
    tmdbId: row.tmdb_id,
    kind: row.kind === 'tv' ? 'tv' : 'movie',
    title: row.title,
    posterPath: row.poster_path ?? '',
    status: row.status as WatchStatus,
    createdAt: row.created_at,
  };
}

async function load() {
  const { data, error } = await supabase.from('watchlist').select('*').order('created_at', { ascending: false });
  return { data: data ? data.map(toTracked) : null, error };
}

export function posterUrl(path: string | null | undefined, size: 'w185' | 'w342' = 'w342') {
  return tmdbImageUrl(path, size);
}

export function mediaTitle(item: TMDBMovie | TMDBTVShow) {
  return 'title' in item ? item.title : item.name;
}

export function mediaKind(item: TMDBMovie | TMDBTVShow): MediaKind {
  return 'title' in item ? 'movie' : 'tv';
}

export function mediaYear(item: TMDBMovie | TMDBTVShow) {
  const d = 'title' in item ? item.release_date : item.first_air_date;
  return d ? d.slice(0, 4) : '';
}

export function useWatch() {
  const { data, status, reload } = useQuery<Tracked[]>(KEY, load, []);

  const byStatus = useMemo(() => {
    const groups: Record<WatchStatus, Tracked[]> = { watchlist: [], watching: [], completed: [] };
    for (const t of data) groups[t.status].push(t);
    return groups;
  }, [data]);

  return {
    items: data,
    byStatus,
    status,
    reload,
    find(tmdbId: number, kind: MediaKind) {
      return data.find((t) => t.tmdbId === tmdbId && t.kind === kind);
    },
    async add(item: TMDBMovie | TMDBTVShow, to: WatchStatus = 'watchlist') {
      const { data: row, error } = await supabase
        .from('watchlist')
        .insert({
          tmdb_id: item.id,
          kind: mediaKind(item),
          title: mediaTitle(item) || 'Untitled',
          poster_path: item.poster_path ?? null,
          status: to,
        })
        .select()
        .single();
      if (error) throw error;
      setQueryData<Tracked[]>(KEY, (prev) => [toTracked(row), ...prev]);
    },
    move(t: Tracked, to: WatchStatus) {
      return mutate<Tracked[]>(
        KEY,
        (prev) => prev.map((x) => (x.id === t.id ? { ...x, status: to } : x)),
        () => supabase.from('watchlist').update({ status: to }).eq('id', t.id),
      );
    },
    remove(t: Tracked) {
      return mutate<Tracked[]>(
        KEY,
        (prev) => prev.filter((x) => x.id !== t.id),
        () => supabase.from('watchlist').delete().eq('id', t.id),
      );
    },
  };
}
