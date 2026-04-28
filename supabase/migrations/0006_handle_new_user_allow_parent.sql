-- ============================================================
-- 0006_handle_new_user_allow_parent.sql
-- Updates the handle_new_user trigger to allow 'parent' role.
-- Without this, the existing CASE-based role allowlist silently
-- coerces parent self-signups to 'client', defeating the purpose of
-- migration 0005 (adding 'parent' to the enum).
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('admin','staff','mentor','educator','client','minor','parent')
      THEN (NEW.raw_user_meta_data->>'role')::public.user_role
      ELSE 'client'::public.user_role
    END
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
