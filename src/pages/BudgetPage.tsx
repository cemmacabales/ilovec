import { useMemo, useState } from 'react';
import { Plus, Wallet } from '@phosphor-icons/react';
import { Page } from '../components/ui/Page';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { EmptyState, SkeletonRows } from '../components/ui/Feedback';
import { ExpenseSheet } from '../features/budget/ExpenseSheet';
import { GoalSheet, LimitSheet } from '../features/budget/PlanSheets';
import { categoryMeta } from '../features/budget/categories';
import { useBudgets, useExpenses, useMonthSpend, useSavingsGoals } from '../data/budget';
import { navFor } from '../app/nav';
import { formatDay, money, parseDay, relativeDay } from '../lib/format';
import type { Budget, Expense, SavingsGoal } from '../data/budget';

type View = 'spending' | 'limits' | 'goals';

export default function BudgetPage() {
  const nav = navFor('/budget');
  const { expenses, status } = useExpenses();
  const { data: spend } = useMonthSpend();
  const { budgets } = useBudgets();
  const { goals: savingsGoals } = useSavingsGoals();
  const [view, setView] = useState<View>('spending');
  const [expenseSheet, setExpenseSheet] = useState<{ open: boolean; item: Expense | null }>({ open: false, item: null });
  const [limitSheet, setLimitSheet] = useState<{ open: boolean; item: Budget | null }>({ open: false, item: null });
  const [goalSheet, setGoalSheet] = useState<{ open: boolean; item: SavingsGoal | null }>({ open: false, item: null });
  const [showAll, setShowAll] = useState(false);

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });
  const isLoaded = status !== 'loading';

  // This month's totals come from the database's monthly_spend view.
  const { total, him: his, her: hers } = spend;

  const byDay = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
    const shown = showAll ? sorted : sorted.slice(0, 30);
    const groups = new Map<string, Expense[]>();
    for (const e of shown) {
      const list = groups.get(e.date) ?? [];
      list.push(e);
      groups.set(e.date, list);
    }
    return { groups: [...groups.entries()], hidden: sorted.length - shown.length };
  }, [expenses, showAll]);

  const spentIn = (category: Budget['category']) => spend.byCategory[category] ?? 0;

  const unavailable = status === 'error';

  const addLabel = view === 'spending' ? 'Log expense' : view === 'limits' ? 'Set a limit' : 'New goal';
  const onAdd = () => {
    if (view === 'spending') setExpenseSheet({ open: true, item: null });
    else if (view === 'limits') setLimitSheet({ open: true, item: null });
    else setGoalSheet({ open: true, item: null });
  };

  return (
    <Page tile={nav.tile}>
      <PageHeader
        icon={<Wallet size={26} weight="fill" />}
        title="Budget"
        description="What you spend together, and what you're saving for"
        actions={
          <Button variant="primary" icon={<Plus size={16} weight="bold" />} onClick={onAdd}>
            {addLabel}
          </Button>
        }
      />

      <section className="spend-summary" aria-label={`Spending in ${monthName}`}>
        {!isLoaded ? (
          <span className="skeleton skeleton--figure" />
        ) : (
          <p className="spend-summary__total">
            <span className="rounded-num">{unavailable ? '-' : money(total)}</span>
            <span className="spend-summary__label">spent in {monthName}</span>
          </p>
        )}
        {total > 0 && (
          <>
            <div className="split-bar" role="img" aria-label={`Him paid ${money(his)}, her ${money(hers)}`}>
              <span className="split-bar__him" style={{ flexGrow: his }} />
              <span className="split-bar__her" style={{ flexGrow: hers }} />
            </div>
            <dl className="split-legend">
              <div>
                <dt>
                  <span className="swatch swatch--him" aria-hidden />
                  Him
                </dt>
                <dd className="num">{money(his)}</dd>
              </div>
              <div>
                <dt>
                  <span className="swatch swatch--her" aria-hidden />
                  Her
                </dt>
                <dd className="num">{money(hers)}</dd>
              </div>
            </dl>
          </>
        )}
      </section>

      <div className="toolbar">
        <Segmented
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: 'spending', label: 'Spending' },
            { value: 'limits', label: 'Limits' },
            { value: 'goals', label: 'Goals' },
          ]}
        />
      </div>

      {!isLoaded ? (
        <SkeletonRows />
      ) : view === 'spending' ? (
        expenses.length === 0 ? (
          <EmptyState icon={<Wallet size={28} />} title={unavailable ? "Spending isn't loading" : 'No expenses yet'}>
            {unavailable
              ? "Your shared data isn't reachable right now."
              : 'Log what you spend on dates and shared things. Each entry notes who paid.'}
          </EmptyState>
        ) : (
          <>
            {byDay.groups.map(([day, items]) => {
              const d = parseDay(day);
              return (
                <section key={day} className="list-group" aria-label={d ? formatDay(d) : 'No date'}>
                  <h2 className="list-group__label">{d ? relativeDay(d) : 'No date'}</h2>
                  <ul className="rows">
                    {items.map((e) => {
                      const meta = categoryMeta(e.category);
                      const Icon = meta.icon;
                      return (
                        <li key={e.id}>
                          <button type="button" className="money-row" onClick={() => setExpenseSheet({ open: true, item: e })}>
                            <span className="money-row__icon" aria-hidden>
                              <Icon size={18} weight="fill" />
                            </span>
                            <span className="money-row__text">
                              <span className="money-row__title">{e.description || meta.label}</span>
                              <span className="money-row__meta">
                                {meta.label}, {e.paidBy}
                              </span>
                            </span>
                            <span className="money-row__amount num">{money(e.amount)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
            {byDay.hidden > 0 && (
              <button type="button" className="text-btn" onClick={() => setShowAll(true)}>
                Show {byDay.hidden} older
              </button>
            )}
          </>
        )
      ) : view === 'limits' ? (
        budgets.length === 0 ? (
          <EmptyState icon={<Wallet size={28} />} title="No limits set">
            Set a monthly limit for a category, like food or trips, and see how close you are.
          </EmptyState>
        ) : (
          <ul className="rows">
            {budgets.map((b) => {
              const meta = categoryMeta(b.category);
              const Icon = meta.icon;
              const spent = spentIn(b.category);
              const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
              return (
                <li key={b.id}>
                  <button type="button" className="money-row" onClick={() => setLimitSheet({ open: true, item: b })}>
                    <span className="money-row__icon" aria-hidden>
                      <Icon size={18} weight="fill" />
                    </span>
                    <span className="money-row__text">
                      <span className="money-row__title">{meta.label}</span>
                      <span className="meter meter--row meter--budget" aria-hidden>
                        <span className="meter__fill" data-over={pct > 100 || undefined} style={{ width: `${Math.min(100, pct)}%` }} />
                      </span>
                    </span>
                    <span className="money-row__amount num" data-over={pct > 100 || undefined}>
                      {money(spent, { round: true })}
                      <span className="money-row__of"> of {money(b.monthlyLimit, { round: true })}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : savingsGoals.length === 0 ? (
        <EmptyState icon={<Wallet size={28} />} title="No savings goals">
          A trip, a gift, a rainy-day fund. Track how close you are together.
        </EmptyState>
      ) : (
        <ul className="rows">
          {savingsGoals.map((g) => {
            const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            const by = parseDay(g.targetDate);
            return (
              <li key={g.id}>
                <button type="button" className="money-row" onClick={() => setGoalSheet({ open: true, item: g })}>
                  <span className="money-row__text">
                    <span className="money-row__title">{g.title}</span>
                    <span className="meter meter--row" aria-hidden>
                      <span className="meter__fill" style={{ width: `${Math.min(100, pct)}%` }} />
                    </span>
                    {by && <span className="money-row__meta">By {formatDay(by, { year: true })}</span>}
                  </span>
                  <span className="money-row__amount num">
                    {money(g.currentAmount, { round: true })}
                    <span className="money-row__of"> of {money(g.targetAmount, { round: true })}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ExpenseSheet open={expenseSheet.open} editing={expenseSheet.item} onClose={() => setExpenseSheet({ open: false, item: null })} />
      <LimitSheet open={limitSheet.open} editing={limitSheet.item} onClose={() => setLimitSheet({ open: false, item: null })} />
      <GoalSheet open={goalSheet.open} editing={goalSheet.item} onClose={() => setGoalSheet({ open: false, item: null })} />
    </Page>
  );
}
