-- ============================================================
-- 0005_add_parent_role.sql
-- Adds 'parent' to the user_role enum.
-- Required so RegisterForm can set role='parent' for parent self-signups
-- and the handle_new_user trigger can cast 'parent' from raw_user_meta_data
-- without throwing.
-- ============================================================

-- Postgres requires ALTER TYPE ... ADD VALUE outside a transaction in older
-- versions. Supabase migrations are wrapped in a transaction by default, but
-- IF NOT EXISTS is supported and safe for re-runs.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent';
