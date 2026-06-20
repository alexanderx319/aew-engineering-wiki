-- ═══════════════════════════════════════════════════════════════
-- AEW — Supabase Schema v1.0
-- Ejecuta esto en Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users table (extends Supabase auth) ──────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  created_at  timestamptz default now()
);

-- ─── AEW State table ──────────────────────────────────────────
-- One row per user. Stores the entire AEWState as JSON.
-- Simple, fast, no complex joins needed.
create table if not exists public.aew_state (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  state       jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- ─── Row Level Security ────────────────────────────────────────
-- Users can only read/write their own data

alter table public.profiles  enable row level security;
alter table public.aew_state enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- AEW state policies
create policy "Users can view own state"
  on public.aew_state for select
  using (auth.uid() = user_id);

create policy "Users can insert own state"
  on public.aew_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own state"
  on public.aew_state for update
  using (auth.uid() = user_id);

-- ─── Auto-create profile on signup ────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Update timestamp trigger ──────────────────────────────────
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger aew_state_updated_at
  before update on public.aew_state
  for each row execute procedure public.update_updated_at();

-- ─── Realtime ──────────────────────────────────────────────────
-- Required for the client's postgres_changes subscription to receive
-- UPDATE events on this table. Without this, supabase.channel(...).on(
-- "postgres_changes", ...) never fires — the table can be written to and
-- read from fine, but no change notifications go out, which is why a
-- second device never found out about an edit until it reloaded.
-- Safe to run even if already added — guarded by the IF NOT EXISTS check.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'aew_state'
  ) then
    alter publication supabase_realtime add table public.aew_state;
  end if;
end $$;
