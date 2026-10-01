import { useState } from 'react';
import { CalendarBlank, Tag, Users } from '@phosphor-icons/react';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { ConfirmButton } from '../../components/ui/Feedback';
import { ChoiceRow, FieldGroup, FormError, InputRow, SelectRow, TitleInput } from '../../components/ui/Fields';
import { SAVE_FAILED, useToast } from '../../components/ui/Toast';
import { useExpenses, type Expense, type ExpenseCategory, type Payer } from '../../data/budget';
import { useMe } from '../../lib/auth';
import { todayKey } from '../../lib/format';
import { EXPENSE_CATEGORIES } from './categories';

interface ExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  editing?: Expense | null;
}

export function ExpenseSheet({ open, onClose, editing }: ExpenseSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit expense' : 'Log an expense'}>
      <ExpenseForm key={editing?.id ?? 'new'} editing={editing} onDone={onClose} />
    </Sheet>
  );
}

const PAYERS: { value: Payer; label: string }[] = [
  { value: 'him', label: 'Him' },
  { value: 'her', label: 'Her' },
];

function ExpenseForm({ editing, onDone }: { editing?: Expense | null; onDone: () => void }) {
  const { add: addExpense, update: updateExpense, remove: deleteExpense } = useExpenses();
  const { person: me } = useMe();
  const toast = useToast();
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(editing?.category ?? 'restaurants');
  const [date, setDate] = useState(editing?.date || todayKey());
  const [paidBy, setPaidBy] = useState<Payer>(editing?.paidBy ?? me ?? 'him');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0 || !description.trim()) {
      setError('Add an amount and what it was for.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        amount: value,
        description: description.trim(),
        category,
        date,
        paidBy,
      };
      if (editing) await updateExpense(editing.id, data);
      else await addExpense(data);
      toast(editing ? 'Expense updated' : 'Expense logged');
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
      <label className="amount-input">
        <span className="amount-input__currency" aria-hidden>
          ₱
        </span>
        <span className="visually-hidden">Amount in pesos</span>
        <input
          className="rounded-num"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
          autoFocus
        />
      </label>
      <TitleInput
        label="What was it for?"
        placeholder="What was it for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
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
          label="Day"
          icon={<CalendarBlank size={18} aria-hidden />}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <ChoiceRow label="Paid by" icon={<Users size={18} aria-hidden />} value={paidBy} options={PAYERS} onChange={setPaidBy} />
      </FieldGroup>
      <FormError message={error} />
      <div className="sheet-actions">
        {editing && (
          <ConfirmButton
            onConfirm={async () => {
              try {
                await deleteExpense(editing.id);
                toast('Expense deleted');
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
          {saving ? 'Saving' : editing ? 'Save' : 'Log expense'}
        </Button>
      </div>
    </form>
  );
}
