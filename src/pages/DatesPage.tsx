import { useMemo, useState } from 'react';
import { CalendarHeart, Clock, MapPin, Plus } from '@phosphor-icons/react';
import { Page } from '../components/ui/Page';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Check } from '../components/ui/Check';
import { EmptyState, LoadError, SkeletonRows } from '../components/ui/Feedback';
import { SAVE_FAILED, useToast } from '../components/ui/Toast';
import { DateSheet } from '../features/dates/DateSheet';
import { MonthCalendar } from '../features/dates/MonthCalendar';
import { useEvents, type DateEvent } from '../data/events';
import { navFor } from '../app/nav';
import { formatDay, formatTime, parseDay, plural, relativeDay } from '../lib/format';

export default function DatesPage() {
  const nav = navFor('/dates');
  const { events, upcoming, past, status, reload, toggle } = useEvents();
  const toast = useToast();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ open: boolean; event: DateEvent | null }>({ open: false, event: null });
  const [showAllPast, setShowAllPast] = useState(false);

  const marked = useMemo(() => new Set(events.map((e) => e.date)), [events]);
  const onDay = useMemo(() => events.filter((e) => e.date === selected), [events, selected]);

  const row = (e: DateEvent) => {
    const d = parseDay(e.date);
    return (
      <li key={e.id} className="event-row" data-done={e.done || undefined}>
        <span className="event-row__date" aria-hidden>
          <span className="event-row__day rounded-num">{d?.getDate() ?? '-'}</span>
          <span className="event-row__month">{d?.toLocaleDateString('en-US', { month: 'short' })}</span>
        </span>
        <button type="button" className="event-row__main" onClick={() => setSheet({ open: true, event: e })}>
          <span className="event-row__title">{e.title}</span>
          <span className="event-row__meta">
            {d && <span>{relativeDay(d)}</span>}
            {e.time && (
              <span className="event-row__bit">
                <Clock size={14} aria-hidden />
                {formatTime(e.time)}
              </span>
            )}
            {e.location && (
              <span className="event-row__bit">
                <MapPin size={14} aria-hidden />
                {e.location}
              </span>
            )}
          </span>
        </button>
        <Check
          checked={e.done}
          label={e.done ? `Mark "${e.title}" as not done` : `Mark "${e.title}" as done`}
          onChange={async (next) => {
            try {
              await toggle(e.id, next);
            } catch {
              toast(SAVE_FAILED, 'error');
            }
          }}
        />
      </li>
    );
  };

  const selectedDate = parseDay(selected);
  const pastShown = showAllPast ? past : past.slice(0, 5);

  return (
    <Page tile={nav.tile}>
      <PageHeader
        icon={<CalendarHeart size={26} weight="fill" />}
        title="Dates"
        description={upcoming.length ? `${plural(upcoming.length, 'date')} coming up` : 'Plan something together'}
        actions={
          <Button variant="primary" icon={<Plus size={16} weight="bold" />} onClick={() => setSheet({ open: true, event: null })}>
            Plan a date
          </Button>
        }
      />

      <div className="dates-layout">
        <div className="dates-layout__cal">
          <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={setSelected}
            marked={marked}
          />
        </div>

        <div className="dates-layout__list">
          {status === 'loading' && events.length === 0 ? (
            <SkeletonRows count={3} />
          ) : status === 'error' && events.length === 0 ? (
            <LoadError what="your dates" onRetry={reload} />
          ) : selected && selectedDate ? (
            <section className="list-group" aria-label={formatDay(selectedDate, { weekday: true })}>
              <div className="list-group__bar">
                <h2 className="list-group__label">{formatDay(selectedDate, { weekday: true, year: true })}</h2>
                <button type="button" className="text-btn" onClick={() => setSelected(null)}>
                  Show all
                </button>
              </div>
              {onDay.length ? (
                <ul className="rows">{onDay.map(row)}</ul>
              ) : (
                <EmptyState
                  compact
                  icon={<CalendarHeart size={24} />}
                  title="Free day"
                  action={
                    <Button size="sm" icon={<Plus size={14} weight="bold" />} onClick={() => setSheet({ open: true, event: null })}>
                      Plan something
                    </Button>
                  }
                />
              )}
            </section>
          ) : events.length === 0 ? (
            <EmptyState
              icon={<CalendarHeart size={28} />}
              title="No dates yet"
              action={
                <Button variant="primary" icon={<Plus size={16} weight="bold" />} onClick={() => setSheet({ open: true, event: null })}>
                  Plan a date
                </Button>
              }
            >
              Dinner, a trip, a movie night. Plan it here and it shows up for both of you.
            </EmptyState>
          ) : (
            <>
              <section className="list-group" aria-label="Coming up">
                <h2 className="list-group__label">Coming up</h2>
                {upcoming.length ? (
                  <ul className="rows">{upcoming.map(row)}</ul>
                ) : (
                  <p className="list-group__empty">Nothing planned. Pick a day on the calendar.</p>
                )}
              </section>
              {past.length > 0 && (
                <section className="list-group" aria-label="Done and past">
                  <h2 className="list-group__label">Done and past</h2>
                  <ul className="rows">{pastShown.map(row)}</ul>
                  {past.length > 5 && (
                    <button type="button" className="text-btn" onClick={() => setShowAllPast((v) => !v)}>
                      {showAllPast ? 'Show fewer' : `Show all ${past.length}`}
                    </button>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <DateSheet
        open={sheet.open}
        editing={sheet.event}
        defaultDate={selected ?? undefined}
        onClose={() => setSheet({ open: false, event: null })}
      />
    </Page>
  );
}
