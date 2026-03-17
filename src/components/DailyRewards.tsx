import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import { Gift, Flame, Check, Star } from 'lucide-react';

const STREAK_REWARDS = [
  { day: 1, points: 10, label: 'Day 1' },
  { day: 2, points: 15, label: 'Day 2' },
  { day: 3, points: 25, label: 'Day 3' },
  { day: 4, points: 30, label: 'Day 4' },
  { day: 5, points: 40, label: 'Day 5' },
  { day: 6, points: 50, label: 'Day 6' },
  { day: 7, points: 100, label: 'Day 7 🔥' },
];

export function DailyRewards() {
  const { user } = useAuth();
  const { addGameResult } = useGameStore();
  const [claimed, setClaimed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    if (!user) return;
    checkReward();
  }, [user]);

  const checkReward = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    const { data: todayReward } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('claimed_date', today)
      .maybeSingle();

    if (todayReward) {
      setClaimed(true);
      setStreak(todayReward.streak_count);
      setPointsEarned(todayReward.points_awarded);
    } else {
      // Get yesterday's reward for streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data: yesterdayReward } = await supabase
        .from('daily_rewards')
        .select('streak_count')
        .eq('user_id', user.id)
        .eq('claimed_date', yesterdayStr)
        .maybeSingle();

      setStreak(yesterdayReward ? yesterdayReward.streak_count : 0);
    }
    setLoading(false);
  };

  const claimReward = async () => {
    if (!user || claimed) return;
    const newStreak = streak + 1;
    const dayIndex = ((newStreak - 1) % 7);
    const points = STREAK_REWARDS[dayIndex].points;

    const today = new Date().toISOString().split('T')[0];
    await supabase.from('daily_rewards').insert({
      user_id: user.id,
      claimed_date: today,
      streak_count: newStreak,
      points_awarded: points,
    });

    // Update profile streak
    await supabase.from('profiles').update({ login_streak: newStreak, last_login_date: today }).eq('user_id', user.id);

    // Add to game score
    addGameResult({ game: 'daily-reward', score: points, date: new Date().toISOString(), detail: `Day ${newStreak} streak bonus` });

    setClaimed(true);
    setStreak(newStreak);
    setPointsEarned(points);
  };

  if (loading) return null;

  return (
    <div className="rounded-2xl border border-accent/20 bg-gradient-to-r from-card to-accent/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-accent" />
          <span className="font-display text-xs font-bold tracking-wider">Daily Reward</span>
        </div>
        {streak > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-warning">
            <Flame className="h-3 w-3" /> {streak} day streak
          </span>
        )}
      </div>

      {/* Streak calendar */}
      <div className="flex gap-1.5">
        {STREAK_REWARDS.map((r, i) => {
          const dayInStreak = (streak % 7) || (claimed ? 7 : 0);
          const isPast = i < dayInStreak;
          const isCurrent = i === dayInStreak - 1 && claimed;
          const isNext = i === dayInStreak && !claimed;

          return (
            <div
              key={i}
              className={`flex-1 rounded-lg border py-2 text-center transition-all
                ${isCurrent ? 'gradient-accent border-accent text-accent-foreground' :
                  isPast ? 'bg-accent/10 border-accent/30 text-accent' :
                  isNext ? 'border-accent/50 bg-accent/5 text-foreground animate-pulse' :
                  'border-border bg-secondary text-muted-foreground'
                }`}
            >
              {isPast && !isCurrent ? (
                <Check className="h-3 w-3 mx-auto" />
              ) : (
                <Star className={`h-3 w-3 mx-auto ${isCurrent ? 'text-accent-foreground' : ''}`} />
              )}
              <div className="text-[8px] font-bold mt-0.5">+{r.points}</div>
            </div>
          );
        })}
      </div>

      {claimed ? (
        <div className="text-center rounded-xl bg-success/10 border border-success/30 py-2.5">
          <span className="text-xs font-bold text-success flex items-center justify-center gap-1">
            <Check className="h-3.5 w-3.5" /> Claimed +{pointsEarned} pts today!
          </span>
        </div>
      ) : (
        <button
          onClick={claimReward}
          className="w-full gradient-accent rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
        >
          <Gift className="h-3.5 w-3.5" /> Claim Day {streak + 1} Reward
        </button>
      )}
    </div>
  );
}
