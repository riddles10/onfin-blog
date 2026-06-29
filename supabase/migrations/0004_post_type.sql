-- 0004_post_type.sql
-- Adds a content-type axis to posts so service / status notices (maintenance
-- windows, schedule changes, platform status, regulatory notices) can live in
-- a dedicated News section, separate from editorial articles.
--
-- Orthogonal to `category`: an article and a news notice can share the same
-- category. Existing rows default to 'article'; the reclassify step then flips
-- the platform-updates / regulation-news notices to 'news'.

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'article';

ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE posts
  ADD CONSTRAINT posts_post_type_check CHECK (post_type IN ('article', 'news'));

-- Listing queries filter by (post_type, published) and order by published_at.
CREATE INDEX IF NOT EXISTS posts_post_type_published_idx
  ON posts (post_type, published, published_at DESC);
