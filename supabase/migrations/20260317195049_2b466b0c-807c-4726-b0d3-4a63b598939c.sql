
-- Fix security definer view - use security_invoker instead
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles WITH (security_invoker = true) AS
  SELECT id, user_id, username, display_name, avatar_url, brain_score, peak_score, selected_outfit, login_streak
  FROM public.profiles;

-- Add a policy allowing anyone to see public profile data for leaderboard
CREATE POLICY "Anyone can view public profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
