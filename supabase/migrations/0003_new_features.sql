-- =============================================================================
-- GTB Platform — Migration 0003
-- New features from document analysis:
--   Stream A: Player gamification + Five Intelligences PDP
--   Stream B: Coach Development Portfolio (CDP)
--   Stream C: Coach Education LMS (programmes, modules, submissions)
-- =============================================================================

-- =============================================================================
-- STREAM A — GAMIFICATION
-- =============================================================================

CREATE TABLE badge_definitions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,           -- e.g. 'first_session', 'level1_certified'
  name          TEXT NOT NULL,
  description   TEXT,
  icon_emoji    TEXT NOT NULL DEFAULT '🏅',
  category      TEXT NOT NULL DEFAULT 'general', -- 'session', 'education', 'goal', 'coach'
  points_value  INTEGER NOT NULL DEFAULT 0,      -- bonus points awarded with badge
  auto_award    BOOLEAN NOT NULL DEFAULT TRUE,   -- if false, admin must manually award
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE awarded_badges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id      UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  awarded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  awarded_by    UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL = auto-awarded
  context       TEXT,  -- e.g. 'Completed Level 1 Phase 1'
  UNIQUE (user_id, badge_id)
);

CREATE TABLE player_points (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points        INTEGER NOT NULL,               -- positive = earned, negative = deducted
  reason        TEXT NOT NULL,                  -- 'session_attended', 'goal_completed', etc.
  ref_type      TEXT,                           -- 'booking', 'goal', 'module', etc.
  ref_id        UUID,                           -- FK to the originating record
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_player_points_user ON player_points(user_id);

-- Convenience view: total points per user
CREATE VIEW player_points_totals AS
  SELECT user_id, SUM(points) AS total_points
  FROM player_points
  GROUP BY user_id;

-- Five Intelligences self-assessment (Physical, Technical, Tactical, Social, Psychological)
CREATE TABLE five_intelligences_scores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessed_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Scored 1–10
  physical        SMALLINT NOT NULL CHECK (physical BETWEEN 1 AND 10),
  technical       SMALLINT NOT NULL CHECK (technical BETWEEN 1 AND 10),
  tactical        SMALLINT NOT NULL CHECK (tactical BETWEEN 1 AND 10),
  social          SMALLINT NOT NULL CHECK (social BETWEEN 1 AND 10),
  psychological   SMALLINT NOT NULL CHECK (psychological BETWEEN 1 AND 10),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_five_intel_user ON five_intelligences_scores(user_id, assessed_at DESC);

-- =============================================================================
-- STREAM B — COACH DEVELOPMENT PORTFOLIO (CDP)
-- =============================================================================

-- Baseline assessment (once per coach, re-taken periodically)
CREATE TABLE coach_baselines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessed_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Five Intelligences baseline
  physical        SMALLINT NOT NULL CHECK (physical BETWEEN 1 AND 10),
  technical       SMALLINT NOT NULL CHECK (technical BETWEEN 1 AND 10),
  tactical        SMALLINT NOT NULL CHECK (tactical BETWEEN 1 AND 10),
  social          SMALLINT NOT NULL CHECK (social BETWEEN 1 AND 10),
  psychological   SMALLINT NOT NULL CHECK (psychological BETWEEN 1 AND 10),
  -- 4D baseline (Depth, Delivery, Direction, Development) 1–10
  depth           SMALLINT NOT NULL CHECK (depth BETWEEN 1 AND 10),
  delivery        SMALLINT NOT NULL CHECK (delivery BETWEEN 1 AND 10),
  direction       SMALLINT NOT NULL CHECK (direction BETWEEN 1 AND 10),
  development     SMALLINT NOT NULL CHECK (development BETWEEN 1 AND 10),
  narrative       TEXT,  -- coach's own description of their current position
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coach_baselines_coach ON coach_baselines(coach_id, assessed_at DESC);

-- Weekly session planning
CREATE TABLE coach_weekly_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,                -- Monday of the week
  intended_focus  TEXT,
  coaching_behaviours TEXT,
  practice_design TEXT,
  equipment_notes TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id, week_start)
);

