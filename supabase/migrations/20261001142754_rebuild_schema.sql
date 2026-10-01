-- Rebuild the schema with one clean table per tracker, real constraints, and
-- Row Level Security that only lets the two linked accounts in.
--
-- The old tables reused columns for other purposes (an expense's description
-- in `item`, who paid in `notes`, a poster path in `notes`). Only the watchlist
-- had rows when this ran; they are copied across before the old tables go.

-- Who's who --------------------------------------------------------------

-- One row per account that may use the app. Rows are added by hand (SQL editor
-- or service role); there is no policy that lets a client insert itself.
create table public.members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  person text not null unique check (person in ('him', 'her')),
  created_at timestamptz not null default now()
);

-- Kept out of the exposed `public` schema so it can't be called over the API.
create schema if not exists private;
grant usage on schema private to authenticated;

create function private.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.members where user_id = (select auth.uid()));
$$;

revoke all on function private.is_member() from public;
grant execute on function private.is_member() to authenticated;

-- Watchlist (carries over the old rows) ----------------------------------

create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null,
  kind text not null check (kind in ('movie', 'tv')),
  title text not null check (length(btrim(title)) > 0),
  poster_path text,
  status text not null default 'watchlist' check (status in ('watchlist', 'watching', 'completed')),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  unique (tmdb_id, kind)
);

do $$
begin
  if to_regclass('public.movie_series_tracker') is not null then
    insert into public.watchlist (tmdb_id, kind, title, poster_path, status, created_at)
    select
      tmdb_id,
      case when type = 'tv' then 'tv' else 'movie' end,
      coalesce(nullif(btrim(title), ''), 'Untitled'),
      coalesce(nullif(poster_path, ''), nullif(notes, '')),
      case when status in ('watchlist', 'watching', 'completed') then status else 'watchlist' end,
      coalesce(created_at, now())
    from public.movie_series_tracker
    where tmdb_id is not null
    on conflict (tmdb_id, kind) do nothing;
  end if;
end $$;

-- The old tables. All but movie_series_tracker were empty.
drop table if exists
  public.upcoming_dates,
  public.shared_tasks,
  public.movie_series_tracker,
  public.budget_tracker,
  public.budgets,
  public.savings_goals,
  public.bucket_list;

-- Dates ------------------------------------------------------------------

create table public.dates (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  day date not null,
  start_time time,
  location text not null default '',
  done boolean not null default false,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create index dates_day_idx on public.dates (day);

-- Tasks ------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  notes text not null default '',
  assigned_to text not null default 'both' check (assigned_to in ('him', 'her', 'both')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  category text not null default 'other'
    check (category in ('household', 'planning', 'shopping', 'personal', 'dates', 'other')),
  due_on date,
  done boolean not null default false,
  done_on date,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  check (done or done_on is null)
);

-- Budget -----------------------------------------------------------------

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null check (length(btrim(description)) > 0),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null default 'other'
    check (category in ('restaurants', 'entertainment', 'activities', 'travel', 'gifts', 'groceries',
                        'transportation', 'shopping', 'subscriptions', 'utilities', 'healthcare', 'other')),
  paid_by text not null check (paid_by in ('him', 'her')),
  spent_on date not null default current_date,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create index expenses_spent_on_idx on public.expenses (spent_on desc);

-- One monthly limit per category.
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null unique
    check (category in ('restaurants', 'entertainment', 'activities', 'travel', 'gifts', 'groceries',
                        'transportation', 'shopping', 'subscriptions', 'utilities', 'healthcare', 'other')),
  monthly_limit numeric(12, 2) not null check (monthly_limit > 0),
  alert_threshold smallint not null default 80 check (alert_threshold between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  target_date date not null,
  category text not null default 'other' check (category in ('vacation', 'home', 'wedding', 'emergency', 'other')),
  description text not null default '',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

-- Spending per category per month, computed from expenses so it can't drift.
-- security_invoker makes it run with the caller's RLS.
create view public.monthly_spend
with (security_invoker = true)
as
select
  date_trunc('month', spent_on)::date as month,
  category,
  sum(amount) as total,
  sum(amount) filter (where paid_by = 'him') as him,
  sum(amount) filter (where paid_by = 'her') as her,
  count(*)::integer as entries
from public.expenses
group by 1, 2;

-- Bucket list ------------------------------------------------------------

create table public.bucket_list (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  description text not null default '',
  category text not null default 'experiences'
    check (category in ('travel', 'adventure', 'experiences', 'learning', 'relationships', 'creativity',
                        'health', 'personal', 'career', 'financial', 'spiritual', 'other')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard', 'extreme')),
  progress smallint not null default 0 check (progress between 0 and 100),
  estimated_cost numeric(12, 2) check (estimated_cost >= 0),
  currency text not null default 'PHP',
  target_date date,
  completed_on date,
  location text not null default '',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  check (status = 'completed' or completed_on is null),
  check (status <> 'completed' or progress = 100)
);

-- Gallery ----------------------------------------------------------------

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

-- `path` and `thumb_path` are object names in the private `photos` bucket.
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  thumb_path text not null,
  title text not null default '',
  album_id uuid references public.albums (id) on delete set null,
  favorite boolean not null default false,
  tags text[] not null default '{}',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create index photos_album_id_idx on public.photos (album_id);

-- Row Level Security -----------------------------------------------------

alter table public.members enable row level security;
alter table public.watchlist enable row level security;
alter table public.dates enable row level security;
alter table public.tasks enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.bucket_list enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;

-- Members can see both member rows (to know who is Him and who is Her) but
-- can't add, change or remove any.
create policy "members can read members" on public.members
  for select to authenticated using ((select private.is_member()));

-- Everything else is shared between the two of you.
do $$
declare
  t text;
begin
  foreach t in array array['watchlist', 'dates', 'tasks', 'expenses', 'budgets', 'savings_goals',
                           'bucket_list', 'albums', 'photos']
  loop
    execute format(
      'create policy "members share everything" on public.%I for all to authenticated '
      'using ((select private.is_member())) with check ((select private.is_member()))',
      t
    );
  end loop;
end $$;

-- Nothing is readable without signing in.
revoke all on all tables in schema public from anon;
