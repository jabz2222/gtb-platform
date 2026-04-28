-- ============================================================
-- 0007_brief_foundations.sql
-- Foundational schema additions for the Brief (GTB-WEB-001 v1.0).
-- Most division tagging already exists via division_id FKs and the
-- user_divisions / staff_divisions junction tables. This migration
-- adds only what's missing:
--   1. Extend division_type enum with 'mentoring' and 'education'.
--   2. Seed the missing divisions (Mentoring, Education) so the app
--      can reference them by slug.
--   3. Add division_id to badge_definitions for Brief §4.5/§3.2.
--   4. Add cross_division_addons + age_phase + head_coach_for_division_id
--      to profiles for Brief §3.2 Step 3 (Football cross-division
--      add-ons), Brief Phase 7 (PDP per age), and Brief §3.2 Step 4
--      (Head Coach division-wide access tier).
-- ============================================================

-- 1. Enum extension. ALTER TYPE ... ADD VALUE supports IF NOT EXISTS.
ALTER TYPE division_type ADD VALUE IF NOT EXISTS 'mentoring';
ALTER TYPE division_type ADD VALUE IF NOT EXISTS 'education';
