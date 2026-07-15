-- ============================================================
-- Janaza Committee Management Portal - Supabase SQL Migrations
-- ============================================================
-- Run this in Supabase SQL Editor to set up the database.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- 1. FAMILIES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS families (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_name   TEXT NOT NULL,
  address       TEXT,
  village       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 2. MEMBERS TABLE
-- ===========================
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'deceased');

CREATE TABLE IF NOT EXISTS members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id     UUID REFERENCES families(id) ON DELETE SET NULL,
  member_number TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  father_name   TEXT,
  phone         TEXT,
  cnic          TEXT,
  occupation    TEXT,
  address       TEXT,
  status        member_status NOT NULL DEFAULT 'active',
  joined_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 3. FUNERAL CASES TABLE
-- ===========================
CREATE TYPE funeral_case_status AS ENUM ('open', 'closed');

CREATE TABLE IF NOT EXISTS funeral_cases (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number     TEXT NOT NULL UNIQUE,
  deceased_name   TEXT NOT NULL,
  member_id       UUID REFERENCES members(id) ON DELETE SET NULL,
  family_id       UUID REFERENCES families(id) ON DELETE SET NULL,
  date_of_death   DATE NOT NULL,
  date_of_funeral DATE,
  location        TEXT,
  contact_person  TEXT,
  contact_phone   TEXT,
  notes           TEXT,
  status          funeral_case_status NOT NULL DEFAULT 'open',
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 4. EXPENSES TABLE
-- ===========================
CREATE TYPE expense_category AS ENUM ('transportation', 'food', 'shroud', 'miscellaneous');

CREATE TABLE IF NOT EXISTS expenses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funeral_case_id  UUID NOT NULL REFERENCES funeral_cases(id) ON DELETE CASCADE,
  category         expense_category NOT NULL DEFAULT 'miscellaneous',
  description      TEXT,
  amount           NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  receipt_url      TEXT,
  expense_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 5. COLLECTIONS TABLE
-- ===========================
CREATE TYPE collection_status AS ENUM ('pending', 'partial', 'paid');

CREATE TABLE IF NOT EXISTS collections (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funeral_case_id  UUID NOT NULL REFERENCES funeral_cases(id) ON DELETE CASCADE,
  member_id        UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount_due       NUMERIC(12, 2) NOT NULL CHECK (amount_due >= 0),
  amount_paid      NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  status           collection_status NOT NULL DEFAULT 'pending',
  due_date         DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (funeral_case_id, member_id)
);

-- ===========================
-- 6. PAYMENTS TABLE
-- ===========================
CREATE TYPE payment_method AS ENUM ('cash', 'easypaisa', 'jazzcash', 'bank_transfer');

CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id    UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  amount           NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method   payment_method NOT NULL DEFAULT 'cash',
  reference_number TEXT,
  notes            TEXT,
  received_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 7. ANNOUNCEMENTS TABLE
-- ===========================
CREATE TYPE announcement_type AS ENUM ('death_notice', 'meeting', 'general');

CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  type        announcement_type NOT NULL DEFAULT 'general',
  is_public   BOOLEAN NOT NULL DEFAULT FALSE,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 8. DOCUMENTS TABLE
-- ===========================
CREATE TYPE document_type AS ENUM ('death_certificate', 'receipt', 'meeting_minutes', 'other');

CREATE TABLE IF NOT EXISTS documents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funeral_case_id  UUID REFERENCES funeral_cases(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  document_type    document_type NOT NULL DEFAULT 'other',
  file_url         TEXT NOT NULL,
  uploaded_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- AUTO-UPDATE updated_at
-- ===========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_families_updated_at    BEFORE UPDATE ON families    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at     BEFORE UPDATE ON members     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funeral_cases_updated_at BEFORE UPDATE ON funeral_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at    BEFORE UPDATE ON expenses    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================
ALTER TABLE families       ENABLE ROW LEVEL SECURITY;
ALTER TABLE members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_cases  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents      ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all records
CREATE POLICY "Authenticated users can read all" ON families       FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON members        FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON funeral_cases  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON expenses       FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON collections    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON payments       FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON announcements  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON documents      FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert / update / delete
CREATE POLICY "Authenticated can insert" ON families       FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update" ON families       FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete" ON families       FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert" ON members        FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update" ON members        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete" ON members        FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert" ON funeral_cases  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update" ON funeral_cases  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete" ON funeral_cases  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert" ON expenses       FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update" ON expenses       FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete" ON expenses       FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert" ON collections    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update" ON collections    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can insert" ON payments       FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can insert" ON announcements  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update" ON announcements  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete" ON announcements  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert" ON documents      FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete" ON documents      FOR DELETE TO authenticated USING (true);

-- Public announcements are readable by anon
CREATE POLICY "Public announcements readable" ON announcements
  FOR SELECT TO anon USING (is_public = true);

-- ===========================
-- INDEXES
-- ===========================
CREATE INDEX IF NOT EXISTS idx_members_family     ON members (family_id);
CREATE INDEX IF NOT EXISTS idx_members_status     ON members (status);
CREATE INDEX IF NOT EXISTS idx_funeral_cases_status ON funeral_cases (status);
CREATE INDEX IF NOT EXISTS idx_expenses_case      ON expenses (funeral_case_id);
CREATE INDEX IF NOT EXISTS idx_collections_case   ON collections (funeral_case_id);
CREATE INDEX IF NOT EXISTS idx_collections_member ON collections (member_id);
CREATE INDEX IF NOT EXISTS idx_payments_collection ON payments (collection_id);
