import { useMemo } from 'react';
import { addMovieSeries, fetchMovieSeries, removeMovieSeries, updateMovieSeries } from '../services/supabase';
import { invalidate, setQueryData, useQuery } from '../lib/query';
import tmdbService from '../services/tmdb';
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

interface TrackedRow {
  id: string;
  tmdb_id: number;
  type?: string;
  title?: string;
  notes?: string; // poster path is stored here
  poster_path?: string;
  status?: string;
  created_at?: string;
}

function toTracked(row: TrackedRow): Tracked {
  const status = WATCH_STATUSES.find((s) => s.value === row.status)?.value ?? 'watchlist';
  return {
    id: String(row.id),
    tmdbId: Number(row.tmdb_id),
    kind: row.type === 'tv' ? 'tv' : 'movie',
    title: row.title ?? 'Untitled',
    posterPath: row.poster_path || row.notes || '',
    status,
    createdAt: row.created_at ?? '',
  };
}

async function load() {
  const { data, error } = await fetchMovieSeries();
  return { data: data ? (data as TrackedRow[]).map(toTracked) : null, error };
}

export function posterUrl(path: string | null | undefined, size: 'w185' | 'w342' = 'w342') {
  return path ? tmdbService.getImageUrl(path, size) : null;
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
      const { error } = await addMovieSeries({
        tmdbId: item.id,
        type: mediaKind(item),
        title: mediaTitle(item) || 'Untitled',
        poster_path: item.poster_path ?? undefined,
        status: to,
      });
      if (error) throw error;
      invalidate(KEY);
    },
    async move(t: Tracked, to: WatchStatus) {
      setQueryData<Tracked[]>(KEY, (prev = []) => prev.map((x) => (x.id === t.id ? { ...x, status: to } : x)));
      const { error } = await updateMovieSeries(t.id, { status: to, notes: t.posterPath });
      if (error) {
        invalidate(KEY);
        throw error;
      }
    },
    async remove(t: Tracked) {
      setQueryData<Tracked[]>(KEY, (prev = []) => prev.filter((x) => x.id !== t.id));
      const { error } = await removeMovieSeries(t.id);
      if (error) {
        invalidate(KEY);
        throw error;
      }
    },
  };
}
