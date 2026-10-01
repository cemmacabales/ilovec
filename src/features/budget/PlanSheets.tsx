import { useState } from 'react';
import { CalendarBlank, Coins, Tag, Target } from '@phosphor-icons/react';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { ConfirmButton } from '../../components/ui/Feedback';
import { FieldGroup, FormError, InputRow, SelectRow, TitleInput } from '../../components/ui/Fields';
import { SAVE_FAILED, useToast } from '../../components/ui/Toast';
import { useBudget } from '../../contexts/BudgetContext';
import type { Budget, ExpenseCategory, SavingsGoal } from '../../types/budget';
import { EXPENSE_CATEGORIES } from './categories';

const GOAL_KINDS: { value: SavingsGoal['category']; label: string }[] = [
  { value: 'vacation', label: 'Trip' },
  { value: 'home', label: 'Home' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'emergency', label: 'Safety net' },
  { value: 'other', label: 'Other' },
];

export function LimitSheet({ open, onClose, editing }: { open: boolean; onClose: () => void; editing?: Budget | null }) {
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit monthly limit' : 'Set a monthly limit'}>
      <LimitForm key={editing?.id ?? 'new'} editing={editing} onDone={onClose} />
    </Sheet>
  );
}

function LimitForm({ editing, onDone }: { editing?: Budget | null; onDone: () => void }) {
  const { addBudget, updateBudget, deleteBudget } = useBudget();
  const toast = useToast();
  const [category, setCategory] = useState<ExpenseCategory>(editing?.category ?? 'restaurants');
  const [limit, setLimit] = useState(editing ? String(editing.monthlyLimit) : '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const value = parseFloat(limit);
    if (!value || value <= 0) {
      setError('Enter a monthly limit above zero.');
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateBudget(editing.id, { category, monthlyLimit: value });
      else await addBudget({ category, monthlyLimit: value, alertThreshold: 80, isActive: true });
      toast('Limit saved');
      onDone();
    } catch {
      toast(SAVE_FAILED, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="sheet-form"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <FieldGroup>
        <SelectRow
          label="Category"
          icon={<Tag size={18} aria-hidden />}
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </SelectRow>
        <InputRow
          label="Per month"
          icon={<Coins size={18} aria-hidden />}
          inputMode="decimal"
          placeholder="₱0"
          value={limit}
          onChange={(e) => setLimit(e.target.value.replace(/[^\d.]/g, ''))}
          autoFocus
        />
      </FieldGroup>
      <FormError message={error} />
      <div className="sheet-actions">
        {editing && (
          <ConfirmButton
            onConfirm={async () => {
              try {
                await deleteBudget(editing.id);
                onDone();
              } catch {
                toast(SAVE_FAILED, 'error');
              }
            }}
          >
            Remove
          </ConfirmButton>
        )}
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

export function GoalSheet({ open, onClose, editing }: { open: boolean; onClose: () => void; editing?: SavingsGoal | null }) {
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit goal' : 'New savings goal'}>
      <GoalForm key={editing?.id ?? 'new'} editing={editing} onDone={onClose} />
    </Sheet>
  );
}

function GoalForm({ editing, onDone }: { editing?: SavingsGoal | null; onDone: () => void }) {
  const { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useBudget();
  const toast = useToast();
  const [title, setTitle] = useState(editing?.title ?? '');
  const [target, setTarget] = useState(editing ? String(editing.targetAmount) : '');
  const [saved, setSaved] = useState(editing ? String(editing.currentAmount) : '');
  const [date, setDate] = useState(editing?.targetDate?.slice(0, 10) ?? '');
  const [kind, setKind] = useState<SavingsGoal['category']>(editing?.category ?? 'vacation');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const targetAmount = parseFloat(target);
    if (!title.trim() || !targetAmount || !date) {
      setError('Add a name, a target amount and a target date.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        targetAmount,
        currentAmount: parseFloat(saved) || 0,
        targetDate: date,
        category: kind,
        description: editing?.description ?? '',
      };
      if (editing) await updateSavingsGoal(editing.id, data);
      else await addSavingsGoal(data);
      toast('Goal saved');
      onDone();
    } catch {
      toast(SAVE_FAILED, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="sheet-form"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <TitleInput label="Goal" placeholder="What are you saving for?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <FieldGroup>
        <InputRow
          label="Target"
          icon={<Target size={18} aria-hidden />}
          inputMode="decimal"
          placeholder="₱0"
          value={target}
          onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ''))}
        />
        <InputRow
          label="Saved so far"
          icon={<Coins size={18} aria-hidden />}
          inputMode="decimal"
          placeholder="₱0"
          value={saved}
          onChange={(e) => setSaved(e.target.value.replace(/[^\d.]/g, ''))}
        />
        <InputRow
          label="By"
          icon={<CalendarBlank size={18} aria-hidden />}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <SelectRow
          label="Kind"
          icon={<Tag size={18} aria-hidden />}
          value={kind}
          onChange={(e) => setKind(e.target.value as SavingsGoal['category'])}
        >
          {GOAL_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </SelectRow>
      </FieldGroup>
      <FormError message={error} />
      <div className="sheet-actions">
        {editing && (
          <ConfirmButton
            onConfirm={async () => {
              try {
                await deleteSavingsGoal(editing.id);
                onDone();
              } catch {
                toast(SAVE_FAILED, 'error');
              }
            }}
          >
            Delete
          </ConfirmButton>
        )}
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
