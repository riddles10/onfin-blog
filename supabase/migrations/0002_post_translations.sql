-- Migration 0002 — locale support via a post_translations pivot table.
--
-- Apply once after 0001_rss_triage.sql is in place. Idempotent — safe to
-- re-run. Run via Supabase dashboard SQL Editor.
--
-- Shared-project note
-- -------------------
-- The Supabase project mamhodabqvalbcvsqqgp is shared with onfin-genesis,
-- which also adds tables under the public schema. Our table names live
-- in a non-overlapping namespace (blog domain: posts/authors/events/
-- pages/topic_queue/cms_settings/post_translations vs genesis domain:
-- affiliates/audit_log/auth_users/credit_ledger/level_tiers/marketing_
-- assets/payout_batches/referrals/rejection_reasons/submissions/tasks).
-- Verified at the time this migration was written. If a new genesis
-- table appears with a name collision, coordinate before applying.
--
-- Design
-- ------
-- The English version stays in `posts.{title_en, body_en, excerpt_en}` as
-- the canonical source. Every other locale lives as a row in this pivot
-- table, keyed by (post_id, locale). When a non-English locale is
-- requested, the read path tries to find a translation row; if missing,
-- it falls back to the English columns and flags `isFallback: true` so
-- the page can show a banner.
--
-- This avoids the column-explosion alternative (body_ru, body_vi, body_th,
-- body_ms, body_id, body_es, body_km, body_zh on the posts table) and
-- scales cleanly when a locale is added/removed without DDL.

CREATE TABLE IF NOT EXISTS post_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  excerpt TEXT,
  -- How the translation was produced. Lets the admin filter "AI-translated
  -- pending review" from "human-translated, ready". Add new sources by
  -- updating the CHECK constraint.
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'ai', 'imported')),
  qa_score INTEGER,                                   -- optional, populated by score-post
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, locale)
);

CREATE INDEX IF NOT EXISTS post_translations_post_id_idx
  ON post_translations (post_id);

CREATE INDEX IF NOT EXISTS post_translations_locale_idx
  ON post_translations (locale);

-- RLS — translations of published posts are publicly readable, mirroring
-- the policy on `posts`. Service role bypasses RLS for admin writes.
ALTER TABLE post_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Translations of published posts are public" ON post_translations;
CREATE POLICY "Translations of published posts are public"
  ON post_translations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM posts
      WHERE posts.id = post_translations.post_id
        AND posts.published = TRUE
    )
  );

-- Convenience: keep updated_at honest. Trigger only fires on UPDATE so
-- the DEFAULT NOW() handles INSERTs.
CREATE OR REPLACE FUNCTION post_translations_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_translations_updated_at ON post_translations;
CREATE TRIGGER post_translations_updated_at
  BEFORE UPDATE ON post_translations
  FOR EACH ROW EXECUTE FUNCTION post_translations_set_updated_at();
