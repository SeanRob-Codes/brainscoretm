
-- 1v1 Challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL,
  opponent_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  challenger_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  winner_id UUID,
  game_type TEXT NOT NULL DEFAULT 'logic',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their challenges"
  ON public.challenges FOR SELECT TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can create challenges"
  ON public.challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Participants can update challenges"
  ON public.challenges FOR UPDATE TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- Weekly leagues table
CREATE TABLE public.weekly_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  league TEXT NOT NULL DEFAULT 'bronze',
  week_start DATE NOT NULL DEFAULT (date_trunc('week', CURRENT_DATE)::date),
  weekly_score INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leagues"
  ON public.weekly_leagues FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own league"
  ON public.weekly_leagues FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own league"
  ON public.weekly_leagues FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Boss challenges table  
CREATE TABLE public.boss_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL DEFAULT (date_trunc('week', CURRENT_DATE)::date),
  score INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.boss_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boss challenges"
  ON public.boss_challenges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own boss challenge"
  ON public.boss_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own boss challenge"
  ON public.boss_challenges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for challenges
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
