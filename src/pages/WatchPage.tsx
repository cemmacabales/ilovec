import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check as CheckIcon, FilmSlate, MagnifyingGlass, Plus, Star, Television } from '@phosphor-icons/react';
import { Page } from '../components/ui/Page';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { Sheet } from '../components/ui/Sheet';
import { ConfirmButton, EmptyState, LoadError } from '../components/ui/Feedback';
import { ChoiceRow, FieldGroup } from '../components/ui/Fields';
import { SAVE_FAILED, useToast } from '../components/ui/Toast';
import { tmdb } from '../services/tmdb';
import type { TMDBMovie, TMDBTVShow } from '../types/tmdb';
import {
  WATCH_STATUSES,
  mediaKind,
  mediaTitle,
  mediaYear,
  posterUrl,
  useWatch,
  type Tracked,
  type WatchStatus,
} from '../data/watch';
import { navFor } from '../app/nav';

type View = WatchStatus | 'find';
type Kind = 'all' | 'movie' | 'tv';
type Media = TMDBMovie | TMDBTVShow;

function Poster({ path, title, kind }: { path: string | null; title: string; kind: 'movie' | 'tv' }) {
  const src = posterUrl(path);
  return src ? (
    <img className="poster__img" src={src} alt="" loading="lazy" />
  ) : (
    <span className="poster__img poster__img--empty">
      {kind === 'tv' ? <Television size={28} aria-hidden /> : <FilmSlate size={28} aria-hidden />}
      <span>{title}</span>
    </span>
  );
}