CREATE INDEX idx_weekly_plans_coach ON coach_weekly_plans(coach_id, week_start DESC);

-- Weekly reflection (separate from plan so it can be completed post-week)
CREATE TABLE coach_reflections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  -- Five Intelligences self-score this week
  physical        SMALLINT CHECK (physical BETWEEN 1 AND 10),
  technical       SMALLINT CHECK (technical BETWEEN 1 AND 10),
  tactical        SMALLINT CHECK (tactical BETWEEN 1 AND 10),
  social          SMALLINT CHECK (social BETWEEN 1 AND 10),
  psychological   SMALLINT CHECK (psychological BETWEEN 1 AND 10),
  -- 4D KPI self-scores this week
  depth_score     SMALLINT CHECK (depth_score BETWEEN 1 AND 10),
  delivery_score  SMALLINT CHECK (delivery_score BETWEEN 1 AND 10),
  direction_score SMALLINT CHECK (direction_score BETWEEN 1 AND 10),
  development_score SMALLINT CHECK (development_score BETWEEN 1 AND 10),
  -- Open reflection
  wins            TEXT,
  challenges      TEXT,
  key_learnings   TEXT,
  next_week_focus TEXT,
  -- RAG status
  overall_status  TEXT CHECK (overall_status IN ('exceeding','on_track','some_challenges','off_track')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id, week_start)
);

CREATE INDEX idx_reflections_coach ON coach_reflections(coach_id, week_start DESC);

-- CPD Log
CREATE TABLE cpd_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date   DATE NOT NULL,
  activity_type   TEXT NOT NULL, -- 'course', 'shadowing', 'webinar', 'workshop', 'reading', 'peer_review', 'other'
  title           TEXT NOT NULL,
  provider        TEXT,
  hours           NUMERIC(4,1) NOT NULL CHECK (hours > 0),
  description     TEXT,
  evidence_url    TEXT,          -- Supabase Storage URL to uploaded certificate / notes
  verified_by     UUID REFERENCES profiles(id) ON DELETE SET NULL, -- director who verified
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cpd_log_coach ON cpd_log(coach_id, activity_date DESC);

-- Director Check-In (4–6 week structured review)
CREATE TABLE director_checkins (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  director_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  checkin_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  -- 4D ratings by director
  depth_rating    SMALLINT CHECK (depth_rating BETWEEN 1 AND 10),
  delivery_rating SMALLINT CHECK (delivery_rating BETWEEN 1 AND 10),
  direction_rating SMALLINT CHECK (direction_rating BETWEEN 1 AND 10),
  development_rating SMALLINT CHECK (development_rating BETWEEN 1 AND 10),
  -- Overall RAG
  overall_status  TEXT CHECK (overall_status IN ('exceeding','on_track','some_challenges','off_track')),
  strengths       TEXT,
  areas_to_develop TEXT,
  targets         TEXT,          -- agreed next-cycle targets
  coach_response  TEXT,          -- coach can add their own response
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checkins_coach ON director_checkins(coach_id, checkin_date DESC);

-- Shadowing Log
CREATE TABLE shadowing_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logger_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- coach doing the shadowing
  observed_coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  shadow_date     DATE NOT NULL,
  session_type    TEXT,           -- 'training', 'match', '1on1', 'group_class'
  division_id     UUID REFERENCES divisions(id) ON DELETE SET NULL,
  observation_1   TEXT,
  observation_2   TEXT,
  observation_3   TEXT,
  personal_takeaway TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shadowing_logger ON shadowing_logs(logger_id, shadow_date DESC);

-- =============================================================================
-- STREAM C — COACH EDUCATION LMS
-- =============================================================================

CREATE TABLE education_programmes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT,
  division_id     UUID REFERENCES divisions(id) ON DELETE SET NULL, -- NULL = cross-division
  total_phases    SMALLINT NOT NULL DEFAULT 1,
  total_modules   SMALLINT NOT NULL DEFAULT 0,
  estimated_hours SMALLINT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE education_programme_modules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  programme_id    UUID NOT NULL REFERENCES education_programmes(id) ON DELETE CASCADE,
  phase           SMALLINT NOT NULL DEFAULT 1,          -- e.g. 1, 2, 3, 4
  phase_title     TEXT,                                  -- e.g. 'Foundations'
  module_order    SMALLINT NOT NULL,                    -- within the programme (global sequence)
  title           TEXT NOT NULL,
  description     TEXT,
  content_body    TEXT,                                  -- rich text / markdown module content
  reflection_prompts TEXT,                               -- newline-separated prompts
  resources       JSONB DEFAULT '[]'::jsonb,             -- [{title, url, type}]
  unlock_after_id UUID REFERENCES education_programme_modules(id) ON DELETE SET NULL, -- sequential lock
  requires_submission BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (programme_id, module_order)
);

