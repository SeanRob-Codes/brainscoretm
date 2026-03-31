import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import { BarChart3, Gamepad2, TrendingUp, Trophy, Calendar } from 'lucide-react';

export function LifetimeProgress() {
  const { user } = useAuth();
  const { peakScore, gauntletHighScore } = useGameStore();
  const [totalGames, setTotalGames] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [totalImprovement, setTotalImprovement] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user) return;

    const { data: history } = await supabase
      .from('score_history')
      .select('brain_score, games_played, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (history && history.length > 0) {
      const games = history.reduce((sum, h) => sum + h.games_played, 0);
      setTotalGames(games);
      setTotalDays(history.length);
      setAvgScore(Math.round(history.reduce((sum, h) => sum + h.brain_score, 0) / history.length));

      const first = history[0].brain_score;
      const last = history[history.length - 1].brain_score;
      setTotalImprovement(last - first);
    }

    const { data: tests } = await supabase
      .from('daily_brain_tests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
  };

  const stats = [
    { icon: Gamepad2, label: 'Total Games', value: totalGames || '—', color: 'text-accent' },
    { icon: Calendar, label: 'Days Active', value: totalDays || '—', color: 'text-success' },
    { icon: TrendingUp, label: 'Total Improvement', value: totalImprovement > 0 ? `+${totalImprovement}` : totalImprovement || '—', color: totalImprovement >= 0 ? 'text-success' : 'text-destructive' },
    { icon: Trophy, label: 'Peak Score', value: peakScore, color: 'text-warning' },
    { icon: BarChart3, label: 'Avg Score', value: avgScore || '—', color: 'text-accent' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <BarChart3 className="h-3 w-3" /> Lifetime Progress
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.slice(0, 3).map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-secondary/50 p-3 text-center">
            <Icon className={`h-4 w-4 mx-auto ${color}`} />
            <span className={`font-display text-lg font-bold block mt-1 ${color}`}>{value}</span>
            <span className="text-[8px] uppercase tracking-wider text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.slice(3).map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-secondary/50 p-3 text-center">
            <Icon className={`h-4 w-4 mx-auto ${color}`} />
            <span className={`font-display text-lg font-bold block mt-1 ${color}`}>{value}</span>
            <span className="text-[8px] uppercase tracking-wider text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
