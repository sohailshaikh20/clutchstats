-- LFG reports table: users can report posts for moderation.
-- After AUTO_REMOVE_REPORT_THRESHOLD (3) reports, the post is auto-hidden by the API.

CREATE TABLE IF NOT EXISTS lfg_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID NOT NULL REFERENCES lfg_posts(id) ON DELETE CASCADE,
  reporter_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, reporter_id)
);

-- Index for fast "count reports on a post" queries
CREATE INDEX IF NOT EXISTS lfg_reports_post_idx ON lfg_reports (post_id);

-- Row-level security: only authenticated users can insert, only service role can select
ALTER TABLE lfg_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can report" ON lfg_reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Add expires_at to lfg_posts if not already present (for 24h auto-expiry)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lfg_posts' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE lfg_posts ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
END;
$$;
