-- Learning Packs
-- Parents upload photos of textbook pages; on-device OCR extracts the text, a
-- deterministic rules engine turns it into games, and the pack is assigned to
-- one or more children. The kid then plays their normal games, but the questions
-- come from the uploaded pages.
--
-- The kid plays inside the parent's authenticated session on the same device, so
-- every table is simply scoped to the owning parent (auth.uid()).

CREATE TABLE IF NOT EXISTS learning_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Lesson',
  subject TEXT NOT NULL DEFAULT 'General',
  -- Visual/topic theme the parent picks for the kid (e.g. jungle, space, ocean).
  theme TEXT NOT NULL DEFAULT 'jungle',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready')),
  -- Combined, parent-reviewed text used to (re)generate games.
  source_text TEXT NOT NULL DEFAULT '',
  -- Cached generated output: { games: GameConfig[], facts: [...], generatedAt }.
  generated JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pack_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES learning_packs(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  -- Path in the private `book-uploads` storage bucket (best-effort; may be null).
  storage_path TEXT,
  ocr_text TEXT NOT NULL DEFAULT '',
  edited_text TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pack_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES learning_packs(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pack_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_packs_parent ON learning_packs(parent_id);
CREATE INDEX IF NOT EXISTS idx_pack_pages_pack ON pack_pages(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_assignments_child ON pack_assignments(child_id);
CREATE INDEX IF NOT EXISTS idx_pack_assignments_pack ON pack_assignments(pack_id);

-- Row-Level Security: everything scoped to the owning parent.
ALTER TABLE learning_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS learning_packs_own ON learning_packs;
CREATE POLICY learning_packs_own ON learning_packs
  FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS pack_pages_own ON pack_pages;
CREATE POLICY pack_pages_own ON pack_pages
  FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS pack_assignments_own ON pack_assignments;
CREATE POLICY pack_assignments_own ON pack_assignments
  FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

-- Keep updated_at fresh on learning_packs.
CREATE OR REPLACE FUNCTION set_learning_pack_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_learning_packs_updated_at ON learning_packs;
CREATE TRIGGER trg_learning_packs_updated_at
  BEFORE UPDATE ON learning_packs
  FOR EACH ROW EXECUTE FUNCTION set_learning_pack_updated_at();

-- Private storage bucket for the uploaded textbook photos.
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-uploads', 'book-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: a parent can manage only files under a top-level folder named
-- after their own auth uid, e.g. `<uid>/<packId>/<pageId>.jpg`.
DROP POLICY IF EXISTS book_uploads_own ON storage.objects;
CREATE POLICY book_uploads_own ON storage.objects
  FOR ALL
  USING (bucket_id = 'book-uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'book-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
