import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Calendar, Trophy, Zap, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ScorePoint {
  date: string;
  score: number;
}

interface LifetimeStats {
  totalGames: number;
  totalImprovement: number;
  peakScore: number;
  daysPlayed: number;
  avgScore: number;
}

export function PerformanceGraphs() {
  const { user } = useAuth();
  const { brainScore, peakScore, gameResults } = useGameStore();
  const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([]);
  const [lifetime, setLifetime] = useState<LifetimeStats | null>(null);
  const [view, setView] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [user, view]);

  const loadHistory = async () => {
    if (!user) return;

    let query = supabase
      .from('score_history')
      .select('brain_score, created_at, games_played')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (view === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (view === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data } = await query.limit(100);
    
    if (data) {
      const points: ScorePoint[] = data.map(d => ({
        date: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: d.brain_score,
      }));
      // Add current score as last point
      points.push({ date: 'Today', score: brainScore });
      setScoreHistory(points);

      // Lifetime stats
      const totalGames = data.reduce((sum, d) => sum + d.games_played, 0) + gameResults.length;
      const scores = data.map(d => d.brain_score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : brainScore;
      const totalImprovement = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;

      setLifetime({
        totalGames,
        totalImprovement,
        peakScore,
        daysPlayed: data.length,
        avgScore,
      });
    }
  };

  const skillData = (() => {
    const skills: Record<string, number[]> = {};
    gameResults.forEach(r => {
      if (!skills[r.game]) skills[r.game] = [];
      skills[r.game].push(r.score);
    });
    return Object.entries(skills).map(([game, scores]) => ({
      skill: game.charAt(0).toUpperCase() + game.slice(1),
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      best: Math.max(...scores),
    }));
  })();

  return (
    <div className="space-y-4">
      {/* Score Over Time */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Score Over Time
          </div>
          <div className="flex gap-1">
            {(['week', 'month', 'all'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all ${
                  view === v ? 'gradient-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'all' ? 'All' : v === 'week' ? '7D' : '30D'}
              </button>
            ))}
          </div>
        </div>

        {scoreHistory.length > 1 ? (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreHistory}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--accent))" fill="url(#scoreGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">Save scores to history to see your progress chart!</p>
        )}
      </div>

      {/* Skill Trends */}
      {skillData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" /> Skill Breakdown
          </div>
          <div className="space-y-2">
            {skillData.map(s => (
              <div key={s.skill} className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-foreground w-16 truncate">{s.skill}</span>
                <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-accent transition-all duration-700"
                    style={{ width: `${Math.min(100, (s.avg / 300) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-accent w-8 text-right">{s.avg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifetime Progress Tracker */}
      {lifetime && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" /> Lifetime Progress
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Zap, label: 'Total Games', value: lifetime.totalGames, color: 'text-accent' },
              { icon: Calendar, label: 'Days Played', value: lifetime.daysPlayed, color: 'text-success' },
              { icon: Trophy, label: 'Peak Score', value: lifetime.peakScore, color: 'text-warning' },
              { icon: TrendingUp, label: 'Improvement', value: `${lifetime.totalImprovement >= 0 ? '+' : ''}${lifetime.totalImprovement}`, color: lifetime.totalImprovement >= 0 ? 'text-success' : 'text-destructive' },
              { icon: Brain, label: 'Avg Score', value: lifetime.avgScore, color: 'text-accent' },
              { icon: BarChart3, label: 'Skills Tracked', value: skillData.length, color: 'text-muted-foreground' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-xl border border-border bg-secondary/50 p-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <Icon className={`h-3 w-3 ${color}`} />
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
                <p className={`font-display text-sm font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
