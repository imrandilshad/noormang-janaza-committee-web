-- ============================================================
-- Migration 004: Add scheduled_date to announcements + ensure anon policies
-- ============================================================
-- Run this in your Supabase SQL Editor: 
-- Dashboard → SQL Editor → New query → paste & run

-- 1. Add scheduled_date column for meetings/events
ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS scheduled_date DATE NULL;

-- 2. Ensure public (anon) read policies exist (re-run safe)
DO $$
BEGIN
  -- Members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Public can read members'
  ) THEN
    CREATE POLICY "Public can read members" ON members FOR SELECT TO anon USING (true);
  END IF;

  -- Families
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Public can read families'
  ) THEN
    CREATE POLICY "Public can read families" ON families FOR SELECT TO anon USING (true);
  END IF;

  -- Funeral cases
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'funeral_cases' AND policyname = 'Public can read funeral cases'
  ) THEN
    CREATE POLICY "Public can read funeral cases" ON funeral_cases FOR SELECT TO anon USING (true);
  END IF;

  -- Announcements (only public ones)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'Public can read public announcements'
  ) THEN
    CREATE POLICY "Public can read public announcements"
      ON announcements FOR SELECT TO anon USING (is_public = true);
  END IF;
END $$;

-- 3. Create documents storage bucket (for file uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10 MB limit
  ARRAY['image/jpeg','image/png','image/gif','application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain','text/csv']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload documents'
  ) THEN
    CREATE POLICY "Authenticated users can upload documents"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can read documents'
  ) THEN
    CREATE POLICY "Anyone can read documents"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can delete documents'
  ) THEN
    CREATE POLICY "Authenticated users can delete documents"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'documents');
  END IF;
END $$;
