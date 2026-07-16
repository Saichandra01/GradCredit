/*
# Add Co-Applicants, Notifications, and Appointments

## Summary
Extends the Pathfinders Overseas schema with three new tables to support:
1. Full co-applicant data required for education loan processing
2. In-app student notifications
3. Counselor appointment bookings from within the portal

## New Tables

### co_applicants
Stores complete co-applicant profiles linked to both a student (user_id) and
optionally their application. Supports multiple co-applicants per application.
All complex nested data (employment, financial, document metadata) is stored
as JSONB for flexibility across salaried, self-employed, and business owner profiles.

Columns:
- id (uuid, PK)
- user_id (uuid, FK → auth.users) — the student who owns this co-applicant
- application_id (uuid, FK → applications, nullable)
- relationship (text) — Father, Mother, Spouse, etc.
- personal_info (jsonb) — name, DOB, Aadhaar, PAN, address, etc.
- employment_type (text) — salaried | self_employed | business_owner | government | retired | professional | other
- employment_info (jsonb) — conditional data based on employment_type
- financial_info (jsonb) — CIBIL score, existing loans, savings, FDs, investments
- documents (jsonb) — array of uploaded document metadata
- verification_status (text) — pending | under_review | verified | rejected
- admin_notes (text) — internal remarks from admin/counselor
- created_at, updated_at

### notifications
In-app notifications delivered to students.

Columns:
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- title (text)
- message (text)
- type (text) — info | success | warning | action_required
- read (boolean, default false)
- action_url (text, nullable) — deep link within portal
- created_at

### appointments
Counselor appointment bookings.

Columns:
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- counselor_name (text)
- appointment_type (text) — counseling | loan | visa | document_review | general
- preferred_date (date)
- preferred_time (text)
- status (text) — pending | confirmed | completed | cancelled | rescheduled
- notes (text)
- meeting_link (text, nullable)
- created_at

## Security
- RLS enabled on all three tables.
- Students can only access their own records.
- Notifications: read-only for students (insert by system/admin only).
- Appointments: students can insert and update their own.
*/

-- CO_APPLICANTS
CREATE TABLE IF NOT EXISTS co_applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  relationship text NOT NULL,
  personal_info jsonb NOT NULL DEFAULT '{}',
  employment_type text NOT NULL DEFAULT 'salaried'
    CHECK (employment_type IN ('salaried','self_employed','business_owner','government','retired','professional','other')),
  employment_info jsonb NOT NULL DEFAULT '{}',
  financial_info jsonb NOT NULL DEFAULT '{}',
  documents jsonb NOT NULL DEFAULT '[]',
  photo_url text,
  signature_url text,
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','under_review','verified','rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE co_applicants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_co_applicants" ON co_applicants;
CREATE POLICY "select_own_co_applicants" ON co_applicants FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_co_applicants" ON co_applicants;
CREATE POLICY "insert_own_co_applicants" ON co_applicants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_co_applicants" ON co_applicants;
CREATE POLICY "update_own_co_applicants" ON co_applicants FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_co_applicants" ON co_applicants;
CREATE POLICY "delete_own_co_applicants" ON co_applicants FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'
    CHECK (type IN ('info','success','warning','action_required')),
  read boolean NOT NULL DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  counselor_name text NOT NULL DEFAULT 'Any Available Counselor',
  appointment_type text NOT NULL DEFAULT 'general'
    CHECK (appointment_type IN ('counseling','loan','visa','document_review','general','interview_prep')),
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','completed','cancelled','rescheduled')),
  notes text,
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_appointments" ON appointments;
CREATE POLICY "select_own_appointments" ON appointments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_appointments" ON appointments;
CREATE POLICY "insert_own_appointments" ON appointments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_appointments" ON appointments;
CREATE POLICY "update_own_appointments" ON appointments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_appointments" ON appointments;
CREATE POLICY "delete_own_appointments" ON appointments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_co_applicants_user_id ON co_applicants(user_id);
CREATE INDEX IF NOT EXISTS idx_co_applicants_application_id ON co_applicants(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

-- Trigger for co_applicants updated_at
DROP TRIGGER IF EXISTS co_applicants_updated_at ON co_applicants;
CREATE TRIGGER co_applicants_updated_at
  BEFORE UPDATE ON co_applicants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS appointments_updated_at ON appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
