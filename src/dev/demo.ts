// Dev-only demo data, for looking at the UI while the database is unreachable.
// Turn on with ?demo in the URL, off with ?demo=off. Never bundled in production
// (callers guard with import.meta.env.DEV). Everything here is sample content.

type Row = Record<string, unknown> & { id: string };

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const tables: Record<string, Row[]> = {
  upcoming_dates: [
    { id: 'd1', title: 'Ramen and a walk in Maginhawa', event_date: day(3), event_time: '19:00', location: 'Maginhawa St, QC', event_complete: false },
    { id: 'd2', title: 'Picnic at the Sunken Garden', event_date: day(9), event_time: '16:30', location: 'UP Diliman', event_complete: false },
    { id: 'd3', title: 'Concert night', event_date: day(17), event_time: '20:00', location: 'Araneta Coliseum', event_complete: false },
    { id: 'd4', title: 'Coffee before work', event_date: day(-4), event_time: '08:00', location: '', event_complete: true },
  ],
  shared_tasks: [
    { id: 't1', task: 'Book the picnic spot', notes: '', assigned_to: 'him', priority: 'high', due_date: day(2), category: 'dates', is_completed: false, created_at: day(-3) },
    { id: 't2', task: 'Buy a birthday gift for Mama', notes: 'Something for the garden', assigned_to: 'her', priority: 'medium', due_date: day(6), category: 'shopping', is_completed: false, created_at: day(-2) },
    { id: 't3', task: 'Pay the internet bill', notes: '', assigned_to: 'both', priority: 'medium', due_date: day(-1), category: 'household', is_completed: false, created_at: day(-6) },
    { id: 't4', task: 'Pick the next show to start', notes: '', assigned_to: 'both', priority: 'low', due_date: null, category: 'other', is_completed: false, created_at: day(-1) },
    { id: 't5', task: 'Renew passports', notes: '', assigned_to: 'both', priority: 'high', due_date: null, category: 'planning', is_completed: true, completed_date: day(-2), created_at: day(-20) },
  ],
  movie_series_tracker: [
    { id: 'm1', tmdb_id: 136315, type: 'tv', title: 'The Bear', notes: '/eKfVzzEazSIjJMrw9ADa2x8ksLz.jpg', status: 'watching', created_at: day(-10) },
    { id: 'm2', tmdb_id: 125935, type: 'tv', title: 'Abbott Elementary', notes: '/nBe1e3JJEZ6veGrVXNF0fRoLu56.jpg', status: 'watching', created_at: day(-12) },
    { id: 'm3', tmdb_id: 666277, type: 'movie', title: 'Past Lives', notes: '/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg', status: 'watchlist', created_at: day(-4) },
    { id: 'm4', tmdb_id: 76, type: 'movie', title: 'Before Sunrise', notes: '/kf1Jb1c2JAOqjuzA3H4oDM263uB.jpg', status: 'watchlist', created_at: day(-5) },
    { id: 'm5', tmdb_id: 89905, type: 'tv', title: 'Normal People', notes: '/tbKSsFd4ImzUgbYolttkq4pmOPQ.jpg', status: 'watching', created_at: day(-8) },
    { id: 'm6', tmdb_id: 313369, type: 'movie', title: 'La La Land', notes: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', status: 'completed', created_at: day(-30) },
  ],
  budget_tracker: [
    { id: 'e1', item: 'Ramen dinner', amount: 1240, category: 'restaurants', notes: 'partner1', created_at: day(0) },
    { id: 'e2', item: 'Grab home', amount: 286, category: 'transportation', notes: 'partner2', created_at: day(0) },
    { id: 'e3', item: 'Movie tickets', amount: 760, category: 'entertainment', notes: 'partner2', created_at: day(-5) },
    { id: 'e4', item: 'Groceries for the week', amount: 3415.5, category: 'groceries', notes: 'partner1', created_at: day(-7) },
    { id: 'e5', item: 'Flowers', amount: 650, category: 'gifts', notes: 'partner1', created_at: day(-9) },
  ],
  budgets: [
    { id: 'b1', category: 'restaurants', monthly_limit: 6000, current_spent: 0, alert_threshold: 80, is_active: true },
    { id: 'b2', category: 'entertainment', monthly_limit: 2500, current_spent: 0, alert_threshold: 80, is_active: true },
  ],
  savings_goals: [
    { id: 'g1', title: 'Baguio weekend', target_amount: 15000, current_amount: 6200, target_date: day(60), category: 'vacation', description: '' },
  ],
  bucket_list: [
    { id: 'k1', title: 'See the sunrise at Mt. Pulag', category: 'adventure', priority: 'high', status: 'in_progress', difficulty: 'hard', progress: 40, estimated_cost: 8000, currency: 'PHP', target_date: day(120), created_at: day(-40) },
    { id: 'k2', title: 'Take a pottery class together', category: 'creativity', priority: 'medium', status: 'not_started', difficulty: 'easy', progress: 0, estimated_cost: 3500, currency: 'PHP', created_at: day(-20) },
    { id: 'k3', title: 'Learn to dive in Anilao', category: 'travel', priority: 'medium', status: 'in_progress', difficulty: 'medium', progress: 15, created_at: day(-15) },
    { id: 'k4', title: 'Watch a show at the CCP', category: 'experiences', priority: 'low', status: 'completed', difficulty: 'easy', progress: 100, created_at: day(-90) },
  ],
};

let seq = 100;

const json = (body: unknown, status = 200) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export function demoEnabled() {
  try {
    const param = new URLSearchParams(location.search).get('demo');
    if (param === 'off') sessionStorage.removeItem('ilovec-demo');
    else if (param !== null) sessionStorage.setItem('ilovec-demo', '1');
    return sessionStorage.getItem('ilovec-demo') === '1';
  } catch {
    return false;
  }
}

// Answers Supabase REST calls (GET/POST/PATCH/DELETE on /rest/v1/<table>) from memory.
export async function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  const match = url.pathname.match(/\/rest\/v1\/([a-z_]+)/);
  if (!match) return null;
  const table = (tables[match[1]] ??= []);
  const method = (init?.method ?? 'GET').toUpperCase();
  const idFilter = url.searchParams.get('id')?.replace(/^eq\./, '');
  await new Promise((r) => setTimeout(r, 180));

  if (method === 'GET') {
    const rows = [...table].reverse();
    return json(rows);
  }
  if (method === 'POST') {
    const body = JSON.parse(String(init?.body ?? '[]'));
    for (const row of Array.isArray(body) ? body : [body]) table.push({ ...row, id: `demo-${seq++}` });
    return json(null, 201);
  }
  if (method === 'PATCH' && idFilter) {
    const body = JSON.parse(String(init?.body ?? '{}'));
    const i = table.findIndex((r) => r.id === idFilter);
    if (i >= 0) table[i] = { ...table[i], ...body };
    return json(null, 204);
  }
  if (method === 'DELETE' && idFilter) {
    const i = table.findIndex((r) => r.id === idFilter);
    if (i >= 0) table.splice(i, 1);
    return json(null, 204);
  }
  return json(null, 204);
}