CREATE INDEX idx_epm_programme ON education_programme_modules(programme_id, module_order);

-- Per-coach progress through a programme
CREATE TABLE programme_enrolments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  programme_id    UUID NOT NULL REFERENCES education_programmes(id) ON DELETE CASCADE,
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  certificate_url TEXT,                                  -- Supabase Storage URL when issued
  UNIQUE (user_id, programme_id)
);

CREATE INDEX idx_enrolments_user ON programme_enrolments(user_id);

-- Per-module completion + submission
CREATE TABLE module_submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id       UUID NOT NULL REFERENCES education_programme_modules(id) ON DELETE CASCADE,
  text_response   TEXT,
  file_url        TEXT,                                  -- Supabase Storage URL
  file_name       TEXT,
  submitted_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'draft'          -- 'draft','submitted','approved','rejected'
                  CHECK (status IN ('draft','submitted','approved','rejected')),
  feedback        TEXT,
  reviewed_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_id)
);

CREATE INDEX idx_submissions_user    ON module_submissions(user_id);
CREATE INDEX idx_submissions_module  ON module_submissions(module_id);
CREATE INDEX idx_submissions_status  ON module_submissions(status);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

CREATE TRIGGER trg_coach_weekly_plans_updated  BEFORE UPDATE ON coach_weekly_plans  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_coach_reflections_updated   BEFORE UPDATE ON coach_reflections    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_director_checkins_updated   BEFORE UPDATE ON director_checkins    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_edu_programmes_updated      BEFORE UPDATE ON education_programmes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_edu_modules_updated         BEFORE UPDATE ON education_programme_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_module_submissions_updated  BEFORE UPDATE ON module_submissions    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE badge_definitions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE awarded_badges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_points                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE five_intelligences_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_baselines               ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_weekly_plans            ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_reflections             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpd_log                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_checkins             ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadowing_logs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_programmes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_programme_modules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_enrolments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_submissions            ENABLE ROW LEVEL SECURITY;

-- BADGE DEFINITIONS: readable by all authenticated
CREATE POLICY "badge_defs_select" ON badge_definitions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "badge_defs_manage" ON badge_definitions FOR ALL USING (auth_role() = 'admin');

-- AWARDED BADGES: own + admin/staff
CREATE POLICY "awarded_badges_select" ON awarded_badges FOR SELECT
  USING (user_id = auth.uid() OR auth_role() IN ('admin','staff'));
CREATE POLICY "awarded_badges_insert" ON awarded_badges FOR INSERT
  WITH CHECK (auth_role() IN ('admin','staff') OR user_id = auth.uid());

-- PLAYER POINTS: own + admin
CREATE POLICY "player_points_select" ON player_points FOR SELECT
  USING (user_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "player_points_insert" ON player_points FOR INSERT
  WITH CHECK (auth_role() = 'admin');

-- FIVE INTELLIGENCES: own + coach/admin who manages them
CREATE POLICY "five_intel_select" ON five_intelligences_scores FOR SELECT
  USING (user_id = auth.uid() OR auth_role() IN ('admin','staff','mentor'));
CREATE POLICY "five_intel_insert" ON five_intelligences_scores FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth_role() = 'admin');

