-- Migration 0001 — RSS triage support for Articles, Carousels, and Reels.
--
-- Apply once after the base schema.sql is in place. Idempotent — safe to
-- re-run on a project that already has these objects.
--
-- Run via Supabase dashboard SQL Editor or psql.

-- ─────────────────────────────────────────────────────────────────────────────
-- topic_queue: track which output format each triaged item targets and where
-- it originated, plus a triage timestamp so the admin can hide already-handled
-- items on refresh.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE topic_queue
  ADD COLUMN IF NOT EXISTS format TEXT
    CHECK (format IN ('article', 'carousel', 'reel')) DEFAULT NULL;

ALTER TABLE topic_queue
  ADD COLUMN IF NOT EXISTS source_url TEXT DEFAULT NULL;

ALTER TABLE topic_queue
  ADD COLUMN IF NOT EXISTS triaged_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS topic_queue_format_idx
  ON topic_queue (format) WHERE format IS NOT NULL;

CREATE INDEX IF NOT EXISTS topic_queue_source_url_idx
  ON topic_queue (source_url) WHERE source_url IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- cms_settings: tiny key/value table for runtime-editable configuration.
-- Currently used for the RSS-triage webhook URL; will hold any other
-- "set in the admin UI, persists across deploys" knobs we add later.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cms_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only the service-role key (used by the admin API routes) should
-- touch this table. Anonymous reads are blocked.
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;
-- No policies = nobody but service_role can read or write.