function useFind(query: string, kind: Kind, active: boolean) {
  const [results, setResults] = useState<Media[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const q = query.trim();
    const timer = window.setTimeout(async () => {
      setState('loading');
      try {
        let items: Media[];
        if (!q) {
          items = (await tmdb.getTrending(kind === 'all' ? 'all' : kind, 'week')).results;
        } else if (kind === 'movie') items = (await tmdb.searchMovies(q)).results;
        else if (kind === 'tv') items = (await tmdb.searchTVShows(q)).results;
        else items = (await tmdb.searchMulti(q)).results;
        // Multi search also returns people; keep only titles.
        items = items.filter((i) => 'title' in i || 'name' in i).filter((i) => !('media_type' in i) || i.media_type !== 'person');
        if (!cancelled) {
          setResults(items.slice(0, 24));
          setState('ready');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    }, q ? 350 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, kind, active]);

  return { results, state };
}

export default function WatchPage() {
  const nav = navFor('/watch');
  const { byStatus, status, reload, find, add, move, remove } = useWatch();
  const toast = useToast();
  const [params] = useSearchParams();
  const [view, setView] = useState<View>(() => (params.get('view') === 'find' ? 'find' : 'watchlist'));
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<Kind>('all');
  const [picked, setPicked] = useState<Tracked | null>(null);
  const [justAdded, setJustAdded] = useState<Set<number>>(new Set());
  const found = useFind(query, kind, view === 'find');

  const counts = {
    watchlist: byStatus.watchlist.length,
    watching: byStatus.watching.length,
    completed: byStatus.completed.length,
  };

  const addItem = async (item: Media) => {
    setJustAdded((s) => new Set(s).add(item.id));
    try {
      await add(item);
      toast(`Added ${mediaTitle(item)}`);
    } catch {
      setJustAdded((s) => {
        const next = new Set(s);
        next.delete(item.id);
        return next;
      });
      toast(SAVE_FAILED, 'error');
    }
  };

  const list = view === 'find' ? [] : byStatus[view];

  return (
    <Page tile={nav.tile}>
      <PageHeader
        icon={<FilmSlate size={26} weight="fill" />}
        title="Watchlist"
        description={`${counts.watchlist} to watch, ${counts.watching} watching, ${counts.completed} watched`}
        actions={
          view !== 'find' && (
            <Button variant="primary" icon={<Plus size={16} weight="bold" />} onClick={() => setView('find')}>
              Find something
            </Button>
          )
        }
      />

      <div className="toolbar">
        <Segmented
          label="List"
          value={view}
          onChange={setView}
          options={[
            { value: 'watchlist', label: 'To watch', count: counts.watchlist },
            { value: 'watching', label: 'Watching', count: counts.watching },
            { value: 'completed', label: 'Watched', count: counts.completed },
            { value: 'find', label: 'Find' },
          ]}
        />
      </div>

      {view === 'find' ? (
        <>
          <div className="search-row">
            <label className="search">
              <MagnifyingGlass size={18} weight="bold" aria-hidden />
              <span className="visually-hidden">Search movies and shows</span>
              <input
                type="search"
                placeholder="Search movies and shows"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </label>
            <Segmented
              label="Type"
              value={kind}
              onChange={setKind}
              options={[
                { value: 'all', label: 'All' },
                { value: 'movie', label: 'Movies' },
                { value: 'tv', label: 'Shows' },
              ]}
            />
          </div>
          {!query.trim() && found.state === 'ready' && <h2 className="list-group__label">Popular this week</h2>}
          {found.state === 'error' ? (
            <EmptyState icon={<MagnifyingGlass size={28} />} title="Search isn't working right now">
              The movie database didn't answer. Check the connection and try again.
            </EmptyState>
          ) : found.state === 'loading' && found.results.length === 0 ? (
            <div className="poster-grid" aria-busy="true">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="skeleton poster__img" />
              ))}
            </div>
          ) : found.results.length === 0 && found.state === 'ready' ? (
            <EmptyState icon={<MagnifyingGlass size={28} />} title="No matches">
              Try a different title.
            </EmptyState>
          ) : (
            <ul className="poster-grid" aria-busy={found.state === 'loading'}>
              {found.results.map((item) => {
                const k = mediaKind(item);
                const tracked = find(item.id, k);
                const added = !!tracked || justAdded.has(item.id);
                const title = mediaTitle(item);
                return (
                  <li key={`${k}-${item.id}`} className="poster">
                    <Poster path={item.poster_path} title={title} kind={k} />
                    <p className="poster__title">{title}</p>
                    <p className="poster__meta">
                      {k === 'tv' ? 'Show' : 'Movie'}
                      {mediaYear(item) && `, ${mediaYear(item)}`}
                      {item.vote_average > 0 && (
                        <span className="poster__rating">
                          <Star size={12} weight="fill" aria-hidden />
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </p>
                    <button
                      type="button"
                      className="poster__add"
                      data-added={added || undefined}
                      disabled={added}
                      aria-label={added ? `${title} is on your list` : `Add ${title} to your list`}
                      onClick={() => void addItem(item)}
                    >
                      {added ? <CheckIcon size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : status === 'loading' && list.length === 0 ? (
        <div className="poster-grid" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="skeleton poster__img" />
          ))}
        </div>
      ) : status === 'error' && list.length === 0 ? (
        <LoadError what="your watchlist" onRetry={reload} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<FilmSlate size={28} />}
          title={view === 'watchlist' ? 'Nothing saved yet' : view === 'watching' ? 'Not watching anything' : 'Nothing watched yet'}
          action={
            view === 'watchlist' && (
              <Button icon={<MagnifyingGlass size={16} weight="bold" />} onClick={() => setView('find')}>
                Find something
              </Button>
            )
          }
        >
          {view === 'watchlist'
            ? 'Search for a movie or show and save it for a night in.'
            : view === 'watching'
              ? 'Move something here when you start it.'
              : 'Finished titles land here.'}
        </EmptyState>
      ) : (
        <ul className="poster-grid">
          {list.map((t) => (
            <li key={t.id} className="poster">
              <button type="button" className="poster__open" onClick={() => setPicked(t)} aria-label={`${t.title}, change list`}>
                <Poster path={t.posterPath} title={t.title} kind={t.kind} />
              </button>
              <p className="poster__title">{t.title}</p>
              <p className="poster__meta">{t.kind === 'tv' ? 'Show' : 'Movie'}</p>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!picked} onClose={() => setPicked(null)} title={picked?.title ?? ''}>
        {picked && (
          <div className="sheet-form">
            <div className="watch-detail">
              <Poster path={picked.posterPath} title={picked.title} kind={picked.kind} />
            </div>
            <FieldGroup>
              <ChoiceRow
                label="List"
                value={picked.status}
                options={WATCH_STATUSES.map((s) => ({ ...s, label: s.value === 'watchlist' ? 'To watch' : s.label }))}
                onChange={async (to) => {
                  const item = picked;
                  setPicked({ ...item, status: to });
                  try {
                    await move(item, to);
                  } catch {
                    toast(SAVE_FAILED, 'error');
                  }
                }}
              />
            </FieldGroup>
            <div className="sheet-actions">
              <ConfirmButton
                confirmLabel="Tap again to remove"
                onConfirm={async () => {
                  const item = picked;
                  setPicked(null);
                  try {
                    await remove(item);
                    toast(`Removed ${item.title}`);
                  } catch {
                    toast(SAVE_FAILED, 'error');
                  }
                }}
              >
                Remove from list
              </ConfirmButton>
              <Button variant="primary" onClick={() => setPicked(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </Page>
  );
}
