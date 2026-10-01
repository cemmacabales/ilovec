import { useState } from 'react';
import { CheckCircle, Plus } from '@phosphor-icons/react';
import { Page } from '../components/ui/Page';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { Check } from '../components/ui/Check';
import { EmptyState, LoadError, SkeletonRows } from '../components/ui/Feedback';
import { SAVE_FAILED, useToast } from '../components/ui/Toast';
import { TaskSheet } from '../features/tasks/TaskSheet';
import { TASK_CATEGORIES, isOverdue, useTasks, type Task } from '../data/tasks';
import { navFor } from '../app/nav';
import { daysFromToday, formatDay, parseDay, personLabel, type Person } from '../lib/format';
import { useLinger } from '../lib/useLinger';

type View = 'open' | 'done';
type Who = 'all' | Person;

const WHO: { value: Who; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'him', label: 'Him' },
  { value: 'her', label: 'Her' },
  { value: 'both', label: 'Both' },
];

function groupOpen(tasks: Task[]) {
  const groups: { label: string; items: Task[] }[] = [
    { label: 'Overdue', items: [] },
    { label: 'Today', items: [] },
    { label: 'Coming up', items: [] },
    { label: 'Anytime', items: [] },
  ];
  for (const t of tasks) {
    const d = parseDay(t.due);
    if (!d) groups[3].items.push(t);
    else if (isOverdue(t)) groups[0].items.push(t);
    else if (daysFromToday(d) === 0) groups[1].items.push(t);
    else groups[2].items.push(t);
  }
  return groups.filter((g) => g.items.length);
}

export default function TasksPage() {
  const nav = navFor('/tasks');
  const { open, done, status, reload, add, toggle } = useTasks();
  const toast = useToast();
  const [view, setView] = useState<View>('open');
  const [who, setWho] = useState<Who>('all');
  const [sheet, setSheet] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [quick, setQuick] = useState('');

  const { leaving, start } = useLinger(async (id) => {
    try {
      await toggle(id, true);
    } catch {
      toast(SAVE_FAILED, 'error');
    }
  });

  const matches = (t: Task) => who === 'all' || t.who === who || (who !== 'both' && t.who === 'both');
  const openShown = open.filter(matches);
  const doneShown = done.filter(matches);

  const quickAdd = async () => {
    const title = quick.trim();
    if (!title) return;
    setQuick('');
    try {
      await add({ title, notes: '', who: who === 'all' ? 'both' : who, priority: 'medium', due: '', category: 'other' });
    } catch {
      setQuick(title);
      toast(SAVE_FAILED, 'error');
    }
  };

  const row = (t: Task) => {
    const due = parseDay(t.due);
    const isLeaving = leaving.has(t.id);
    const checked = t.done || isLeaving;
    return (
      <li key={t.id} className="task-row" data-done={checked || undefined} data-leaving={isLeaving || undefined}>
        <Check
          checked={checked}
          label={t.done ? `Mark "${t.title}" not done` : `Mark "${t.title}" done`}
          disabled={isLeaving}
          onChange={async (next) => {
            if (next) start(t.id);
            else {
              try {
                await toggle(t.id, false);
              } catch {
                toast(SAVE_FAILED, 'error');
              }
            }
          }}
        />
        <button type="button" className="task-row__main" onClick={() => setSheet({ open: true, task: t })}>
          <span className="task-row__title">
            {t.priority === 'high' && (
              <span className="task-row__prio" aria-label="High priority">
                !!!
              </span>
            )}
            {t.title}
          </span>
          {t.notes && <span className="task-row__notes">{t.notes}</span>}
          <span className="task-row__meta">
            <span className="pill">{personLabel(t.who)}</span>
            {due && (
              <span className="task-row__due" data-overdue={isOverdue(t) || undefined}>
                {t.done && t.completedAt ? `Done ${formatDay(parseDay(t.completedAt)!)}` : formatDay(due, { weekday: true })}
              </span>
            )}
            {t.category !== 'other' && (
              <span className="task-row__cat">{TASK_CATEGORIES.find((c) => c.value === t.category)?.label}</span>
            )}
          </span>
        </button>
      </li>
    );
  };

  const list = view === 'open' ? openShown : doneShown;

  return (
    <Page tile={nav.tile}>
      <PageHeader
        icon={<CheckCircle size={26} weight="fill" />}
        title="Tasks"
        description={status === 'error' && open.length + done.length === 0 ? 'Shared to-dos for both of you' : `${open.length} open, ${done.length} done`}
        actions={
          <Button variant="primary" icon={<Plus size={16} weight="bold" />} onClick={() => setSheet({ open: true, task: null })}>
            New task
          </Button>
        }
      />

      <div className="toolbar">
        <Segmented
          label="Show"
          value={view}
          onChange={setView}
          options={[
            { value: 'open', label: 'Open', count: open.length },
            { value: 'done', label: 'Done', count: done.length },
          ]}
        />
        <Segmented label="Whose" value={who} onChange={setWho} options={WHO} />
      </div>

      {view === 'open' && (
        <form
          className="quick-add"
          onSubmit={(e) => {
            e.preventDefault();
            void quickAdd();
          }}
        >
          <Plus size={18} weight="bold" aria-hidden />
          <label className="visually-hidden" htmlFor="quick-task">
            Quick add a task
          </label>
          <input
            id="quick-task"
            placeholder="Add a task and press Enter"
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            autoComplete="off"
          />
        </form>
      )}

      {status === 'loading' && list.length === 0 ? (
        <SkeletonRows />
      ) : status === 'error' && list.length === 0 ? (
        <LoadError what="tasks" onRetry={reload} />
      ) : list.length === 0 ? (
        <EmptyState icon={<CheckCircle size={28} />} title={view === 'open' ? 'Nothing to do' : 'Nothing finished yet'}>
          {view === 'open'
            ? who === 'all'
              ? 'Add something above and it shows up for both of you.'
              : `Nothing on ${WHO.find((w) => w.value === who)?.label.toLowerCase()}'s list.`
            : 'Checked-off tasks collect here.'}
        </EmptyState>
      ) : view === 'open' ? (
        groupOpen(list).map((g) => (
          <section key={g.label} className="list-group" aria-label={g.label}>
            <h2 className="list-group__label" data-tone={g.label === 'Overdue' ? 'alert' : undefined}>
              {g.label}
            </h2>
            <ul className="rows">{g.items.map(row)}</ul>
          </section>
        ))
      ) : (
        <ul className="rows">{list.map(row)}</ul>
      )}

      <TaskSheet open={sheet.open} editing={sheet.task} onClose={() => setSheet({ open: false, task: null })} />
    </Page>
  );
}
