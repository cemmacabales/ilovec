import { useState } from 'react';
import { CalendarBlank, Clock, MapPin } from '@phosphor-icons/react';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { ConfirmButton } from '../../components/ui/Feedback';
import { FieldGroup, FormError, InputRow, TitleInput } from '../../components/ui/Fields';
import { SAVE_FAILED, useToast } from '../../components/ui/Toast';
import { useEvents, type DateEvent, type EventInput } from '../../data/events';
import { todayKey } from '../../lib/format';

interface DateSheetProps {
  open: boolean;
  onClose: () => void;
  editing?: DateEvent | null;
  defaultDate?: string;
}

export function DateSheet({ open, onClose, editing, defaultDate }: DateSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit date' : 'Plan a date'}>
      {/* Remount per open so the form starts fresh */}
      <DateForm key={editing?.id ?? defaultDate ?? 'new'} editing={editing} defaultDate={defaultDate} onDone={onClose} />
    </Sheet>
  );
}

function DateForm({ editing, defaultDate, onDone }: { editing?: DateEvent | null; defaultDate?: string; onDone: () => void }) {
  const { add, update, remove } = useEvents();
  const toast = useToast();
  const [form, setForm] = useState<EventInput>({
    title: editing?.title ?? '',
    date: editing?.date ?? defaultDate ?? todayKey(),
    time: editing?.time ?? '19:00',
    location: editing?.location ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = form.title.trim() && form.date && form.time;

  const save = async () => {
    if (!valid) {
      setError('Add a title, a day and a time.');
      return;
    }
    setSaving(true);
    try {
      const input = { ...form, title: form.title.trim(), location: form.location.trim() };
      if (editing) await update(editing.id, input);
      else await add(input);
      toast(editing ? 'Date updated' : 'Date planned');
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
        label="What are you doing?"
        placeholder="What are you doing?"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        autoFocus
      />
      <FieldGroup>
        <InputRow
          label="Day"
          icon={<CalendarBlank size={18} aria-hidden />}
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <InputRow
          label="Time"
          icon={<Clock size={18} aria-hidden />}
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
        />
        <InputRow
          label="Place"
          icon={<MapPin size={18} aria-hidden />}
          type="text"
          placeholder="Optional"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </FieldGroup>
      <FormError message={error} />
      <div className="sheet-actions">
        {editing && (
          <ConfirmButton
            onConfirm={async () => {
              try {
                await remove(editing.id);
                toast('Date deleted');
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
          {saving ? 'Saving' : editing ? 'Save' : 'Add date'}
        </Button>
      </div>
    </form>
  );
}
