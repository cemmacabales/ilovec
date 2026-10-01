import { useMemo, useState } from 'react';
import { Mountains, Plus } from '@phosphor-icons/react';
import { Page } from '../components/ui/Page';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { Check } from '../components/ui/Check';
import { EmptyState, SkeletonRows } from '../components/ui/Feedback';
import { SAVE_FAILED, useToast } from '../components/ui/Toast';
import { useBucketList, type BucketItem } from '../data/bucket';
import { navFor } from '../app/nav';
import { capitalize, formatDay, money, parseDay } from '../lib/format';
import { BucketSheet } from '../features/bucket/BucketSheet';

type View = 'all' | 'in_progress' | 'not_started' | 'completed';

export default function BucketListPage() {
  const nav = navFor('/bucket-list');
  const { items, status, update: updateItem } = useBucketList();
  const isLoading = status === 'loading';
  const unavailable = status === 'error';
  const toast = useToast();
  const [view, setView] = useState<View>('all');
  const [sheet, setSheet] = useState<{ open: boolean; item: BucketItem | null }>({ open: false, item: null });

  const counts = useMemo(
    () => ({
      all: items.length,
      in_progress: items.filter((i) => i.status === 'in_progress').length,
      not_started: items.filter((i) => i.status === 'not_started' || i.status === 'on_hold').length,
      completed: items.filter((i) => i.status === 'completed').length,
    }),
    [items],
  );

  const shown = useMemo(() => {
    const filtered = items.filter((i) => {
      if (view === 'all') return i.status !== 'cancelled';
      if (view === 'not_started') return i.status === 'not_started' || i.status === 'on_hold';
      return i.status === view;
    });
    return filtered.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      return b.progress - a.progress;
    });
  }, [items, view]);

  return (
    <Page tile={nav.tile}>
      <PageHeader
        icon={<Mountains size={26} weight="fill" />}
        title="Bucket list"
        description={items.length ? `${counts.completed} of ${items.length} done together` : 'Things you want to do together'}
        actions={
          <Button variant="primary" icon={<Plus size={16} weight="bold" />} onClick={() => setSheet({ open: true, item: null })}>
            Add to list
          </Button>
        }
      />

      <div className="toolbar">
        <Segmented
          label="Show"
          value={view}
          onChange={setView}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'in_progress', label: 'In progress', count: counts.in_progress },
            { value: 'not_started', label: 'Someday', count: counts.not_started },
            { value: 'completed', label: 'Done', count: counts.completed },
          ]}
        />
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={<Mountains size={28} />}
          title={
            unavailable
              ? "Your list isn't loading"
              : view === 'completed'
                ? 'Nothing done yet'
                : 'Nothing here yet'
          }
          action={
            view !== 'completed' && (
              <Button icon={<Plus size={16} weight="bold" />} onClick={() => setSheet({ open: true, item: null })}>
                Add to list
              </Button>
            )
          }
        >
          {unavailable
            ? "Your shared data isn't reachable right now."
            : 'A trip, a class, a concert. Add the things you want to do together.'}
        </EmptyState>
      ) : (
        <ul className="rows">
          {shown.map((item) => {
            const done = item.status === 'completed';
            const target = parseDay(item.targetDate);
            return (
              <li key={item.id} className="goal-row" data-done={done || undefined}>
                <Check
                  checked={done}
                  label={done ? `Mark "${item.title}" not done` : `Mark "${item.title}" done`}
                  onChange={async (next) => {
                    try {
                      await updateItem(item.id, next ? { status: 'completed', progress: 100 } : { status: 'in_progress', progress: 90 });
                    } catch {
                      toast(SAVE_FAILED, 'error');
                    }
                  }}
                />
                <button type="button" className="goal-row__main" onClick={() => setSheet({ open: true, item })}>
                  <span className="goal-row__title">{item.title}</span>
                  <span className="goal-row__meta">
                    <span className="pill">{capitalize(item.category)}</span>
                    {target && <span>By {formatDay(target)}</span>}
                    {item.estimatedCost ? <span className="num">{money(item.estimatedCost, { round: true, currency: item.currency })}</span> : null}
                  </span>
                </button>
                <span className="goal-row__progress" aria-label={`${item.progress}% done`}>
                  <span className="num">{item.progress}%</span>
                  <span className="meter meter--mini" aria-hidden>
                    <span className="meter__fill" style={{ width: `${item.progress}%` }} />
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <BucketSheet open={sheet.open} editing={sheet.item} onClose={() => setSheet({ open: false, item: null })} />
    </Page>
  );
}
