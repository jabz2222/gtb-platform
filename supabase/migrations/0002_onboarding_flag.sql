-- Add onboarding_form_sent flag to profiles
-- This tracks whether the client has been shown the post-first-booking onboarding Google Form

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_form_sent boolean NOT NULL DEFAULT false;
