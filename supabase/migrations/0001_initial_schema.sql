-- =============================================================================
-- GTB PLAYER DEVELOPMENT PLATFORM — SUPABASE MIGRATION
-- Migration: 0001_initial_schema
-- Platform: UK-based | Currency: GBP pence | Timezone: Europe/London
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'staff', 'mentor', 'educator', 'client', 'minor');
CREATE TYPE division_type AS ENUM ('football', 'fitness', 'sports');
CREATE TYPE booking_type AS ENUM ('contracted', 'one_on_one', 'group_public', 'group_private');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE content_type AS ENUM ('video', 'document', 'live_session');
CREATE TYPE credit_tx_type AS ENUM ('deposit', 'booking_payment', 'refund_full', 'refund_partial', 'manual_adjustment', 'bonus');
CREATE TYPE cancellation_reason AS ENUM ('client_notice', 'client_breach', 'staff_cancelled', 'no_show');

-- =============================================================================
-- PROFILES
-- Extends auth.users — 1:1 relationship
-- =============================================================================

CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL,
  full_name           TEXT,
  avatar_url          TEXT,
  role                user_role NOT NULL DEFAULT 'client',
  phone               TEXT,
  date_of_birth       DATE,
  parent_guardian_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tier_id             UUID, -- FK added after tiers table
  credit_balance_p    INTEGER NOT NULL DEFAULT 0 CHECK (credit_balance_p >= 0), -- in pence
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_parent ON profiles(parent_guardian_id);

-- =============================================================================
-- TIERS
-- Personalised per client, admin-assigned
-- =============================================================================

CREATE TABLE tiers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  features    JSONB NOT NULL DEFAULT '{}', -- flexible feature flags per tier
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Back-reference from profiles to tiers
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_tier
  FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE SET NULL;

-- =============================================================================
-- DIVISIONS
-- Football, Fitness, Sports — static seed data but stored as table for flexibility
-- =============================================================================

CREATE TABLE divisions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        division_type NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  color_hex   TEXT NOT NULL,
  tagline     TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Junction: user enrolled in divisions (clients/minors)
CREATE TABLE user_divisions (
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, division_id)
);

-- Junction: staff/mentor/educator assigned to divisions (cross-division = appears in multiple)
CREATE TABLE staff_divisions (
  staff_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (staff_id, division_id)
);

-- =============================================================================
-- STAFF AVAILABILITY
-- Staff set their own recurring slots and specific-date overrides
-- =============================================================================

CREATE TABLE staff_availability (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Recurring weekly slot
  day_of_week     SMALLINT CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time      TIME,
  end_time        TIME,
  -- One-off specific slot (overrides weekly if set)
  specific_date   DATE,
  specific_start  TIMESTAMPTZ,
  specific_end    TIMESTAMPTZ,
  buffer_mins     SMALLINT NOT NULL DEFAULT 15,
  max_clients     SMALLINT NOT NULL DEFAULT 1,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_slot_type CHECK (
    (day_of_week IS NOT NULL AND start_time IS NOT NULL AND end_time IS NOT NULL)
    OR
    (specific_date IS NOT NULL AND specific_start IS NOT NULL AND specific_end IS NOT NULL)
  )
);

CREATE INDEX idx_availability_staff ON staff_availability(staff_id, is_active);

-- =============================================================================
-- BOOKINGS
-- =============================================================================

CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  staff_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  division_id     UUID REFERENCES divisions(id) ON DELETE SET NULL,
  booking_type    booking_type NOT NULL,
  status          booking_status NOT NULL DEFAULT 'pending',
  -- Timing
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  duration_mins   SMALLINT NOT NULL,
  -- Financials (all in pence)
  deposit_p       INTEGER NOT NULL DEFAULT 0,
  total_cost_p    INTEGER NOT NULL DEFAULT 0,
  credits_used_p  INTEGER NOT NULL DEFAULT 0,
  -- Contract details (for contracted type)
  contract_weeks  SMALLINT,
  contract_notes  TEXT,
  -- Group class link
  group_class_id  UUID, -- FK added after group_classes table
  -- Meta
  notes           TEXT,
  cancelled_at    TIMESTAMPTZ,
  cancellation_reason cancellation_reason,
  no_show_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT chk_times CHECK (ends_at > starts_at)
);

