-- ============================================================
-- 0011_external_events_and_coach_activated.sql
-- 1. external_events: user-added events (gym, matches, team training)
--    that sit alongside GTB bookings on the calendar.
-- 2. profiles.coach_activated_sections: list of optional PDP section
--    slugs that a coach has activated for a specific player.
-- ============================================================

-- ---- external_events --------------------------------------------------------

CREATE TABLE IF NOT EXISTS external_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  event_type  TEXT NOT NULL CHECK (event_type IN (
    'training', 'gym', 'match', 'team_training', 'recovery', 'school', 'other'
  )),
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ,
  location    TEXT,
  notes       TEXT,
  color_hex   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_external_events_user_starts
  ON external_events(user_id, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_external_events_starts
  ON external_events(starts_at);

ALTER TABLE external_events ENABLE ROW LEVEL SECURITY;

-- Owner: CRUD their own
DROP POLICY IF EXISTS "Users manage own external events" ON external_events;
CREATE POLICY "Users manage own external events" ON external_events
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin reads all
DROP POLICY IF EXISTS "Admin reads all external events" ON external_events;
CREATE POLICY "Admin reads all external events" ON external_events
  FOR SELECT
  USING (auth_role() = 'admin');

-- Coach reads assigned players' external events
DROP POLICY IF EXISTS "Coach reads assigned external events" ON external_events;
CREATE POLICY "Coach reads assigned external events" ON external_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_assignments ca
      WHERE ca.staff_id = auth.uid()
        AND ca.client_id = external_events.user_id
        AND ca.is_active
    )
  );

-- Parent reads linked child's external events
DROP POLICY IF EXISTS "Parent reads child external events" ON external_events;
CREATE POLICY "Parent reads child external events" ON external_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles c
      WHERE c.id = external_events.user_id
        AND c.parent_guardian_id = auth.uid()
    )
  );

-- ---- profiles.coach_activated_sections -------------------------------------

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS coach_activated_sections TEXT[] NOT NULL DEFAULT '{}';

-- Section slugs we know about (informational — not enforced by CHECK because
-- section names may evolve. Validation happens at app layer.)
COMMENT ON COLUMN profiles.coach_activated_sections IS
  'Optional PDP section slugs coach has activated for this player. Allowed: sc, mentorship, kpis, performance, match, technical, game-intelligence, feedback';
