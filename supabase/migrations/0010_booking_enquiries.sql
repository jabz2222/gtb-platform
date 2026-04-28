-- ============================================================
-- 0010_booking_enquiries.sql
-- Public booking enquiry form submissions.
-- Anonymous (no auth required); no payment gateway — bank transfer flow.
-- Admin/Staff/Mentor read all; nobody updates except admin.
-- ============================================================

CREATE TABLE IF NOT EXISTS booking_enquiries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  division_slug   TEXT NOT NULL,
  session_type    TEXT NOT NULL,
  participant_age TEXT,
  message         TEXT,
  source          TEXT, -- "How did you hear about GTB?"
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','booked','closed','spam')),
  notes           TEXT, -- internal admin notes
  contacted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_enquiries_status   ON booking_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_booking_enquiries_division ON booking_enquiries(division_slug);
CREATE INDEX IF NOT EXISTS idx_booking_enquiries_created  ON booking_enquiries(created_at DESC);

ALTER TABLE booking_enquiries ENABLE ROW LEVEL SECURITY;

-- INSERT: anyone (used via service-role from a public Route Handler — RLS does
-- not need to permit anon inserts, but a permissive INSERT policy is harmless
-- and keeps options open. Public form goes through a Route Handler that uses
-- adminClient anyway.)
DROP POLICY IF EXISTS "Anyone can submit enquiries" ON booking_enquiries;
CREATE POLICY "Anyone can submit enquiries" ON booking_enquiries
  FOR INSERT
  WITH CHECK (true);

-- SELECT: only admin + staff (Director sees all; Head Coach can triage division enquiries).
DROP POLICY IF EXISTS "Admin and staff read enquiries" ON booking_enquiries;
CREATE POLICY "Admin and staff read enquiries" ON booking_enquiries
  FOR SELECT
  USING (auth_role() IN ('admin', 'staff'));

-- UPDATE: only admin can update status/notes.
DROP POLICY IF EXISTS "Admin updates enquiries" ON booking_enquiries;
CREATE POLICY "Admin updates enquiries" ON booking_enquiries
  FOR UPDATE
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');
