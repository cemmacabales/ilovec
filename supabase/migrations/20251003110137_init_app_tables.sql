create table upcoming_dates (id uuid primary key default gen_random_uuid(), title text not null, event_date date not null, description text, created_at timestamptz default now());
create table movie_series_tracker (id uuid primary key default gen_random_uuid(), title text not null, status text not null, notes text, created_at timestamptz default now());
create table budget_tracker (id uuid primary key default gen_random_uuid(), item text not null, amount numeric not null, category text, notes text, created_at timestamptz default now());
create table bucket_list (id uuid primary key default gen_random_uuid(), title text not null, description text, completed boolean default false, created_at timestamptz default now());
create table shared_tasks (id uuid primary key default gen_random_uuid(), task text not null, assigned_to text, completed boolean default false, notes text, created_at timestamptz default now());
