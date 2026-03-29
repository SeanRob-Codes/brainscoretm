import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, BarChart3, Users, Minus } from 'lucide-react';

interface Insights {
  percentile: number;
  improvement: number;
  strongestSkill: string;
  weakestSkill: string;
}

const SKILL_MAP: Record<string, string> = {
  reaction: 'Reaction',
  memory: 'Memory',
  logic: 'Logic',
  color: 'Focus',
  sequence: 'Pattern Recognition',
  scramble: 'Language',
  'daily-test': 'General Knowledge',
};

export function ScoreInsights() {
  const { brainScore, gameResults, peakScore } = useGameStore();
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insights | null>(null);

  useEffect(() => {
    loadInsights();
  }, [brainScore, gameResults.length, user]);

  const loadInsights = async () => {
    // Calculate percentile from all users
    let percentile = 50;
    if (user) {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const { count: belowCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('brain_score', brainScore);
      
      if (totalUsers && totalUsers > 0) {
        percentile = Math.round(((belowCount || 0) / totalUsers) * 100);
      }
    }

    // Calculate improvement (compare to yesterday's history or last test)
    let improvement = 0;
    if (user) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { data: yesterdayTests } = await supabase
        .from('daily_brain_tests')
        .select('score')
        .eq('user_id', user.id)
        .eq('test_date', yesterday.toISOString().split('T')[0])
        .limit(1);
      
      if (yesterdayTests && yesterdayTests.length > 0) {
        const todayTotal = gameResults.reduce((sum, r) => sum + r.score, 0);
        improvement = todayTotal - yesterdayTests[0].score;
      }
    }

    // Calculate strongest and weakest skills
    const skillScores: Record<string, number[]> = {};
    gameResults.forEach(r => {
      if (!skillScores[r.game]) skillScores[r.game] = [];
      skillScores[r.game].push(r.score);
    });

    let strongestSkill = 'Play more games';
    let weakestSkill = 'Play more games';

    const avgScores = Object.entries(skillScores).map(([game, scores]) => ({
      game,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    if (avgScores.length >= 2) {
      avgScores.sort((a, b) => b.avg - a.avg);
      strongestSkill = SKILL_MAP[avgScores[0].game] || avgScores[0].game;
      weakestSkill = SKILL_MAP[avgScores[avgScores.length - 1].game] || avgScores[avgScores.length - 1].game;
    } else if (avgScores.length === 1) {
      strongestSkill = SKILL_MAP[avgScores[0].game] || avgScores[0].game;
      weakestSkill = 'Need more data';
    }

    setInsights({ percentile, improvement, strongestSkill, weakestSkill });
  };

  if (!insights) return null;

  const items = [
    {
      icon: Users,
      label: 'Ranking',
      value: `Top ${Math.max(1, 100 - insights.percentile)}% of users`,
      color: insights.percentile >= 70 ? 'text-success' : insights.percentile >= 40 ? 'text-accent' : 'text-muted-foreground',
    },
    {
      icon: insights.improvement >= 0 ? TrendingUp : TrendingDown,
      label: 'vs Yesterday',
      value: insights.improvement === 0 ? 'No data yet' : `${insights.improvement > 0 ? '+' : ''}${insights.improvement} points`,
      color: insights.improvement > 0 ? 'text-success' : insights.improvement < 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      icon: Target,
      label: 'Strongest',
      value: insights.strongestSkill,
      color: 'text-success',
    },
    {
      icon: BarChart3,
      label: 'Weakest',
      value: insights.weakestSkill,
      color: 'text-warning',
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <BarChart3 className="h-3 w-3" /> Score Intelligence
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-secondary/50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
            <p className={`font-display text-xs font-bold tracking-wider ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
