-- Broadcast LFG inserts to Supabase Realtime subscribers (used on /lfg).
alter publication supabase_realtime add table public.lfg_posts;
