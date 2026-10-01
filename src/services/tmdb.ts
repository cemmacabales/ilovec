import type { TMDBMovie, TMDBSearchResponse, TMDBTVShow } from '../types/tmdb';

// Requests go through our own /api/tmdb proxy (netlify/functions/tmdb.mts),
// which adds the API key on the server so it never ships in the bundle.
const PROXY = '/api/tmdb';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const qs = query.toString();
  const res = await fetch(`${PROXY}${path}${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

type Results<T> = Promise<TMDBSearchResponse<T>>;

export const tmdb = {
  searchMulti: (query: string, page = 1): Results<TMDBMovie | TMDBTVShow> => get('/search/multi', { query, page }),
  searchMovies: (query: string, page = 1): Results<TMDBMovie> => get('/search/movie', { query, page }),
  searchTVShows: (query: string, page = 1): Results<TMDBTVShow> => get('/search/tv', { query, page }),
  getTrending: (kind: 'all' | 'movie' | 'tv' = 'all', window: 'day' | 'week' = 'week'): Results<TMDBMovie | TMDBTVShow> =>
    get(`/trending/${kind}/${window}`),
};

export function tmdbImageUrl(path: string | null | undefined, size: 'w92' | 'w185' | 'w342' | 'w500' | 'original' = 'w500') {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}
