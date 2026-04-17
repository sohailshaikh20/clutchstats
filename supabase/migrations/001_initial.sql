-- ============================================================
-- ClutchStats.gg — Initial Schema
-- Migration: 001_initial
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if not already available
create extension if not exists "pgcrypto";

-- ─── Enums ────────────────────────────────────────────────────────────────────

create type public.valorant_region as enum (
  'na', 'eu', 'ap', 'kr', 'latam', 'br'
);

-- ─── profiles ─────────────────────────────────────────────────────────────────
-- One row per auth.users entry, auto-created by the trigger below.
-- current_rank stores the Henrik tier integer (0 = Unrated … 25 = Radiant).

create table public.profiles (
  id               uuid        primary key references auth.users (id) on delete cascade,
  username         text        unique,
  riot_name        text,
  riot_tag         text,
  riot_puuid       text        unique,
  region           public.valorant_region,
  current_rank     smallint    check (current_rank between 0 and 25),
  avatar_url       text,
  is_premium       boolean     not null default false,
  premium_until    timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table  public.profiles                is 'Public user profile data. One row per auth.users entry.';
comment on column public.profiles.current_rank   is 'Henrik API tier integer: 0=Unrated, 3=Iron3, 25=Radiant.';
comment on column public.profiles.riot_puuid     is 'Immutable Riot PUUID — used as the stable player identifier.';

-- ─── lfg_posts ────────────────────────────────────────────────────────────────

create table public.lfg_posts (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles (id) on delete cascade,
  rank            text        not null,                        -- e.g. 'gold', 'platinum'
  agents          text[]      not null default '{}',          -- preferred agents
  region          public.valorant_region not null,
  playstyle       text,                                       -- e.g. 'aggressive', 'supportive'
  description     text,
  available_from  time,                                       -- local time window start
  available_to    time,                                       -- local time window end
  is_active       boolean     not null default true,
  expires_at      timestamptz not null default (now() + interval '24 hours'),
  created_at      timestamptz not null default now()
);

comment on table public.lfg_posts is 'Looking-for-group board posts. Expire after 24 h by default.';

-- Composite index used by the LFG filter query: region + rank + active status
create index idx_lfg_posts_region_rank_active
  on public.lfg_posts (region, rank, is_active);

-- Let Postgres auto-expire posts rather than relying on the app layer
create index idx_lfg_posts_expires_at
  on public.lfg_posts (expires_at)
  where is_active = true;

-- ─── player_cache ─────────────────────────────────────────────────────────────
-- Server-side cache for Henrik API responses to reduce outbound API calls.
-- PUUID is the primary key; upsert on cached_at to refresh.

create table public.player_cache (
  puuid           text        primary key,
  riot_name       text        not null,
  riot_tag        text        not null,
  region          text        not null,
  rank_data       jsonb,      -- full HenrikMMRResponse JSON
  match_history   jsonb,      -- array of recent HenrikMatch summaries
  agent_stats     jsonb,      -- aggregated per-agent stats derived from match_history
  cached_at       timestamptz not null default now()
);

comment on table  public.player_cache              is 'Server-side cache for Henrik API responses. Keyed by PUUID.';
comment on column public.player_cache.rank_data    is 'Full HenrikMMRResponse blob.';
comment on column public.player_cache.match_history is 'Array of condensed match objects for the last N games.';
comment on column public.player_cache.agent_stats  is 'Aggregated stats per agent derived from match_history.';

-- GIN index so JSONB queries on rank_data / agent_stats stay fast
create index idx_player_cache_rank_data    on public.player_cache using gin (rank_data);
create index idx_player_cache_agent_stats  on public.player_cache using gin (agent_stats);

-- ─── coaching_sessions ────────────────────────────────────────────────────────

create table public.coaching_sessions (
  id                uuid    primary key default gen_random_uuid(),
  user_id           uuid    not null references public.profiles (id) on delete cascade,
  analysis          jsonb   not null default '{}', -- full Claude API response + structured breakdown
  matches_analysed  int     not null default 0,
  insights_summary  text,
  created_at        timestamptz not null default now()
);

comment on table  public.coaching_sessions              is 'AI coaching analysis sessions stored per user.';
comment on column public.coaching_sessions.analysis     is 'Structured Claude response: patterns, recommendations, clips.';

create index idx_coaching_sessions_user_id
  on public.coaching_sessions (user_id, created_at desc);

-- ─── subscriptions ────────────────────────────────────────────────────────────

create table public.subscriptions (
  id                       uuid    primary key default gen_random_uuid(),
  user_id                  uuid    not null references public.profiles (id) on delete cascade,
  stripe_customer_id       text    unique,
  stripe_subscription_id   text    unique,
  status                   text    not null default 'inactive', -- matches Stripe status values
  current_period_end       timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

comment on table  public.subscriptions                        is 'Stripe subscription records, one per user.';
comment on column public.subscriptions.status                 is 'Mirrors Stripe status: active | canceled | past_due | trialing | incomplete.';
comment on column public.subscriptions.stripe_customer_id     is 'Stripe Customer ID — set on first checkout session.';
comment on column public.subscriptions.stripe_subscription_id is 'Stripe Subscription ID — set after first successful payment.';

create index idx_subscriptions_stripe_customer
  on public.subscriptions (stripe_customer_id);

create index idx_subscriptions_stripe_subscription
  on public.subscriptions (stripe_subscription_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
-- Shared function: stamp updated_at on every UPDATE.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

-- ─── Auto-create profile on sign-up ──────────────────────────────────────────
-- Fires after INSERT on auth.users so every new user gets a profiles row
-- immediately, avoiding null-profile race conditions on first login.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer                 -- runs as the table owner, not the signing-up user
set search_path = public
as $$
begin
  insert into public.profiles (id, avatar_url, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'avatar_url',
    -- Use the email local-part as a provisional username; users can change it.
    split_part(new.email, '@', 1)
  )
  on conflict (id) do nothing;   -- idempotent: safe to re-run on replicated envs
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.lfg_posts         enable row level security;
alter table public.player_cache      enable row level security;
alter table public.coaching_sessions enable row level security;
alter table public.subscriptions     enable row level security;

-- profiles: anyone (including anon) can read, only the owner can modify
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- lfg_posts: anyone can read active, non-expired posts; owner has full CRUD
create policy "lfg_posts_select_active"
  on public.lfg_posts for select
  using (is_active = true and expires_at > now());

create policy "lfg_posts_select_own"
  on public.lfg_posts for select
  using (auth.uid() = user_id);

create policy "lfg_posts_insert_own"
  on public.lfg_posts for insert
  with check (auth.uid() = user_id);

create policy "lfg_posts_update_own"
  on public.lfg_posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "lfg_posts_delete_own"
  on public.lfg_posts for delete
  using (auth.uid() = user_id);

-- player_cache: publicly readable (it's a cache of public stats), no writes via RLS
-- Only the service-role key (server) can upsert rows.
create policy "player_cache_select_all"
  on public.player_cache for select
  using (true);

-- coaching_sessions: users can only access their own sessions
create policy "coaching_sessions_select_own"
  on public.coaching_sessions for select
  using (auth.uid() = user_id);

create policy "coaching_sessions_insert_own"
  on public.coaching_sessions for insert
  with check (auth.uid() = user_id);

-- subscriptions: users can only read their own subscription record
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);
