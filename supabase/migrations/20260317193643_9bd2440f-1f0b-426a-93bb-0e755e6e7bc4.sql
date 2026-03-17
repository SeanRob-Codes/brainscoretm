
-- Fix: Change public_profiles view to SECURITY INVOKER (default for views in PG15+, but explicit is safer)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles WITH (security_invoker = true) AS
  SELECT id, user_id, username, display_name, avatar_url, selected_outfit, brain_score, peak_score
  FROM public.profiles;
