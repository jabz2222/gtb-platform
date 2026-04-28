-- ============================================================
-- 0004_pdp_rebuild.sql
-- New PDP tables + session inquiry flow
-- ============================================================

-- ---- Extend goals table ----
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS pillar TEXT CHECK (pillar IN ('technical','tactical','physical','psychological','lifestyle')),
  ADD COLUMN IF NOT EXISTS goal_term TEXT CHECK (goal_term IN ('short','long')),
  ADD COLUMN IF NOT EXISTS success_criteria TEXT;

-- ---- Player Profile extras ----
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS about_me TEXT,
  ADD COLUMN IF NOT EXISTS my_purpose TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS academy_year TEXT;

-- ---- Accountability Agreement ----
CREATE TABLE IF NOT EXISTS pdp_accountability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  commitment      TEXT NOT NULL,
  is_checked      BOOLEAN NOT NULL DEFAULT false,
  signed_by_coach TEXT,
  signed_by_parent TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pdp_accountability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players manage own accountability" ON pdp_accountability
  FOR ALL USING (player_id = auth.uid());

-- ---- Pre-Season Baselines ----
CREATE TABLE IF NOT EXISTS pdp_baselines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  season      TEXT NOT NULL DEFAULT to_char(now(), 'YYYY'),
  category    TEXT NOT NULL CHECK (category IN ('physical','psychological','technical')),
  metric_name TEXT NOT NULL,
  value       NUMERIC,
  rated_by    TEXT DEFAULT 'self' CHECK (rated_by IN ('self','coach')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pdp_baselines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players view own baselines" ON pdp_baselines
  FOR SELECT USING (player_id = auth.uid());
CREATE POLICY "Players insert own baselines" ON pdp_baselines
  FOR INSERT WITH CHECK (player_id = auth.uid());
CREATE POLICY "Staff insert baselines" ON pdp_baselines
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff','admin','mentor'))
  );

-- ---- Weekly/Phase Reflections ----
CREATE TABLE IF NOT EXISTS pdp_reflections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start   DATE NOT NULL,
  area         TEXT NOT NULL CHECK (area IN ('technical','tactical','physical','psychological','lifestyle')),
  target       TEXT,
  actions      TEXT,
  evidence     TEXT,
  challenges   TEXT,
  learnings    TEXT,
  next_step    TEXT,
  status_colour TEXT DEFAULT 'green' CHECK (status_colour IN ('blue','green','yellow','red')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pdp_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players manage own reflections" ON pdp_reflections
  FOR ALL USING (player_id = auth.uid());

-- ---- S&C Sessions ----
CREATE TABLE IF NOT EXISTS pdp_sc_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_type TEXT,
  duration_mins INTEGER,
  focus        TEXT,
  completed    BOOLEAN NOT NULL DEFAULT false,
  reflection   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pdp_sc_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players manage own sc sessions" ON pdp_sc_sessions
  FOR ALL USING (player_id = auth.uid());

-- ---- Mentor Check-ins ----
CREATE TABLE IF NOT EXISTS pdp_mentor_checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id       UUID REFERENCES profiles(id),
  checkin_date    DATE NOT NULL,
  key_topics      TEXT,
  actions_set     TEXT,
  follow_up_date  DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pdp_mentor_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players view own mentor checkins" ON pdp_mentor_checkins
  FOR SELECT USING (player_id = auth.uid());
CREATE POLICY "Mentors insert checkins" ON pdp_mentor_checkins
  FOR INSERT WITH CHECK (
    mentor_id = auth.uid() OR player_id = auth.uid()
  );

-- ---- Player-Led Reviews ----
CREATE TABLE IF NOT EXISTS pdp_player_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_date      DATE NOT NULL,
  went_well        TEXT,
  do_differently   TEXT,
  key_learning     TEXT,
  next_target      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pdp_player_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players manage own reviews" ON pdp_player_reviews
  FOR ALL USING (player_id = auth.uid());

-- ---- Habit Entries ----
CREATE TABLE IF NOT EXISTS pdp_habit_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  habit       TEXT NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, week_start, habit)
);
ALTER TABLE pdp_habit_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players manage own habits" ON pdp_habit_entries
  FOR ALL USING (player_id = auth.uid());

-- ---- Session Reflections (Training + Match) ----
CREATE TABLE IF NOT EXISTS pdp_session_reflections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date    DATE NOT NULL,
  reflection_type TEXT NOT NULL CHECK (reflection_type IN ('training','match','technical')),
  area            TEXT NOT NULL,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pdp_session_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players manage own session reflections" ON pdp_session_reflections
  FOR ALL USING (player_id = auth.uid());

-- ---- Game Intelligence Log ----
CREATE TABLE IF NOT EXISTS pdp_game_intelligence (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_date       DATE NOT NULL,
  opposition      TEXT,
  formation       TEXT,
  decision_one    TEXT,
  decision_two    TEXT,
  decision_three  TEXT,
  what_worked     TEXT,
  what_didnt      TEXT,
  coach_feedback  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pdp_game_intelligence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players manage own game intelligence" ON pdp_game_intelligence
  FOR ALL USING (player_id = auth.uid());
CREATE POLICY "Coaches add feedback to game intelligence" ON pdp_game_intelligence
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff','admin','mentor'))
  );

-- ---- Feedback & Review Hub ----
CREATE TABLE IF NOT EXISTS pdp_feedback (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id         UUID REFERENCES profiles(id),
  review_date      DATE NOT NULL,
  dimension_ratings JSONB,
  coach_notes      TEXT,
  player_response  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pdp_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players view own feedback" ON pdp_feedback
  FOR SELECT USING (player_id = auth.uid());
CREATE POLICY "Coaches insert feedback" ON pdp_feedback
  FOR INSERT WITH CHECK (
    coach_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin'))
  );
CREATE POLICY "Players respond to feedback" ON pdp_feedback
  FOR UPDATE USING (player_id = auth.uid());

-- ---- Session Inquiries (request-based booking) ----
CREATE TABLE IF NOT EXISTS session_inquiries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id            UUID REFERENCES profiles(id),
  session_type        TEXT NOT NULL CHECK (session_type IN ('1on1','group','contracted')),
  requested_slot      TIMESTAMPTZ,
  class_id            UUID,
  status              TEXT NOT NULL DEFAULT 'pending_parent'
                      CHECK (status IN ('pending_parent','pending_coach','parent_approved','parent_rejected','coach_confirmed','coach_declined','cancelled')),
  parent_notified_at  TIMESTAMPTZ,
  parent_approved_at  TIMESTAMPTZ,
  player_notes        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE session_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players view own inquiries" ON session_inquiries
  FOR SELECT USING (player_id = auth.uid());
CREATE POLICY "Players create inquiries" ON session_inquiries
  FOR INSERT WITH CHECK (player_id = auth.uid());
CREATE POLICY "Players cancel own inquiries" ON session_inquiries
  FOR UPDATE USING (player_id = auth.uid() AND status = 'pending_parent');
CREATE POLICY "Coaches view inquiries for them" ON session_inquiries
  FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Coaches update inquiry status" ON session_inquiries
  FOR UPDATE USING (coach_id = auth.uid());
CREATE POLICY "Admins full access inquiries" ON session_inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