-- COACH BASELINES: own coach + admin
CREATE POLICY "coach_baselines_select" ON coach_baselines FOR SELECT
  USING (coach_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "coach_baselines_write" ON coach_baselines FOR ALL
  USING (coach_id = auth.uid() OR auth_role() = 'admin');

-- WEEKLY PLANS: own coach + admin
CREATE POLICY "weekly_plans_select" ON coach_weekly_plans FOR SELECT
  USING (coach_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "weekly_plans_write" ON coach_weekly_plans FOR ALL
  USING (coach_id = auth.uid() OR auth_role() = 'admin');

-- REFLECTIONS: own coach + admin
CREATE POLICY "reflections_select" ON coach_reflections FOR SELECT
  USING (coach_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "reflections_write" ON coach_reflections FOR ALL
  USING (coach_id = auth.uid() OR auth_role() = 'admin');

-- CPD LOG: own coach + admin/staff
CREATE POLICY "cpd_select" ON cpd_log FOR SELECT
  USING (coach_id = auth.uid() OR auth_role() IN ('admin','staff'));
CREATE POLICY "cpd_write" ON cpd_log FOR ALL
  USING (coach_id = auth.uid() OR auth_role() = 'admin');

-- DIRECTOR CHECKINS: own coach or the director + admin
CREATE POLICY "checkins_select" ON director_checkins FOR SELECT
  USING (coach_id = auth.uid() OR director_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "checkins_write" ON director_checkins FOR ALL
  USING (director_id = auth.uid() OR auth_role() = 'admin');

-- SHADOWING LOGS: own logger + admin
CREATE POLICY "shadowing_select" ON shadowing_logs FOR SELECT
  USING (logger_id = auth.uid() OR auth_role() IN ('admin','staff'));
CREATE POLICY "shadowing_write" ON shadowing_logs FOR ALL
  USING (logger_id = auth.uid() OR auth_role() = 'admin');

-- EDUCATION PROGRAMMES: all authenticated can read active
CREATE POLICY "edu_programmes_select" ON education_programmes FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE OR auth_role() IN ('admin','educator'));
CREATE POLICY "edu_programmes_manage" ON education_programmes FOR ALL
  USING (auth_role() IN ('admin','educator'));

-- MODULES: all authenticated (content is unlocked progressively in app logic)
CREATE POLICY "edu_modules_select" ON education_programme_modules FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "edu_modules_manage" ON education_programme_modules FOR ALL
  USING (auth_role() IN ('admin','educator'));

-- ENROLMENTS: own + admin
CREATE POLICY "enrolments_select" ON programme_enrolments FOR SELECT
  USING (user_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "enrolments_write" ON programme_enrolments FOR ALL
  USING (user_id = auth.uid() OR auth_role() = 'admin');

-- MODULE SUBMISSIONS: own + admin/educator reviewers
CREATE POLICY "submissions_select" ON module_submissions FOR SELECT
  USING (user_id = auth.uid() OR auth_role() IN ('admin','educator'));
CREATE POLICY "submissions_write" ON module_submissions FOR ALL
  USING (user_id = auth.uid() OR auth_role() IN ('admin','educator'));

-- =============================================================================
-- SEED DATA — Badge Definitions
-- =============================================================================

INSERT INTO badge_definitions (slug, name, description, icon_emoji, category, points_value, auto_award) VALUES
  ('first_session',        'First Session',         'Attended your first GTB session',                  '🎯', 'session',   50,  TRUE),
  ('five_sessions',        '5 Sessions',            'Attended 5 GTB sessions',                          '🔥', 'session',   100, TRUE),
  ('twenty_sessions',      '20 Sessions',           'Attended 20 GTB sessions — true commitment',       '💪', 'session',   250, TRUE),
  ('first_goal',           'Goal Setter',           'Set your first development goal',                  '🎯', 'goal',      25,  TRUE),
  ('goal_completed',       'Goal Achieved',         'Completed a development goal',                     '✅', 'goal',      75,  TRUE),
  ('five_goals',           '5 Goals Completed',     'Completed 5 development goals',                    '🏆', 'goal',      200, TRUE),
  ('first_module',         'First Module',          'Completed your first education module',            '📚', 'education', 50,  TRUE),
  ('phase_1_complete',     'Phase 1 Complete',      'Completed Phase 1 of a GTB programme',             '🌟', 'education', 150, TRUE),
  ('level1_certified',     'Level 1 Certified',     'Completed the GTB Coach Education Level 1',       '🎓', 'education', 500, FALSE),
  ('first_reflection',     'Reflector',             'Submitted your first weekly reflection',           '🪞', 'coach',     25,  TRUE),
  ('consistent_planner',   'Consistent Planner',    'Submitted weekly plans for 4 consecutive weeks',  '📅', 'coach',     100, FALSE),
  ('cpd_10hrs',            '10 CPD Hours',          'Logged 10 hours of CPD activity',                 '📖', 'coach',     100, TRUE),
  ('cpd_30hrs',            '30 CPD Hours',          'Logged 30 hours of CPD activity — dedicated coach','🎖', 'coach',    250, TRUE);

-- =============================================================================
-- SEED DATA — Education Programmes (Level 1 structure from document)
-- =============================================================================

INSERT INTO education_programmes (slug, title, subtitle, description, total_phases, total_modules, estimated_hours) VALUES
  (
    'gtb-coach-level-1',
    'GTB Coach Education Level 1',
    'Football Division Flagship Certification',
    'A 16-week, 85–90 hour programme structured across 4 phases. The GTB Level 1 is the entry-level qualification for all GTB Football coaches, grounding them in the organisation''s coaching philosophy, 4D Model, and Five Intelligences framework.',
    4, 20, 88
  ),
  (
    'gtb-universal-curriculum',
    'GTB Universal Coach Education Curriculum',
    'Cross-Division Coaching Framework',
    'A 51-module, 22-section curriculum applicable across all five GTB divisions. Builds the knowledge base for holistic athlete development regardless of sport or context.',
    6, 51, 120
  ),
  (
    'gtb-cpd-hub',
    'GTB CPD Hub',
    'Continuing Professional Development',
    'A growing library of short-form CPD modules for qualified GTB coaches. Covers emerging topics, reflective practice, and specialist development areas.',
    1, 0, NULL
  );

-- Level 1 Modules (20 modules across 4 phases)
WITH prog AS (SELECT id FROM education_programmes WHERE slug = 'gtb-coach-level-1')
INSERT INTO education_programme_modules (programme_id, phase, phase_title, module_order, title, description, requires_submission) VALUES
  -- Phase 1: Foundations (Modules 1–5)
  ((SELECT id FROM prog), 1, 'Foundations',                    1,  'Introduction to GTB Philosophy & Culture',     'Understanding GTB''s mission, values, "I Own My Development" ethos, and the Five Divisions ecosystem.',                                                TRUE),
  ((SELECT id FROM prog), 1, 'Foundations',                    2,  'The 4D Coaching Model',                        'Deep dive into Depth, Delivery, Direction, and Development as the four pillars of GTB coaching practice.',                                               TRUE),
  ((SELECT id FROM prog), 1, 'Foundations',                    3,  'Five Intelligences Framework',                  'Physical, Technical, Tactical, Social, and Psychological intelligences — understanding, assessing, and developing all five.',                           TRUE),
  ((SELECT id FROM prog), 1, 'Foundations',                    4,  'Self-Determination Theory in Practice',         'How autonomy, competence, and relatedness underpin GTB''s athlete-centred coaching model.',                                                            TRUE),
  ((SELECT id FROM prog), 1, 'Foundations',                    5,  'Coach Identity & Personal Philosophy',          'Articulating your coaching identity, values, and personal philosophy within the GTB framework.',                                                        TRUE),
  -- Phase 2: Modern Coaching Methods (Modules 6–10)
  ((SELECT id FROM prog), 2, 'Modern Coaching Methods',        6,  'Session Design Principles',                    'Planning effective training sessions: objectives, structure, differentiation, and progressive overload.',                                                 TRUE),
  ((SELECT id FROM prog), 2, 'Modern Coaching Methods',        7,  'Questioning & Communication',                  'Using guided discovery, powerful questions, and effective communication to unlock player thinking.',                                                      TRUE),
  ((SELECT id FROM prog), 2, 'Modern Coaching Methods',        8,  'Feedback & Behaviour Management',              'Delivering constructive feedback, managing behaviours positively, and building psychological safety.',                                                    TRUE),
  ((SELECT id FROM prog), 2, 'Modern Coaching Methods',        9,  'Observation & Analysis',                       'How to observe players and sessions with precision, identify patterns, and make informed coaching decisions.',                                            TRUE),
  ((SELECT id FROM prog), 2, 'Modern Coaching Methods',        10, 'Differentiation & Inclusion',                  'Designing sessions that meet diverse needs — ability, age, background, SEND — within a single session.',                                                 TRUE),
  -- Phase 3: Technical & Tactical Development (Modules 11–16)
  ((SELECT id FROM prog), 3, 'Technical & Tactical Development', 11, 'Technical Foundations of Football',          'Core technical skills: receiving, passing, dribbling, shooting — coaching methodology and progressions.',                                                 TRUE),
  ((SELECT id FROM prog), 3, 'Technical & Tactical Development', 12, 'Tactical Principles — Attacking',            'Principles of play in possession: penetration, width, depth, mobility, improvisation.',                                                                  TRUE),
  ((SELECT id FROM prog), 3, 'Technical & Tactical Development', 13, 'Tactical Principles — Defending',            'Principles of play out of possession: pressure, cover, balance, compactness, control/restraint.',                                                        TRUE),
  ((SELECT id FROM prog), 3, 'Technical & Tactical Development', 14, 'Small-Sided Games & Rondo Design',           'Using SSGs and rondos to create high-repetition skill environments with tactical context.',                                                               TRUE),
  ((SELECT id FROM prog), 3, 'Technical & Tactical Development', 15, 'Physical Development & Load Management',    'Age-appropriate physical development, periodisation basics, and monitoring player load.',                                                                  TRUE),
  ((SELECT id FROM prog), 3, 'Technical & Tactical Development', 16, 'Player Profiling & Individual Plans',        'Creating individual development profiles aligned to the Five Intelligences and 4D Model.',                                                                TRUE),
  -- Phase 4: Match Interpretation & Assessment (Modules 17–20)
  ((SELECT id FROM prog), 4, 'Match Interpretation & Assessment', 17, 'Match Analysis Methodology',               'Frameworks for analysing matches: moments of the game, team shape, individual contributions.',                                                             TRUE),
  ((SELECT id FROM prog), 4, 'Match Interpretation & Assessment', 18, 'Half-Time & Post-Match Coaching',           'Effective communication and adjustments at half-time; post-match review with players.',                                                                    TRUE),
  ((SELECT id FROM prog), 4, 'Match Interpretation & Assessment', 19, 'Reflective Practice & CPD',                 'Building habits of reflective practice, CPD logging, and continuous improvement as a GTB coach.',                                                         TRUE),
  ((SELECT id FROM prog), 4, 'Match Interpretation & Assessment', 20, 'Final Portfolio & Certification',           'Completing your Level 1 portfolio, final self-assessment, and peer/director review for certification.',                                                    FALSE);

-- Set sequential unlock logic (each module unlocks after the previous)
DO $$
DECLARE
  r RECORD;
  prev_id UUID := NULL;
BEGIN
  FOR r IN
    SELECT id FROM education_programme_modules
    WHERE programme_id = (SELECT id FROM education_programmes WHERE slug = 'gtb-coach-level-1')
    ORDER BY module_order ASC
  LOOP
    IF prev_id IS NOT NULL THEN
      UPDATE education_programme_modules SET unlock_after_id = prev_id WHERE id = r.id;
    END IF;
    prev_id := r.id;
  END LOOP;
END $$;
