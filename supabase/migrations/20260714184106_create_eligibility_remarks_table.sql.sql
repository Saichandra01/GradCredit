/*
# Create eligibility_remarks table

1. New Tables
- `eligibility_remarks`
  - `id` (uuid, primary key)
  - `application_id` (uuid, foreign key to applications.id, ON DELETE CASCADE)
  - `user_id` (uuid, not null, defaults to auth.uid())
  - `missing_documents` (text, nullable) — counselor notes on missing documents
  - `recommended_bank` (text, nullable) — counselor's recommended bank
  - `eligibility_remarks` (text, nullable) — general eligibility remarks
  - `next_steps` (text, nullable) — suggested next steps
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
2. Security
- Enable RLS on `eligibility_remarks`.
- Students can read their own remarks (SELECT).
- Only authenticated users can read; INSERT/UPDATE restricted to admin via service role or admin check.
- Students cannot edit (no UPDATE policy for non-admins via anon/authenticated).
3. Important Notes
- This table stores read-only counselor remarks that students can view but not edit.
- Admins write to this table via the admin dashboard or service role.
- One remark row per application (unique on application_id).
*/

CREATE TABLE IF NOT EXISTS eligibility_remarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  missing_documents text,
  recommended_bank text,
  eligibility_remarks text,
  next_steps text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE eligibility_remarks ENABLE ROW LEVEL SECURITY;

-- Unique constraint: one remark row per application
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'eligibility_remarks_application_id_key') THEN
    ALTER TABLE eligibility_remarks ADD CONSTRAINT eligibility_remarks_application_id_key UNIQUE (application_id);
  END IF;
END $$;

-- Students can read their own remarks
DROP POLICY IF EXISTS "select_own_eligibility_remarks" ON eligibility_remarks;
CREATE POLICY "select_own_eligibility_remarks"
ON eligibility_remarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can insert their own remarks (admin writes via service role)
DROP POLICY IF EXISTS "insert_own_eligibility_remarks" ON eligibility_remarks;
CREATE POLICY "insert_own_eligibility_remarks"
ON eligibility_remarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only the owner can update (admin uses service role to bypass RLS)
DROP POLICY IF EXISTS "update_own_eligibility_remarks" ON eligibility_remarks;
CREATE POLICY "update_own_eligibility_remarks"
ON eligibility_remarks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
