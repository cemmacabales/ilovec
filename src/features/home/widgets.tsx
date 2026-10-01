import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarHeart,
  CheckCircle,
  FilmSlate,
  Images,
  MapPin,
  Mountains,
  MusicNotesSimple,
  Play,
  Plus,
  Wallet,
} from '@phosphor-icons/react';
import { Widget, WidgetHead } from './Widget';
import { Check } from '../../components/ui/Check';
import { IconButton } from '../../components/ui/Button';
import { SAVE_FAILED, useToast } from '../../components/ui/Toast';
import { useEvents } from '../../data/events';
import { isOverdue, useTasks } from '../../data/tasks';
import { posterUrl, useWatch } from '../../data/watch';
import { useBudget } from '../../contexts/BudgetContext';
import { useBucketList } from '../../contexts/BucketListContext';
import { useGallery } from '../../contexts/GalleryContext';
import { useConnection } from '../../lib/connection';
import { daysFromToday, formatDay, formatTime, money, parseDay, personLabel, plural } from '../../lib/format';
import { navFor } from '../../app/nav';
import { useLinger } from '../../lib/useLinger';
import { DateSheet } from '../dates/DateSheet';
import { TaskSheet } from '../tasks/TaskSheet';
import { ExpenseSheet } from '../budget/ExpenseSheet';
import { BucketSheet } from '../bucket/BucketSheet';
import usPhoto from '../../assets/us.webp';

function Countdown({ date }: { date: Date }) {
  const n = daysFromToday(date);
  if (n === 0) return <span className="countdown__word">Today</span>;
  if (n === 1) return <span className="countdown__word">Tomorrow</span>;
  return (
    <>
      <span className="countdown__num rounded-num">{n}</span>
      <span className="countdown__unit">days to go</span>
    </>
  );
}

