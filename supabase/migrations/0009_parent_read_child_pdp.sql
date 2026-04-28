-- ============================================================
-- 0009_parent_read_child_pdp.sql
-- Allow parents to SELECT their linked child's pdp_reflections
-- and performance_entries (read-only).
-- The parent portal renders these in /parent/[childId]/pdp.
-- The wider division-aware RLS pass (Brief §3.2) is migration 0010.
-- ============================================================

-- pdp_reflections: parents can read their linked child's reflections.
DROP POLICY IF EXISTS "Parents read linked child reflections" ON pdp_reflections;
CREATE POLICY "Parents read linked child reflections" ON pdp_reflections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles c
      WHERE c.id = pdp_reflections.player_id
        AND c.parent_guardian_id = auth.uid()
    )
  );

-- pdp_reflections: coaches can read reflections for their assigned players.
DROP POLICY IF EXISTS "Coaches read assigned player reflections" ON pdp_reflections;
CREATE POLICY "Coaches read assigned player reflections" ON pdp_reflections
  FOR SELECT
  USING (
    auth_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM client_assignments ca
      WHERE ca.staff_id = auth.uid()
        AND ca.client_id = pdp_reflections.player_id
        AND ca.is_active
    )
  );

-- performance_entries already has SELECT permitting parents indirectly via
-- auth_role checks, but extend to include parent_guardian_id explicitly.
DROP POLICY IF EXISTS "Parents read linked child performance" ON performance_entries;
CREATE POLICY "Parents read linked child performance" ON performance_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles c
      WHERE c.id = performance_entries.player_id
        AND c.parent_guardian_id = auth.uid()
    )
  );