CREATE INDEX idx_bookings_client ON bookings(client_id, status);
CREATE INDEX idx_bookings_staff  ON bookings(staff_id, starts_at);
CREATE INDEX idx_bookings_date   ON bookings(starts_at);

-- =============================================================================
-- GROUP CLASSES
-- Public (visible to all) or Private (invite-only)
-- =============================================================================

CREATE TABLE group_classes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  instructor_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  division_id     UUID REFERENCES divisions(id) ON DELETE SET NULL,
  is_public       BOOLEAN NOT NULL DEFAULT TRUE,
  max_participants SMALLINT NOT NULL DEFAULT 20,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  location        TEXT,
  cost_p          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Back-reference bookings → group_classes
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_group_class
  FOREIGN KEY (group_class_id) REFERENCES group_classes(id) ON DELETE SET NULL;

-- Private class invites
CREATE TABLE group_class_invites (
  class_id    UUID NOT NULL REFERENCES group_classes(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted    BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (class_id, client_id)
);

-- =============================================================================
-- CREDIT LEDGER
-- Append-only — never update, always insert new rows for audit trail
-- =============================================================================

CREATE TABLE credit_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  tx_type         credit_tx_type NOT NULL,
  amount_p        INTEGER NOT NULL, -- positive = credit, negative = debit
  balance_after_p INTEGER NOT NULL, -- snapshot of balance after this tx
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  description     TEXT,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_tx_user ON credit_transactions(user_id, created_at DESC);

-- =============================================================================
-- PLAYER DEVELOPMENT PROFILE (PDP)
-- =============================================================================

-- Goals
CREATE TABLE goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  set_by_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'general', -- football, fitness, education, life, mental
  target_value    NUMERIC,
  current_value   NUMERIC NOT NULL DEFAULT 0,
  unit            TEXT,
  target_date     DATE,
  completed_at    TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goals_player ON goals(player_id, is_active);

-- Goal progress log
CREATE TABLE goal_progress_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id     UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  value       NUMERIC NOT NULL,
  note        TEXT,
  logged_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KPIs & Performance Metrics (flexible JSONB per division)
CREATE TABLE performance_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
  recorded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  metrics     JSONB NOT NULL DEFAULT '{}',
  -- Example metrics structure:
  -- football: { "technique": 8, "decision_making": 7, "drive": 9, "delivery": 6, "durability": 8 }
  -- fitness:  { "strength": 7, "conditioning": 8, "movement": 9, "consistency": 7 }
  notes       TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_perf_player ON performance_entries(player_id, recorded_at DESC);

-- =============================================================================
-- EDUCATION CONTENT
-- =============================================================================

CREATE TABLE education_content (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  content_type    content_type NOT NULL,
  division_id     UUID REFERENCES divisions(id) ON DELETE SET NULL, -- NULL = cross-division
  url             TEXT,
  duration_mins   SMALLINT,
  is_free         BOOLEAN NOT NULL DEFAULT FALSE, -- available to all tiers
  order_index     INTEGER NOT NULL DEFAULT 0,
  published_at    TIMESTAMPTZ,
  created_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_content_division ON education_content(division_id, published_at);

-- Tier access to content (for non-free content)
CREATE TABLE content_tier_access (
  content_id  UUID NOT NULL REFERENCES education_content(id) ON DELETE CASCADE,
  tier_id     UUID NOT NULL REFERENCES tiers(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tier_id)
);

-- Education progress tracking
CREATE TABLE education_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id      UUID NOT NULL REFERENCES education_content(id) ON DELETE CASCADE,
  progress_pct    SMALLINT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  completed_at    TIMESTAMPTZ,
  last_accessed   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_id)
);

CREATE INDEX idx_edu_progress_user ON education_progress(user_id);

-- =============================================================================
-- MENTOR / STAFF ASSIGNMENTS
-- Controls which staff/mentors can access which client PDPs
-- =============================================================================

CREATE TABLE client_assignments (
  staff_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (staff_id, client_id)
);

