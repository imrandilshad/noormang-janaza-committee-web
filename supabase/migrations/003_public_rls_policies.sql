-- ============================================================
-- Migration 003: Allow public (anon) read access for public-facing tables
-- ============================================================
-- The public website shows members, families, and funeral cases
-- without requiring login. This migration adds the necessary RLS
-- policies so the Supabase anon key can SELECT those tables.
--
-- Run AFTER 001_initial_schema.sql

-- Members: publicly readable (name, number, family, status, joined date)
CREATE POLICY "Public can read members"
  ON members FOR SELECT TO anon USING (true);

-- Families: publicly readable
CREATE POLICY "Public can read families"
  ON families FOR SELECT TO anon USING (true);

-- Funeral cases: publicly readable
CREATE POLICY "Public can read funeral cases"
  ON funeral_cases FOR SELECT TO anon USING (true);
