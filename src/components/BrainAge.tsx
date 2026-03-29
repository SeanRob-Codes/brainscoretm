import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Brain, TrendingDown, TrendingUp, Minus } from 'lucide-react';

function calculateBrainAge(brainScore: number, gameResults: any[]): number {
  // Base brain age starts at 35 and improves with score
  let brainAge = 35;

  // Score factor: higher scores = younger brain
  if (brainScore >= 1200) brainAge -= 16;
  else if (brainScore >= 1000) brainAge -= 13;
  else if (brainScore >= 850) brainAge -= 10;
  else if (brainScore >= 700) brainAge -= 7;
  else if (brainScore >= 550) brainAge -= 3;
  else brainAge += 5;

  // Activity factor: more games = sharper
  const gamesPlayed = gameResults.length;
  if (gamesPlayed >= 6) brainAge -= 3;
  else if (gamesPlayed >= 3) brainAge -= 1;
  else if (gamesPlayed === 0) brainAge += 3;

  // Diversity factor: playing different types is better
  const uniqueGames = new Set(gameResults.map(r => r.game)).size;
  if (uniqueGames >= 5) brainAge -= 2;
  else if (uniqueGames >= 3) brainAge -= 1;

  // Performance factor: average score across games
  if (gameResults.length > 0) {
    const avgScore = gameResults.reduce((sum, r) => sum + r.score, 0) / gameResults.length;
    if (avgScore >= 200) brainAge -= 3;
    else if (avgScore >= 100) brainAge -= 1;
    else if (avgScore < 50) brainAge += 2;
  }

  return Math.max(14, Math.min(65, brainAge));
}

function getBrainAgeLabel(age: number): { label: string; emoji: string; color: string } {
  if (age <= 18) return { label: 'Lightning Fast', emoji: '⚡', color: 'text-success' };
  if (age <= 22) return { label: 'Sharp & Quick', emoji: '🔥', color: 'text-success' };
  if (age <= 28) return { label: 'Peak Performance', emoji: '🧠', color: 'text-accent' };
  if (age <= 35) return { label: 'Well Balanced', emoji: '✨', color: 'text-accent' };
  if (age <= 45) return { label: 'Room to Grow', emoji: '📈', color: 'text-warning' };
  return { label: 'Needs Training', emoji: '💪', color: 'text-muted-foreground' };
}

export function BrainAge() {
  const { brainScore, gameResults } = useGameStore();
  const { user } = useAuth();
  const [prevAge, setPrevAge] = useState<number | null>(null);

  const brainAge = calculateBrainAge(brainScore, gameResults);
  const { label, emoji, color } = getBrainAgeLabel(brainAge);

  useEffect(() => {
    if (!user) return;
    supabase.from('daily_brain_tests')
      .select('score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(2)
      .then(({ data }) => {
        if (data && data.length >= 2) {
          // Rough estimate of previous brain age from previous score
          const prevScore = data[1].score;
          const estimated = calculateBrainAge(prevScore * 5 + 500, []);
          setPrevAge(estimated);
        }
      });
  }, [user]);

  const ageDiff = prevAge ? prevAge - brainAge : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Brain className="h-3 w-3" /> Brain Age Analysis
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-accent/30 flex items-center justify-center bg-accent/5">
            <div className="text-center">
              <span className="font-display text-2xl font-bold text-accent">{brainAge}</span>
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground -mt-0.5">years</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <p className="font-display text-sm font-bold tracking-wider text-foreground">
            {emoji} Your brain performs like a {brainAge}-year-old
          </p>
          <p className={`text-xs font-semibold ${color}`}>{label}</p>
          {ageDiff !== 0 && (
            <div className="flex items-center gap-1 text-xs">
              {ageDiff > 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-success" />
                  <span className="text-success font-semibold">{ageDiff} years younger than last session</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 text-warning" />
                  <span className="text-warning font-semibold">{Math.abs(ageDiff)} years older — keep training!</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border bg-secondary/50 p-2">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Speed</p>
          <p className="font-display text-xs font-bold text-foreground">{brainScore >= 700 ? 'Fast' : brainScore >= 550 ? 'Avg' : 'Slow'}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/50 p-2">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Memory</p>
          <p className="font-display text-xs font-bold text-foreground">{gameResults.filter(r => r.game === 'memory').length > 0 ? 'Active' : 'Untested'}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/50 p-2">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Logic</p>
          <p className="font-display text-xs font-bold text-foreground">{gameResults.filter(r => r.game === 'logic').length > 0 ? 'Active' : 'Untested'}</p>
        </div>
      </div>
    </div>
  );
}
