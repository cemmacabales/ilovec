import { useState } from 'react';
import { CalendarBlank, Coins, Flag, Gauge, MapPin, Tag } from '@phosphor-icons/react';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { ConfirmButton } from '../../components/ui/Feedback';
import { ChoiceRow, FieldGroup, FormError, InputRow, NotesField, SelectRow, TitleInput } from '../../components/ui/Fields';
import { SAVE_FAILED, useToast } from '../../components/ui/Toast';
import { useBucketList, type BucketCategory, type BucketItem, type Difficulty, type ItemStatus, type Priority } from '../../data/bucket';
import { capitalize } from '../../lib/format';

export function BucketSheet({ open, onClose, editing }: { open: boolean; onClose: () => void; editing?: BucketItem | null }) {
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit goal' : 'Add to the list'}>
      <GoalForm key={editing?.id ?? 'new'} editing={editing ?? null} onDone={onClose} />
    </Sheet>
  );
}

const CATEGORIES: BucketCategory[] = [
  'travel', 'adventure', 'experiences', 'learning', 'relationships', 'creativity',
  'health', 'personal', 'career', 'financial', 'spiritual', 'other',
];
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Soon' },
];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'extreme'];
const STATUSES: { value: ItemStatus; label: string }[] = [
  { value: 'not_started', label: 'Someday' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Done' },
  { value: 'cancelled', label: 'Dropped' },
];

interface Form {
  title: string;
  description: string;
  category: BucketCategory;
  priority: Priority;
  difficulty: Difficulty;
  targetDate: string;
  location: string;
  cost: string;
  progress: number;
  status: ItemStatus;
}

function GoalForm({ editing, onDone }: { editing: BucketItem | null; onDone: () => void }) {
  const { add, update, remove } = useBucketList();
  const toast = useToast();
  const [form, setForm] = useState<Form>({
    title: editing?.title ?? '',
    description: editing?.description ?? '',
    category: editing?.category ?? 'experiences',
    priority: editing?.priority ?? 'medium',
    difficulty: editing?.difficulty ?? 'medium',
    targetDate: editing?.targetDate ?? '',
    location: editing?.location ?? '',
    cost: editing?.estimatedCost ? String(editing.estimatedCost) : '',
    progress: editing?.progress ?? 0,
    status: editing?.status ?? 'not_started',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim()) {
      setError('Give it a name.');
      return;
    }
    setSaving(true);
    try {
      const cost = form.cost ? parseFloat(form.cost) : null;
      const input = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        difficulty: form.difficulty,
        targetDate: form.targetDate,
        location: form.location.trim(),
        estimatedCost: cost,
        progress: form.progress,
      };
      if (editing) {
        const status: ItemStatus = form.progress === 100 ? 'completed' : form.status === 'completed' ? 'in_progress' : form.status;
        await update(editing.id, { ...input, status });
      } else {
        const status: ItemStatus = form.progress === 100 ? 'completed' : form.progress > 0 ? 'in_progress' : 'not_started';
        await add({ ...input, status });
      }
      toast(editing ? 'Saved' : 'Added to the list');
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
      <TitleInput
        label="What do you want to do?"
        placeholder="What do you want to do?"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        autoFocus
      />
      <FieldGroup>
        <SelectRow
          label="Kind"
          icon={<Tag size={18} aria-hidden />}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as BucketCategory })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {capitalize(c)}
            </option>
          ))}
        </SelectRow>
        <InputRow
          label="Target"
          icon={<CalendarBlank size={18} aria-hidden />}
          type="date"
          value={form.targetDate}
          onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
        />
        <InputRow
          label="Where"
          icon={<MapPin size={18} aria-hidden />}
          placeholder="Anywhere"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <InputRow
          label="Cost"
          icon={<Coins size={18} aria-hidden />}
          inputMode="decimal"
          placeholder="₱0"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value.replace(/[^\d.]/g, '') })}
        />
        <ChoiceRow
          label="Priority"
          icon={<Flag size={18} aria-hidden />}
          value={form.priority}
          options={PRIORITIES}
          onChange={(priority) => setForm({ ...form, priority })}
        />
        <SelectRow
          label="Effort"
          icon={<Gauge size={18} aria-hidden />}
          value={form.difficulty}
          onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {capitalize(d)}
            </option>
          ))}
        </SelectRow>
        {editing && (
          <SelectRow
            label="Status"
            value={form.status}
            onChange={(e) => {
              const status = e.target.value as ItemStatus;
              setForm({ ...form, status, progress: status === 'completed' ? 100 : form.progress === 100 ? 90 : form.progress });
            }}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </SelectRow>
        )}
      </FieldGroup>
      <div className="range-field">
        <label htmlFor="bucket-progress" className="field-group__label">
          Progress
        </label>
        <div className="range-field__row">
          <input
            id="bucket-progress"
            type="range"
            min={0}
            max={100}
            step={5}
            value={form.progress}
            style={{ ['--p' as string]: `${form.progress}%` }}
            onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
          />
          <output htmlFor="bucket-progress" className="range-field__value num">
            {form.progress}%
          </output>
        </div>
      </div>
      <NotesField
        label="Notes"
        placeholder="Why it matters, ideas, links"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <FormError message={error} />
      <div className="sheet-actions">
        {editing && (
          <ConfirmButton
            onConfirm={async () => {
              try {
                await remove(editing.id);
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
          {saving ? 'Saving' : editing ? 'Save' : 'Add to list'}
        </Button>
      </div>
    </form>
  );
}
