-- Stats snapshot for premium coaching charts (per-session preprocess output).
alter table public.coaching_sessions
  add column if not exists stats_snapshot jsonb;

comment on column public.coaching_sessions.stats_snapshot is
  'Structured stats from preprocessMatches (K/D trends, per-map rates, etc.) for dashboard charts.';

-- Checkbox state for the 3 weekly goals tied to a coaching session.
create table if not exists public.coaching_weekly_goal_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  session_id      uuid not null references public.coaching_sessions (id) on delete cascade,
  goal_index      smallint not null check (goal_index >= 0 and goal_index < 3),
  goal_text       text not null,
  done            boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (session_id, goal_index)
);

create index if not exists idx_coaching_goal_progress_user
  on public.coaching_weekly_goal_progress (user_id, session_id);

comment on table public.coaching_weekly_goal_progress is
  'Per-goal checkbox progress for AI weekly goals on the coaching dashboard.';

alter table public.coaching_weekly_goal_progress enable row level security;

create policy "coaching_goal_progress_select_own"
  on public.coaching_weekly_goal_progress for select
  using (auth.uid() = user_id);

create policy "coaching_goal_progress_insert_own"
  on public.coaching_weekly_goal_progress for insert
  with check (auth.uid() = user_id);

create policy "coaching_goal_progress_update_own"
  on public.coaching_weekly_goal_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "coaching_goal_progress_delete_own"
  on public.coaching_weekly_goal_progress for delete
  using (auth.uid() = user_id);
