import { useState } from 'react';
import { CalendarBlank, Flag, Tag, Users } from '@phosphor-icons/react';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { ConfirmButton } from '../../components/ui/Feedback';
import { ChoiceRow, FieldGroup, FormError, InputRow, NotesField, SelectRow, TitleInput } from '../../components/ui/Fields';
import { SAVE_FAILED, useToast } from '../../components/ui/Toast';
import { TASK_CATEGORIES, TASK_PRIORITIES, useTasks, type Task, type TaskInput } from '../../data/tasks';
import { PEOPLE } from '../../lib/format';

interface TaskSheetProps {
  open: boolean;
  onClose: () => void;
  editing?: Task | null;
}

export function TaskSheet({ open, onClose, editing }: TaskSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit task' : 'New task'}>
      <TaskForm key={editing?.id ?? 'new'} editing={editing} onDone={onClose} />
    </Sheet>
  );
}

function TaskForm({ editing, onDone }: { editing?: Task | null; onDone: () => void }) {
  const { add, update, remove } = useTasks();
  const toast = useToast();
  const [form, setForm] = useState<TaskInput>({
    title: editing?.title ?? '',
    notes: editing?.notes ?? '',
    who: editing?.who ?? 'both',
    priority: editing?.priority ?? 'medium',
    due: editing?.due ?? '',
    category: editing?.category ?? 'other',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form.title.trim()) {
      setError('Give the task a name.');
      return;
    }
    setSaving(true);
    try {
      const input = { ...form, title: form.title.trim(), notes: form.notes.trim() };
      if (editing) await update(editing.id, input);
      else await add(input);
      toast(editing ? 'Task updated' : 'Task added');
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
        label="Task"
        placeholder="What needs doing?"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        autoFocus
      />
      <FieldGroup>
        <ChoiceRow
          label="For"
          icon={<Users size={18} aria-hidden />}
          value={form.who}
          options={PEOPLE}
          onChange={(who) => setForm({ ...form, who })}
        />
        <InputRow
          label="Due"
          icon={<CalendarBlank size={18} aria-hidden />}
          type="date"
          value={form.due}
          onChange={(e) => setForm({ ...form, due: e.target.value })}
        />
        <ChoiceRow
          label="Priority"
          icon={<Flag size={18} aria-hidden />}
          value={form.priority}
          options={TASK_PRIORITIES}
          onChange={(priority) => setForm({ ...form, priority })}
        />
        <SelectRow
          label="List"
          icon={<Tag size={18} aria-hidden />}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as TaskInput['category'] })}
        >
          {TASK_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </SelectRow>
      </FieldGroup>
      <NotesField
        label="Notes"
        placeholder="Anything else"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <FormError message={error} />
      <div className="sheet-actions">
        {editing && (
          <ConfirmButton
            onConfirm={async () => {
              try {
                await remove(editing.id);
                toast('Task deleted');
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
          {saving ? 'Saving' : editing ? 'Save' : 'Add task'}
        </Button>
      </div>
    </form>
  );
}
