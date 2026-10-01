// Shared formatting for dates, money and people.

export type Person = 'him' | 'her' | 'both';

export const PEOPLE: { value: Person; label: string }[] = [
  { value: 'both', label: 'Both' },
  { value: 'him', label: 'Him' },
  { value: 'her', label: 'Her' },
];

// Older rows stored 'me' / 'partner'; read them as him / her.
export function toPerson(value: unknown): Person {
  if (value === 'him' || value === 'me' || value === 'partner1') return 'him';
  if (value === 'her' || value === 'partner' || value === 'partner2') return 'her';
  return 'both';
}

export function personLabel(p: Person) {
  return PEOPLE.find((x) => x.value === p)?.label ?? 'Both';
}

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const pesoRound = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

export function money(amount: number, opts: { round?: boolean; currency?: string } = {}) {
  if (opts.currency && opts.currency !== 'PHP') {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: opts.currency }).format(amount);
  }
  return (opts.round ? pesoRound : peso).format(amount);
}

// Dates are stored as YYYY-MM-DD; parse them as local days, never UTC.
export function parseDay(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : startOfDay(d);
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function toDayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function todayKey() {
  return toDayKey(new Date());
}

export function daysFromToday(d: Date) {
  const ms = startOfDay(d).getTime() - startOfDay(new Date()).getTime();
  return Math.round(ms / 86_400_000);
}

// "Today", "Tomorrow", "In 5 days", "Yesterday", "3 days ago"
export function relativeDay(d: Date) {
  const n = daysFromToday(d);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n > 1 && n < 7) return `In ${n} days`;
  if (n < -1 && n > -7) return `${-n} days ago`;
  return formatDay(d);
}

export function formatDay(d: Date, opts: { weekday?: boolean; year?: boolean } = {}) {
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-US', {
    weekday: opts.weekday ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
    year: opts.year || !sameYear ? 'numeric' : undefined,
  });
}

export function formatTime(time: string | null | undefined) {
  if (!time || !/^\d{1,2}:\d{2}/.test(time)) return '';
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function longToday(now = new Date()) {
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : s;
}
