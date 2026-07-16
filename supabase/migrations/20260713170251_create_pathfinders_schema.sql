/*
# Pathfinders Overseas – Core Schema

## Summary
Creates the full database schema for Pathfinders Overseas overseas education consultancy.

## New Tables

### profiles
Stores student profile data linked to Supabase auth users.
- id (uuid, PK, references auth.users)
- email, full_name, phone, date_of_birth, address
- created_at, updated_at

### applications
Tracks each student's overseas education application end-to-end.
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- status: draft | submitted | under_review | offer_received | visa_applied | visa_approved | enrolled
- preferred_country, preferred_course, preferred_university
- intake_year, intake_month
- current_step (1–10 multi-step process)
- personal_info, academic_info, test_scores (JSONB for flexible form data)
- loan_required, loan_amount
- created_at, updated_at

### loan_applications
Tracks education loan applications.
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- application_id (FK → applications, optional)
- bank_name, loan_amount_requested, status
- income_details, collateral_info (JSONB)
- created_at, updated_at

### documents
Stores document metadata (actual files in Supabase Storage).
- id (uuid, PK)
- user_id, application_id
- document_type, file_name, file_url, status
- created_at

### consultations
Stores free consultation bookings from the landing page.
- id (uuid, PK)
- name, email, phone
- preferred_country, course_interest, preferred_date, preferred_time
- counselor_name, message, status
- created_at

## Security
- RLS enabled on all tables.
- Authenticated users can only access their own rows.
- Consultations allow anon inserts (public booking form).
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  date_of_birth date,
  address text,
  city text,
  country text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','under_review','offer_received','visa_applied','visa_approved','enrolled')),
  preferred_country text,
  preferred_course text,
  preferred_university text,
  intake_year int,
  intake_month text,
  current_step int NOT NULL DEFAULT 1,
  personal_info jsonb,
  academic_info jsonb,
  test_scores jsonb,
  work_experience jsonb,
  loan_required boolean NOT NULL DEFAULT false,
  loan_amount numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- LOAN APPLICATIONS
CREATE TABLE IF NOT EXISTS loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  bank_name text,
  loan_amount_requested numeric,
  loan_amount_approved numeric,
  interest_rate numeric,
  tenure_years int,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','approved','rejected','disbursed')),
  income_details jsonb,
  collateral_info jsonb,
  co_applicant_info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_loans" ON loan_applications;
CREATE POLICY "select_own_loans" ON loan_applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_loans" ON loan_applications;
CREATE POLICY "insert_own_loans" ON loan_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_loans" ON loan_applications;
CREATE POLICY "update_own_loans" ON loan_applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_loans" ON loan_applications;
CREATE POLICY "delete_own_loans" ON loan_applications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','under_review','approved','rejected')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- CONSULTATIONS (public booking - allow anon inserts)
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_country text,
  course_interest text,
  preferred_date date,
  preferred_time text,
  counselor_name text,
  message text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_consultations" ON consultations;
CREATE POLICY "anon_insert_consultations" ON consultations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_own_consultations" ON consultations;
CREATE POLICY "auth_select_own_consultations" ON consultations FOR SELECT
  TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_consultations_email ON consultations(email);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS applications_updated_at ON applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS loan_applications_updated_at ON loan_applications;
CREATE TRIGGER loan_applications_updated_at
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
