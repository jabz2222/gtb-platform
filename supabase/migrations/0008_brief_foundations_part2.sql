-- ============================================================
-- 0008_brief_foundations_part2.sql
-- Continuation of 0007. Must be a separate migration because
-- ALTER TYPE ... ADD VALUE requires a prior commit before the
-- new enum value can be used in DML.
--
-- Adds:
--   1. Division rows for Mentoring and Education (Brief §3.2 / §8).
--   2. division_id on badge_definitions (Brief §4.5 — badges scoped
--      to division × age group).
--   3. cross_division_addons text[] on profiles (Brief §3.2 Step 3
--      cross-division access exception for Football clients only).
--   4. age_phase column on profiles (Brief Phase 7 — drives which
--      PDP template is rendered).
--   5. head_coach_for_division_id uuid on profiles (Brief §3.2 Step 4
--      "Head Coaches / Department Leads may be granted broader access
--      within their division only").
-- ============================================================

-- Seed Mentoring + Education divisions if not already present.
INSERT INTO divisions (slug, name, color_hex, tagline, description, is_active)
VALUES
  ('mentoring', 'GTB Mentoring', '#9B2454',
   '4-Phase Mentoring Architecture',
   'GTB''s mentoring division. Reflect, Explore, Action, Sustain — building autonomous, self-regulating individuals.',
   true),
  ('education', 'GTB Education', '#CC2222',
   'Universal Learning Curriculum',
   'GTB''s education division. Weekly age-appropriate topics covering performance psychology, holistic development, and life skills.',
   true)
ON CONFLICT (slug) DO NOTHING;

-- Add division_id to badge_definitions; nullable because some badges are cross-division.
ALTER TABLE badge_definitions
  ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES divisions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_badge_definitions_division ON badge_definitions(division_id);

-- Cross-division add-ons for Football clients (Brief §3.2 Step 3).
-- Allowed values: 'MENTORING' (Football-aligned mentoring) and 'ATHLETIC_DEV' (Football-aligned S&C).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cross_division_addons TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_cross_division_addons_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_cross_division_addons_check
  CHECK (cross_division_addons <@ ARRAY['MENTORING','ATHLETIC_DEV']::text[]);

-- Age phase column on profiles (Brief Phase 7).
-- Derived from date_of_birth at app level; cached on profile so PDP renderer can read it cheaply.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age_phase TEXT;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_age_phase_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_age_phase_check
  CHECK (age_phase IS NULL OR age_phase IN ('early_years','pre_academy','foundation','youth','pro'));

CREATE INDEX IF NOT EXISTS idx_profiles_age_phase ON profiles(age_phase);

-- Head Coach / Department Lead division-wide access (Brief §3.2 Step 4).
-- A staff member with this set sees all participants in that division, not just their own assignments.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS head_coach_for_division_id UUID REFERENCES divisions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_head_coach_division ON profiles(head_coach_for_division_id)
  WHERE head_coach_for_division_id IS NOT NULL;
