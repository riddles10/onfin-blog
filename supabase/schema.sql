-- ─────────────────────────────────────────────────────────────────────────────
-- CMS Database Schema (consolidated)
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in your Supabase SQL editor to set up all CMS tables.
-- Safe to re-run — uses IF NOT EXISTS and ON CONFLICT throughout.
--
-- NOTE: Customize the CHECK constraints on posts.category, events.category,
-- and topic_queue.category to match your cms-config.ts POST_CATEGORIES and
-- EVENT_CATEGORIES arrays.

-- ── Blog posts ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID,                                  -- legacy, unused
  blog_author_id UUID,                             -- references authors(id), added below
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_th TEXT,
  body_en TEXT NOT NULL,
  body_th TEXT,
  excerpt_en TEXT,
  excerpt_th TEXT,
  category TEXT NOT NULL DEFAULT 'general',         -- CUSTOMIZE: match your POST_CATEGORIES
  cover_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  views INTEGER NOT NULL DEFAULT 0,
  generation_status TEXT DEFAULT NULL
    CHECK (generation_status IN (
      'queued',
      'en_drafted',
      'translating',
      'draft_ready',
      'failed'
    )),
  qa_score_en INTEGER,
  qa_score_th INTEGER,
  generation_topic_id UUID,                        -- references topic_queue(id), added below
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_generation_status_idx
  ON posts (generation_status) WHERE generation_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS posts_views_idx ON posts (views DESC);

-- ── Authors ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_th TEXT,
  bio_en TEXT,
  bio_th TEXT,
  avatar_url TEXT,
  twitter TEXT,
  linkedin TEXT,
  website TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one default author at a time.
CREATE UNIQUE INDEX IF NOT EXISTS authors_only_one_default
  ON authors ((is_default)) WHERE is_default = TRUE;

-- Link posts → authors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'blog_author_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN blog_author_id UUID REFERENCES authors(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS posts_blog_author_id_idx
  ON posts (blog_author_id) WHERE blog_author_id IS NOT NULL;

-- ── Events ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_th TEXT,
  description_en TEXT,
  description_th TEXT,
  venue TEXT,
  event_date DATE NOT NULL,
  registration_url TEXT,
  cover_image TEXT,
  category TEXT DEFAULT 'conference',               -- CUSTOMIZE: match your EVENT_CATEGORIES
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CMS Pages ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_th TEXT,
  body_en TEXT NOT NULL,
  body_th TEXT,
  meta_description_en TEXT,
  meta_description_th TEXT,
  published BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Topic queue ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS topic_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}'::TEXT[],
  category TEXT NOT NULL DEFAULT 'general',          -- CUSTOMIZE: match your POST_CATEGORIES
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'used', 'skipped', 'failed')),
  priority INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  used_at TIMESTAMPTZ,
  used_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS topic_queue_status_priority_idx
  ON topic_queue (status, priority DESC, created_at ASC);

-- Link posts → topic_queue
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'generation_topic_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN generation_topic_id UUID REFERENCES topic_queue(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── Storage bucket ───────────────────────────────────────────────────────────
-- Creates the image upload bucket. The bucket name should match STORAGE_BUCKET
-- in your cms-config.ts (default: 'cms-images').

INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-images', 'cms-images', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read cms images" ON storage.objects;
CREATE POLICY "Public read cms images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'cms-images');

DROP POLICY IF EXISTS "Authenticated insert cms images" ON storage.objects;
CREATE POLICY "Authenticated insert cms images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cms-images');

DROP POLICY IF EXISTS "Users delete own cms images" ON storage.objects;
CREATE POLICY "Users delete own cms images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'cms-images' AND auth.uid() = owner);

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are public" ON posts FOR SELECT USING (published = TRUE);
CREATE POLICY "Events are public" ON events FOR SELECT USING (TRUE);
CREATE POLICY "Published pages are public" ON pages FOR SELECT USING (published = TRUE);
CREATE POLICY "Authors are publicly viewable" ON authors FOR SELECT USING (TRUE);

-- ── Seed default author ──────────────────────────────────────────────────────

INSERT INTO authors (slug, name, name_th, bio_en, bio_th, is_default)
VALUES (
  'onfin-editorial',
  'OnFin Editorial',
  NULL,
  'The OnFin editorial desk covers market analysis, trading guides, platform updates, and regulation news for retail forex and CFD traders.',
  NULL,
  TRUE
)
ON CONFLICT (slug) DO NOTHING;