export function NextDateWidget({ index }: { index: number }) {
  const { next, upcoming, status } = useEvents();
  const [adding, setAdding] = useState(false);
  const day = next ? parseDay(next.date) : null;
  const nav = navFor('/dates');

  return (
    <>
      <Widget to={nav.to} tile={nav.tile} area="next" label="Open dates" index={index} tone="photo" className="w-next">
        <img className="w-next__photo" src={usPhoto} alt="" aria-hidden />
        <div className="w-next__shade" aria-hidden />
        <WidgetHead
          icon={<CalendarHeart size={16} weight="fill" />}
          title="Next date"
          aside={
            <IconButton label="Plan a date" tone="filled" className="widget__control" onClick={() => setAdding(true)}>
              <Plus size={16} weight="bold" />
            </IconButton>
          }
        />
        <div className="w-next__body">
          {status === 'loading' && !next ? (
            <span className="skeleton skeleton--line skeleton--on-photo" style={{ width: '60%' }} />
          ) : next && day ? (
            <>
              <p className="countdown">
                <Countdown date={day} />
              </p>
              <h2 className="w-next__title">{next.title}</h2>
              <p className="w-next__meta">
                {formatDay(day, { weekday: true })}
                {next.time && `, ${formatTime(next.time)}`}
                {next.location && (
                  <span className="w-next__place">
                    <MapPin size={14} weight="fill" aria-hidden />
                    {next.location}
                  </span>
                )}
              </p>
              {upcoming.length > 1 && <p className="w-next__more">{plural(upcoming.length - 1, 'more date')} planned</p>}
            </>
          ) : (
            <>
              <h2 className="w-next__title">{status === 'error' ? "Dates aren't loading" : 'Nothing planned yet'}</h2>
              <p className="w-next__meta">
                {status === 'error' ? 'Check back when your data is reachable.' : 'Pick a day and plan your next date.'}
              </p>
            </>
          )}
        </div>
      </Widget>
      <DateSheet open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

export function SpendWidget({ index }: { index: number }) {
  const { isLoaded, getTotalSpentThisMonth, budgets } = useBudget();
  const connection = useConnection();
  const [adding, setAdding] = useState(false);
  const spent = getTotalSpentThisMonth();
  const limit = budgets.filter((b) => b.isActive).reduce((s, b) => s + b.monthlyLimit, 0);
  const month = new Date().toLocaleDateString('en-US', { month: 'long' });
  const nav = navFor('/budget');
  const unavailable = isLoaded && connection === 'offline';

  return (
    <>
      <Widget to={nav.to} tile={nav.tile} area="spend" label="Open budget" index={index} className="w-spend">
        <WidgetHead
          icon={<Wallet size={16} weight="fill" />}
          title="Spending"
          aside={
            <IconButton label="Log an expense" className="widget__control" onClick={() => setAdding(true)}>
              <Plus size={16} weight="bold" />
            </IconButton>
          }
        />
        <div className="w-stat">
          {!isLoaded ? (
            <span className="skeleton skeleton--figure" />
          ) : (
            <p className="w-stat__figure rounded-num" data-long={spent >= 100000 || undefined}>
              {unavailable ? '-' : money(spent, { round: true })}
            </p>
          )}
          <p className="w-stat__label">
            {unavailable ? 'Not available right now' : limit > 0 ? `of ${money(limit, { round: true })} in ${month}` : `in ${month}`}
          </p>
          {limit > 0 && !unavailable && (
            <span className="meter" aria-hidden>
              <span className="meter__fill" style={{ width: `${Math.min(100, (spent / limit) * 100)}%` }} />
            </span>
          )}
        </div>
      </Widget>
      <ExpenseSheet open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

export function BucketWidget({ index }: { index: number }) {
  const { items, isLoading } = useBucketList();
  const connection = useConnection();
  const [adding, setAdding] = useState(false);
  const unavailable = !isLoading && items.length === 0 && connection === 'offline';
  const nav = navFor('/bucket-list');
  const done = items.filter((i) => i.status === 'completed').length;
  const focus =
    items
      .filter((i) => i.status === 'in_progress')
      .sort((a, b) => b.progress - a.progress)[0] ?? items.find((i) => i.status === 'not_started');

  return (
    <>
      <Widget to={nav.to} tile={nav.tile} area="bucket" label="Open bucket list" index={index} className="w-bucket">
        <WidgetHead
          icon={<Mountains size={16} weight="fill" />}
          title="Bucket list"
          aside={
            <IconButton label="Add to the bucket list" className="widget__control" onClick={() => setAdding(true)}>
              <Plus size={16} weight="bold" />
            </IconButton>
          }
        />
        <div className="w-stat">
          {isLoading ? (
            <span className="skeleton skeleton--figure" />
          ) : (
            <p className="w-stat__figure rounded-num">
              {unavailable ? '-' : done}
              {items.length > 0 && <span className="w-stat__of">/{items.length}</span>}
            </p>
          )}
          <p className="w-stat__label">
            {unavailable ? 'Not available right now' : items.length ? 'done together' : 'Add the first thing you want to do'}
          </p>
          {focus && <p className="w-stat__focus">Next: {focus.title}</p>}
        </div>
      </Widget>
      <BucketSheet open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

export function TasksWidget({ index }: { index: number }) {
  const { open, status, toggle } = useTasks();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const { leaving, start: finish } = useLinger(async (id) => {
    try {
      await toggle(id, true);
    } catch {
      toast(SAVE_FAILED, 'error');
    }
  });
  const nav = navFor('/tasks');

  const shown = open.slice(0, 3);

  return (
    <>
      <Widget to={nav.to} tile={nav.tile} area="tasks" label="Open tasks" index={index} className="w-tasks">
        <WidgetHead
          icon={<CheckCircle size={16} weight="fill" />}
          title="Tasks"
          aside={
            <>
              {open.length > 0 && <span className="widget__count num">{open.length} open</span>}
              <IconButton label="Add a task" className="widget__control" onClick={() => setAdding(true)}>
                <Plus size={16} weight="bold" />
              </IconButton>
            </>
          }
        />
        {status === 'loading' && open.length === 0 ? (
          <div className="w-tasks__list">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-task">
                <span className="skeleton skeleton--dot" />
                <span className="skeleton skeleton--line" style={{ width: `${70 - i * 15}%` }} />
              </div>
            ))}
          </div>
        ) : shown.length ? (
          <ul className="w-tasks__list">
            {shown.map((t) => {
              const isLeaving = leaving.has(t.id);
              const due = parseDay(t.due);
              return (
                <li key={t.id} className="w-task" data-done={isLeaving || undefined}>
                  <Check
                    checked={isLeaving}
                    onChange={() => finish(t.id)}
                    label={`Mark "${t.title}" done`}
                    size="sm"
                    disabled={isLeaving}
                  />
                  <span className="w-task__title">{t.title}</span>
                  <span className="w-task__meta" data-overdue={isOverdue(t) || undefined}>
                    {due ? formatDay(due) : personLabel(t.who)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="widget__empty">
            {status === 'error' ? "Tasks aren't loading right now." : 'All clear. Nothing on the list.'}
          </p>
        )}
      </Widget>
      <TaskSheet open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

export function WatchWidget({ index }: { index: number }) {
  const { byStatus, status } = useWatch();
  const nav = navFor('/watch');
  const watching = byStatus.watching;
  const list = watching.length ? watching : byStatus.watchlist;
  const label = watching.length ? 'Watching' : 'Up next';

  return (
    <Widget to={nav.to} tile={nav.tile} area="watch" label="Open watchlist" index={index} className="w-watch">
      <WidgetHead
        icon={<FilmSlate size={16} weight="fill" />}
        title={label}
        aside={
          <>
            {list.length > 0 && <span className="widget__count num">{list.length}</span>}
            <Link to="/watch?view=find" viewTransition className="icon-btn widget__control" aria-label="Find something to watch" title="Find something to watch">
              <Plus size={16} weight="bold" />
            </Link>
          </>
        }
      />
      {status === 'loading' && list.length === 0 ? (
        <div className="w-watch__row">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="skeleton w-watch__poster" />
          ))}
        </div>
      ) : list.length ? (
        <div className="w-watch__row">
          {list.slice(0, 5).map((t) => {
            const src = posterUrl(t.posterPath, 'w185');
            return src ? (
              <img key={t.id} className="w-watch__poster" src={src} alt={t.title} loading="lazy" />
            ) : (
              <span key={t.id} className="w-watch__poster w-watch__poster--text">
                {t.title}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="widget__empty">
          {status === 'error' ? "Your watchlist isn't loading right now." : 'Find a movie or show to watch together.'}
        </p>
      )}
    </Widget>
  );
}

export function GalleryWidget({ index }: { index: number }) {
  const { photos, addPhotos } = useGallery();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const nav = navFor('/gallery');
  // The shipped photo already fronts the Next date widget; only show a cover
  // here once something has been added, so Home never repeats an image.
  const uploads = photos.filter((p) => !p.sample);
  const cover = uploads.find((p) => p.favorite) ?? uploads[0];

  const add = (
    <>
      <IconButton label="Add photos" className="widget__control" tone={cover ? 'filled' : 'default'} onClick={() => fileRef.current?.click()}>
        <Plus size={16} weight="bold" />
      </IconButton>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
          if (!files.length) return;
          addPhotos(files, { albumId: null, tags: [] });
          toast(`Added ${plural(files.length, 'photo')}`);
          e.target.value = '';
        }}
      />
    </>
  );

  return (
    <Widget
      to={nav.to}
      tile={nav.tile}
      area="gallery"
      label="Open gallery"
      index={index}
      tone={cover ? 'photo' : 'plain'}
      className="w-gallery"
    >
      {cover && <img className="w-gallery__photo" src={cover.url} alt="" aria-hidden />}
      {cover && <div className="w-gallery__shade" aria-hidden />}
      <WidgetHead icon={<Images size={16} weight="fill" />} title="Gallery" aside={add} />
      {cover ? (
        <p className="w-gallery__count">{plural(photos.length, 'photo')}</p>
      ) : (
        <div className="w-stat">
          <p className="w-stat__figure rounded-num">{photos.length}</p>
          <p className="w-stat__label">Add photos from your dates</p>
        </div>
      )}
    </Widget>
  );
}

export function MusicWidget({ index }: { index: number }) {
  const nav = navFor('/music');
  return (
    <Widget to={nav.to} tile={nav.tile} area="music" label="Open our playlist" index={index} tone="accent" className="w-music">
      <WidgetHead icon={<MusicNotesSimple size={16} weight="fill" />} title="Music" />
      <div className="w-music__body">
        <p className="w-music__name">mylove</p>
        <p className="w-music__sub">Our playlist</p>
      </div>
      <span className="w-music__play" aria-hidden>
        <Play size={16} weight="fill" />
      </span>
    </Widget>
  );
}
