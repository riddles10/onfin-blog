-- 0003_posts_updated_at.sql
--
-- The article JSON-LD pinned `dateModified` to `published_at`, so editing a
-- post never refreshed the freshness signal Google / AI crawlers read. Track a
-- real last-edit timestamp on posts.
--
-- IMPORTANT: the trigger bumps `updated_at` ONLY when content columns actually
-- change. The per-pageview `views = views + 1` write (app/api/blog/track-view)
-- must NOT count as an edit, otherwise `dateModified` would churn on every
-- visit and look like constant spammy re-editing to crawlers.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Backfill existing rows to their real last-known timestamp, NOT the migration
-- moment — we do not want to mass-signal "every post edited today".
UPDATE posts
   SET updated_at = COALESCE(published_at, created_at)
 WHERE updated_at IS NULL;

ALTER TABLE posts ALTER COLUMN updated_at SET DEFAULT NOW();

CREATE OR REPLACE FUNCTION posts_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.title_en    IS DISTINCT FROM OLD.title_en
  OR NEW.title_th    IS DISTINCT FROM OLD.title_th
  OR NEW.body_en     IS DISTINCT FROM OLD.body_en
  OR NEW.body_th     IS DISTINCT FROM OLD.body_th
  OR NEW.excerpt_en  IS DISTINCT FROM OLD.excerpt_en
  OR NEW.excerpt_th  IS DISTINCT FROM OLD.excerpt_th
  OR NEW.cover_image IS DISTINCT FROM OLD.cover_image
  OR NEW.category    IS DISTINCT FROM OLD.category THEN
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION posts_set_updated_at();
