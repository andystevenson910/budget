-- Spending Tracker — Supabase Schema
-- Paste this into the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- 1. Create the user_data table
create table if not exists public.user_data (
  user_id  uuid references auth.users(id) on delete cascade primary key,
  transactions  jsonb not null default '[]'::jsonb,
  categories    jsonb not null default '[]'::jsonb,
  settings      jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now()
);

-- 2. Enable Row Level Security (users can only see/modify their own row)
alter table public.user_data enable row level security;

create policy "Users manage their own data"
  on public.user_data
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Optional: auto-update updated_at on every write
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_data_updated_at
  before update on public.user_data
  for each row execute procedure public.set_updated_at();
