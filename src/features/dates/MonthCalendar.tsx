import { useMemo } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { IconButton } from '../../components/ui/Button';
import { toDayKey, todayKey } from '../../lib/format';

interface MonthCalendarProps {
  month: Date; // any day in the shown month
  onMonthChange: (month: Date) => void;
  selected: string | null;
  onSelect: (day: string | null) => void;
  marked: Set<string>;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Six fixed rows so every month keeps the same scale.
export function MonthCalendar({ month, onMonthChange, selected, onSelect, marked }: MonthCalendarProps) {
  const today = todayKey();
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { date: d, key: toDayKey(d), inMonth: d.getMonth() === month.getMonth() };
    });
  }, [month]);

  const title = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const shift = (n: number) => onMonthChange(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="cal">
      <div className="cal__head">
        <h2 className="cal__title" aria-live="polite">
          {title}
        </h2>
        <button type="button" className="cal__today" onClick={() => onMonthChange(new Date())}>
          Today
        </button>
        <IconButton label="Previous month" onClick={() => shift(-1)}>
          <CaretLeft size={16} weight="bold" />
        </IconButton>
        <IconButton label="Next month" onClick={() => shift(1)}>
          <CaretRight size={16} weight="bold" />
        </IconButton>
      </div>
      <div className="cal__grid" role="grid" aria-label={title}>
        <div className="cal__row" role="row">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="cal__weekday" role="columnheader" aria-label={WEEKDAY_NAMES[i]}>
              {d}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, r) => (
          <div key={r} className="cal__row" role="row">
            {cells.slice(r * 7, r * 7 + 7).map((c) => {
              const isSelected = c.key === selected;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${c.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${marked.has(c.key) ? ', has plans' : ''}`}
                  className="cal__day"
                  data-out={!c.inMonth || undefined}
                  data-today={c.key === today || undefined}
                  onClick={() => onSelect(isSelected ? null : c.key)}
                >
                  <span className="cal__num num">{c.date.getDate()}</span>
                  {marked.has(c.key) && <span className="cal__dot" aria-hidden />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