-- =============================================================================
-- TRIGGERS — auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tiers_updated_at        BEFORE UPDATE ON tiers        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at     BEFORE UPDATE ON bookings      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_goals_updated_at        BEFORE UPDATE ON goals         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_content_updated_at      BEFORE UPDATE ON education_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_group_classes_updated   BEFORE UPDATE ON group_classes  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RPC: Atomic credit deduction (prevents race conditions)
-- =============================================================================

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id     UUID,
  p_amount_p    INTEGER,
  p_description TEXT,
  p_booking_id  UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT credit_balance_p INTO v_balance
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF v_balance < p_amount_p THEN
    RAISE EXCEPTION 'Insufficient credits: balance % pence, required % pence', v_balance, p_amount_p;
  END IF;

  UPDATE profiles SET credit_balance_p = credit_balance_p - p_amount_p WHERE id = p_user_id;

  INSERT INTO credit_transactions (user_id, tx_type, amount_p, balance_after_p, booking_id, description)
  VALUES (p_user_id, 'booking_payment', -p_amount_p, v_balance - p_amount_p, p_booking_id, p_description);

  RETURN v_balance - p_amount_p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_credits(
  p_user_id     UUID,
  p_amount_p    INTEGER,
  p_tx_type     credit_tx_type,
  p_description TEXT,
  p_booking_id  UUID DEFAULT NULL,
  p_created_by  UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  UPDATE profiles SET credit_balance_p = credit_balance_p + p_amount_p
  WHERE id = p_user_id
  RETURNING credit_balance_p INTO v_balance;

  INSERT INTO credit_transactions (user_id, tx_type, amount_p, balance_after_p, booking_id, description, created_by)
  VALUES (p_user_id, p_tx_type, p_amount_p, v_balance, p_booking_id, p_description, p_created_by);

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_divisions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_divisions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_classes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_class_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_content  ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tier_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_assignments ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: is admin or staff
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
  SELECT auth_role() IN ('admin', 'staff')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- PROFILES RLS
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (
  id = auth.uid()
  OR auth_role() IN ('admin', 'staff', 'mentor')
  OR (parent_guardian_id = auth.uid()) -- parent can see their minor's profile
);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- DIVISIONS: everyone can read
CREATE POLICY "divisions_select_all" ON divisions FOR SELECT USING (TRUE);
CREATE POLICY "divisions_manage_admin" ON divisions FOR ALL USING (auth_role() = 'admin');

-- TIERS: clients see their own, admin sees all
CREATE POLICY "tiers_select" ON tiers FOR SELECT USING (
  auth_role() = 'admin'
  OR id = (SELECT tier_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "tiers_manage_admin" ON tiers FOR ALL USING (auth_role() = 'admin');

-- BOOKINGS: own bookings + staff + admin
CREATE POLICY "bookings_select" ON bookings FOR SELECT USING (
  client_id = auth.uid()
  OR staff_id = auth.uid()
  OR auth_role() IN ('admin', 'staff')
);
CREATE POLICY "bookings_insert_client" ON bookings FOR INSERT WITH CHECK (
  client_id = auth.uid() OR auth_role() IN ('admin', 'staff')
);
CREATE POLICY "bookings_update" ON bookings FOR UPDATE USING (
  client_id = auth.uid() OR staff_id = auth.uid() OR auth_role() IN ('admin', 'staff')
);

-- GROUP CLASSES: public visible to all authenticated; private only to invited/staff
CREATE POLICY "group_classes_select" ON group_classes FOR SELECT USING (
  is_public = TRUE
  OR auth_role() IN ('admin', 'staff')
  OR id IN (SELECT class_id FROM group_class_invites WHERE client_id = auth.uid())
);
CREATE POLICY "group_classes_manage" ON group_classes FOR ALL USING (auth_role() IN ('admin', 'staff'));

-- CREDITS: own transactions only + admin
CREATE POLICY "credits_select" ON credit_transactions FOR SELECT USING (
  user_id = auth.uid() OR auth_role() = 'admin'
);

-- GOALS: player or their assigned staff
CREATE POLICY "goals_select" ON goals FOR SELECT USING (
  player_id = auth.uid()
  OR auth_role() IN ('admin', 'staff', 'mentor')
  OR EXISTS (SELECT 1 FROM client_assignments ca WHERE ca.staff_id = auth.uid() AND ca.client_id = goals.player_id)
);
CREATE POLICY "goals_insert" ON goals FOR INSERT WITH CHECK (
  player_id = auth.uid() OR auth_role() IN ('admin', 'staff', 'mentor')
);
CREATE POLICY "goals_update" ON goals FOR UPDATE USING (
  player_id = auth.uid() OR auth_role() IN ('admin', 'staff', 'mentor')
);

-- PERFORMANCE: own + assigned staff + admin
CREATE POLICY "perf_select" ON performance_entries FOR SELECT USING (
  player_id = auth.uid()
  OR auth_role() IN ('admin', 'staff', 'mentor')
  OR EXISTS (SELECT 1 FROM client_assignments ca WHERE ca.staff_id = auth.uid() AND ca.client_id = performance_entries.player_id)
);
CREATE POLICY "perf_insert" ON performance_entries FOR INSERT WITH CHECK (
  auth_role() IN ('admin', 'staff', 'mentor')
);

-- EDUCATION CONTENT: tier-gated access
CREATE POLICY "content_select" ON education_content FOR SELECT USING (
  deleted_at IS NULL
  AND published_at IS NOT NULL
  AND (
    is_free = TRUE
    OR auth_role() = 'admin'
    OR auth_role() IN ('staff', 'mentor', 'educator')
    OR EXISTS (
      SELECT 1 FROM content_tier_access cta
      JOIN profiles p ON p.tier_id = cta.tier_id
      WHERE cta.content_id = education_content.id AND p.id = auth.uid()
    )
  )
);
CREATE POLICY "content_manage" ON education_content FOR ALL USING (auth_role() IN ('admin', 'educator'));

-- EDUCATION PROGRESS: own + assigned staff + admin
CREATE POLICY "edu_progress_select" ON education_progress FOR SELECT USING (
  user_id = auth.uid() OR auth_role() IN ('admin', 'staff', 'educator')
);
CREATE POLICY "edu_progress_upsert" ON education_progress FOR ALL USING (
  user_id = auth.uid() OR auth_role() IN ('admin', 'staff')
);

-- STAFF AVAILABILITY: everyone can read (to book); only owner/admin can write
CREATE POLICY "availability_select" ON staff_availability FOR SELECT USING (TRUE);
CREATE POLICY "availability_write" ON staff_availability FOR ALL USING (
  staff_id = auth.uid() OR auth_role() = 'admin'
);

-- CLIENT ASSIGNMENTS: staff/admin only
CREATE POLICY "assignments_select" ON client_assignments FOR SELECT USING (
  staff_id = auth.uid() OR client_id = auth.uid() OR auth_role() = 'admin'
);
CREATE POLICY "assignments_manage" ON client_assignments FOR ALL USING (auth_role() IN ('admin', 'staff'));

-- =============================================================================
-- SEED: Division data
-- =============================================================================

INSERT INTO divisions (slug, name, color_hex, tagline, description) VALUES
  ('football', 'GTB Football', '#5BB8E8', 'Develop the Player. Build the Person.', 'Technical football coaching from U5 to U15+'),
  ('fitness',  'GTB Fitness',  '#2E8B35', 'Stronger Body. Stronger Mind.', 'Youth strength & conditioning, ages 8–18'),
  ('sports',   'GTB Sports',   '#E8641A', 'Every Sport. One Standard.', 'Multi-sport participation and skills development');

-- =============================================================================
-- SEED: Default tiers
-- =============================================================================

INSERT INTO tiers (name, description, features) VALUES
  ('Free',     'Basic access — all clients start here', '{"education_free": true}'),
  ('Bronze',   'Entry tier with core session access',   '{"education_free": true, "bookings_monthly": 4}'),
  ('Silver',   'Intermediate tier',                     '{"education_free": true, "bookings_monthly": 8, "pdp_detailed": true}'),
  ('Gold',     'Premium full-access tier',              '{"education_free": true, "bookings_monthly": -1, "pdp_detailed": true, "priority_booking": true}');
