
-- Daily login rewards tracking
CREATE TABLE public.daily_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  claimed_date date NOT NULL DEFAULT CURRENT_DATE,
  streak_count integer NOT NULL DEFAULT 1,
  points_awarded integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, claimed_date)
);

ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards" ON public.daily_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rewards" ON public.daily_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Question of the day responses
CREATE TABLE public.qotd_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_date date NOT NULL DEFAULT CURRENT_DATE,
  was_correct boolean NOT NULL DEFAULT false,
  points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_date)
);

ALTER TABLE public.qotd_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own qotd" ON public.qotd_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own qotd" ON public.qotd_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add selected_subject to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selected_subject text NOT NULL DEFAULT 'general';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_streak integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_date date;

-- Make public_profiles view include new fields
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
  SELECT id, user_id, username, display_name, avatar_url, brain_score, peak_score, selected_outfit, login_streak
  FROM public.profiles;

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
