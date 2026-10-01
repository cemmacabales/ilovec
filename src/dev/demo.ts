// Dev-only demo data, for looking at the UI without signing in or reaching the
// database. Turn on with ?demo in the URL, off with ?demo=off (see ./flag).
// Never bundled in production (callers guard with import.meta.env.DEV).
// Everything here is sample content.

type Row = Record<string, unknown> & { id: string };

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const tables: Record<string, Row[]> = {
  members: [{ id: 'demo', user_id: 'demo', person: 'him' }],
  dates: [
    { id: 'd1', title: 'Ramen and a walk in Maginhawa', day: day(3), start_time: '19:00:00', location: 'Maginhawa St, QC', done: false },
    { id: 'd2', title: 'Picnic at the Sunken Garden', day: day(9), start_time: '16:30:00', location: 'UP Diliman', done: false },
    { id: 'd3', title: 'Concert night', day: day(17), start_time: '20:00:00', location: 'Araneta Coliseum', done: false },
    { id: 'd4', title: 'Coffee before work', day: day(-4), start_time: '08:00:00', location: '', done: true },
  ],
  tasks: [
    { id: 't1', title: 'Book the picnic spot', notes: '', assigned_to: 'him', priority: 'high', due_on: day(2), category: 'dates', done: false, done_on: null, created_at: day(-3) },
    { id: 't2', title: 'Buy a birthday gift for Mama', notes: 'Something for the garden', assigned_to: 'her', priority: 'medium', due_on: day(6), category: 'shopping', done: false, done_on: null, created_at: day(-2) },
    { id: 't3', title: 'Pay the internet bill', notes: '', assigned_to: 'both', priority: 'medium', due_on: day(-1), category: 'household', done: false, done_on: null, created_at: day(-6) },
    { id: 't4', title: 'Pick the next show to start', notes: '', assigned_to: 'both', priority: 'low', due_on: null, category: 'other', done: false, done_on: null, created_at: day(-1) },
    { id: 't5', title: 'Renew passports', notes: '', assigned_to: 'both', priority: 'high', due_on: null, category: 'planning', done: true, done_on: day(-2), created_at: day(-20) },
  ],
  watchlist: [
    { id: 'm1', tmdb_id: 136315, kind: 'tv', title: 'The Bear', poster_path: '/eKfVzzEazSIjJMrw9ADa2x8ksLz.jpg', status: 'watching', created_at: day(-10) },
    { id: 'm2', tmdb_id: 125935, kind: 'tv', title: 'Abbott Elementary', poster_path: '/nBe1e3JJEZ6veGrVXNF0fRoLu56.jpg', status: 'watching', created_at: day(-12) },
    { id: 'm3', tmdb_id: 666277, kind: 'movie', title: 'Past Lives', poster_path: '/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg', status: 'watchlist', created_at: day(-4) },
    { id: 'm4', tmdb_id: 76, kind: 'movie', title: 'Before Sunrise', poster_path: '/kf1Jb1c2JAOqjuzA3H4oDM263uB.jpg', status: 'watchlist', created_at: day(-5) },
    { id: 'm5', tmdb_id: 89905, kind: 'tv', title: 'Normal People', poster_path: '/tbKSsFd4ImzUgbYolttkq4pmOPQ.jpg', status: 'watching', created_at: day(-8) },
    { id: 'm6', tmdb_id: 313369, kind: 'movie', title: 'La La Land', poster_path: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', status: 'completed', created_at: day(-30) },
  ],
  expenses: [
    { id: 'e1', description: 'Ramen dinner', amount: 1240, category: 'restaurants', paid_by: 'him', spent_on: day(0) },
    { id: 'e2', description: 'Grab home', amount: 286, category: 'transportation', paid_by: 'her', spent_on: day(0) },
    { id: 'e3', description: 'Movie tickets', amount: 760, category: 'entertainment', paid_by: 'her', spent_on: day(-5) },
    { id: 'e4', description: 'Groceries for the week', amount: 3415.5, category: 'groceries', paid_by: 'him', spent_on: day(-7) },
    { id: 'e5', description: 'Flowers', amount: 650, category: 'gifts', paid_by: 'him', spent_on: day(-9) },
  ],
  budgets: [
    { id: 'b1', category: 'restaurants', monthly_limit: 6000, alert_threshold: 80, is_active: true },
    { id: 'b2', category: 'entertainment', monthly_limit: 2500, alert_threshold: 80, is_active: true },
  ],
  savings_goals: [
    { id: 'g1', title: 'Baguio weekend', target_amount: 15000, current_amount: 6200, target_date: day(60), category: 'vacation', description: '' },
  ],
  bucket_list: [
    { id: 'k1', title: 'See the sunrise at Mt. Pulag', description: '', category: 'adventure', priority: 'high', status: 'in_progress', difficulty: 'hard', progress: 40, estimated_cost: 8000, currency: 'PHP', target_date: day(120), completed_on: null, location: 'Benguet', created_at: day(-40) },
    { id: 'k2', title: 'Take a pottery class together', description: '', category: 'creativity', priority: 'medium', status: 'not_started', difficulty: 'easy', progress: 0, estimated_cost: 3500, currency: 'PHP', target_date: null, completed_on: null, location: '', created_at: day(-20) },
    { id: 'k3', title: 'Learn to dive in Anilao', description: '', category: 'travel', priority: 'medium', status: 'in_progress', difficulty: 'medium', progress: 15, estimated_cost: null, currency: 'PHP', target_date: null, completed_on: null, location: 'Anilao, Batangas', created_at: day(-15) },
    { id: 'k4', title: 'Watch a show at the CCP', description: '', category: 'experiences', priority: 'low', status: 'completed', difficulty: 'easy', progress: 100, estimated_cost: null, currency: 'PHP', target_date: null, completed_on: day(-30), location: '', created_at: day(-90) },
  ],
  albums: [],
  photos: [],
};

// The monthly_spend view, computed the way the database does.
function monthlySpend(): Row[] {
  const groups = new Map<string, Row & { total: number; him: number; her: number; entries: number }>();
  for (const e of tables.expenses) {
    const month = `${String(e.spent_on).slice(0, 7)}-01`;
    const key = `${month}|${e.category}`;
    const g = groups.get(key) ?? { id: key, month, category: e.category, total: 0, him: 0, her: 0, entries: 0 };
    const amount = Number(e.amount);
    g.total += amount;
    if (e.paid_by === 'him') g.him += amount;
    else g.her += amount;
    g.entries++;
    groups.set(key, g);
  }
  return [...groups.values()];
}

let seq = 100;

const json = (body: unknown, status = 200) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Answers Supabase REST calls (GET/POST/PATCH/DELETE on /rest/v1/<table>) from
// memory, honouring `eq.` filters, `return=representation` and `.single()`.
export async function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  const match = url.pathname.match(/\/rest\/v1\/([a-z_]+)/);
  if (!match) return null;
  const name = match[1];
  const table = name === 'monthly_spend' ? monthlySpend() : (tables[name] ??= []);
  const method = (init?.method ?? 'GET').toUpperCase();
  const headers = new Headers(init?.headers);
  const single = headers.get('Accept')?.includes('vnd.pgrst.object') ?? false;
  const wantsRows = headers.get('Prefer')?.includes('return=representation') ?? false;
  const filters = [...url.searchParams].filter(([, v]) => v.startsWith('eq.')).map(([k, v]) => [k, v.slice(3)]);
  const matches = (r: Row) => filters.every(([k, v]) => String(r[k]) === v);
  const reply = (rows: Row[], status = 200) => (single ? json(rows[0] ?? null, status) : json(rows, status));
  await new Promise((r) => setTimeout(r, 180));

  if (method === 'GET') return reply(table.filter(matches));
  if (method === 'POST') {
    const body = JSON.parse(String(init?.body ?? '[]'));
    const added = (Array.isArray(body) ? body : [body]).map((row) => ({
      created_at: new Date().toISOString(),
      ...row,
      id: row.id ?? `demo-${seq++}`,
    }));
    table.push(...added);
    return wantsRows ? reply(added, 201) : json(null, 201);
  }
  if (method === 'PATCH') {
    const body = JSON.parse(String(init?.body ?? '{}'));
    const changed = table.filter(matches);
    changed.forEach((r) => Object.assign(r, body));
    return wantsRows ? reply(changed) : json(null, 204);
  }
  if (method === 'DELETE') {
    for (const r of table.filter(matches)) table.splice(table.indexOf(r), 1);
    return json(null, 204);
  }
  return json(null, 204);
}
