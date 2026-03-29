-- Add onboarding fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sleep_hours text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS user_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}';

-- Track daily brain test completions
CREATE TABLE IF NOT EXISTS public.daily_brain_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  test_date date NOT NULL DEFAULT CURRENT_DATE,
  score integer NOT NULL DEFAULT 0,
  challenges_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, test_date)
);

ALTER TABLE public.daily_brain_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own tests" ON public.daily_brain_tests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tests" ON public.daily_brain_tests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);