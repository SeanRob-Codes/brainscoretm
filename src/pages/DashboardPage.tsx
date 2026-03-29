import { useState } from 'react';
import { ScoreCircle } from '@/components/ScoreCircle';
import { BrainlyAvatar } from '@/components/BrainlyAvatar';
import { DailyRewards } from '@/components/DailyRewards';
import { QuestionOfTheDay } from '@/components/QuestionOfTheDay';
import { DailyBrainTest } from '@/components/DailyBrainTest';
import { ScoreInsights } from '@/components/ScoreInsights';
import { BrainAge } from '@/components/BrainAge';
import { WeaknessTrainer } from '@/components/WeaknessTrainer';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { Battery, Brain, Zap, TrendingUp, Share2, Flame } from 'lucide-react';

const TIERS = [
  { name: 'Smooth Brain', min: 0, max: 549, multiplier: '1x', color: 'text-muted-foreground' },
  { name: 'Basic Brain', min: 550, max: 699, multiplier: '2x', color: 'text-success' },
  { name: 'Sharp Mind', min: 700, max: 849, multiplier: '3x', color: 'text-accent' },
  { name: 'Elite Thinker', min: 850, max: 999, multiplier: '5x', color: 'text-warning' },
  { name: 'Brain Genius', min: 1000, max: 1199, multiplier: '6x', color: 'text-accent' },
  { name: 'Apex Mind', min: 1200, max: 2000, multiplier: '8x', color: 'text-destructive' },
];

function getCurrentTier(score: number) {
  return TIERS.find(t => score >= t.min && score <= t.max) || TIERS[0];
}

function getNextTier(score: number) {
  const idx = TIERS.findIndex(t => score >= t.min && score <= t.max);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

export function DashboardPage() {
  const { brainScore, gameResults, saveToHistory, resetDay, brainLevel, peakScore, nextMultiplier } = useGameStore();
  const [testDone, setTestDone] = useState(false);
  const { user } = useAuth();
  const testsRun = gameResults.length;
  const fatigue = Math.min(100, testsRun * 12);
  const currentTier = getCurrentTier(brainScore);
  const nextTier = getNextTier(brainScore);
  const tierProgress = nextTier ? ((brainScore - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  const shareScore = () => {
    const text = `🧠 My Brainly Score is ${brainScore} — ${currentTier.name} (${currentTier.multiplier})!\nPeak: ${peakScore}\nhttps://brainscoretm.lovable.app`;
    if (navigator.share) {
      navigator.share({ title: 'Brainly', text, url: 'https://brainscoretm.lovable.app' });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Brain className="h-3.5 w-3.5" />
        Today · Brainly Card
      </div>

      {/* Active multiplier indicator */}
      {nextMultiplier > 1 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 flex items-center gap-2 animate-pulse">
          <Flame className="h-4 w-4 text-warning" />
          <span className="text-sm font-bold text-warning">{nextMultiplier}x Multiplier Active!</span>
          <span className="text-xs text-muted-foreground ml-auto">Applied to next game</span>
        </div>
      )}

      {/* Daily Brain Test - First thing user sees */}
      <DailyBrainTest onComplete={() => setTestDone(true)} />

      {/* Daily Rewards */}
      <DailyRewards />

      {/* Brain Age */}
      <BrainAge />

      {/* Score Insights */}
      <ScoreInsights />

      {/* Weakness Trainer */}
      <WeaknessTrainer onStartGame={() => {}} />

      {/* Score Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
        <div className="flex items-center gap-5">
          <ScoreCircle />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="gradient-accent rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">{currentTier.name}</span>
              <span className="text-[10px] font-display font-bold text-muted-foreground">{currentTier.multiplier}</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground mb-1">
                <span>Cognitive Battery</span>
                <span>{testsRun}/6 tests</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full gradient-accent transition-all duration-500" style={{ width: `${Math.min(100, (testsRun / 6) * 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><Battery className="h-3 w-3" /> Fatigue</span>
                <span>{fatigue}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-warning transition-all duration-500" style={{ width: `${fatigue}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tier Progression */}
        <div className="mt-4 rounded-xl border border-border bg-secondary p-3">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            <TrendingUp className="h-3 w-3" /> Tier Progression
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-display font-bold ${currentTier.color}`}>{currentTier.name}</span>
            {nextTier && <span className="text-[10px] text-muted-foreground">{nextTier.name} at {nextTier.min}</span>}
          </div>
          <div className="h-2.5 rounded-full bg-background overflow-hidden">
            <div className="h-full rounded-full gradient-accent transition-all duration-700" style={{ width: `${tierProgress}%` }} />
          </div>
          {nextTier && (
            <p className="text-[10px] text-muted-foreground mt-1">{nextTier.min - brainScore} points to next tier</p>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-secondary p-3">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            <Zap className="h-3 w-3" /> Focus Intel
          </div>
          <p className="text-xs text-muted-foreground">
            {testsRun === 0
              ? "Run tests to unlock today's forecast."
              : testsRun < 3
              ? "Getting warmed up! A few more games to get a solid read."
              : brainScore > 800
              ? "🔥 You're in the zone! Peak cognitive performance detected."
              : "Steady progress. Keep pushing for higher scores!"
            }
          </p>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <button onClick={resetDay} className="rounded-full border border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            New Day
          </button>
          <button onClick={saveToHistory} className="gradient-accent rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-accent-foreground hover:brightness-110 transition-all">
            Save to History
          </button>
          <button onClick={shareScore} className="rounded-full border border-accent/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-accent hover:bg-accent/10 transition-all flex items-center gap-1">
            <Share2 className="h-3 w-3" /> Share
          </button>
        </div>
      </div>

      {/* Question of the Day */}
      <QuestionOfTheDay />

      {/* All Tiers */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Brain Level Tiers</div>
        <div className="space-y-2">
          {TIERS.map((tier) => {
            const isActive = brainScore >= tier.min && brainScore <= tier.max;
            const isUnlocked = peakScore >= tier.min;
            return (
              <div key={tier.name} className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${isActive ? 'border-accent/50 bg-accent/10' : isUnlocked ? 'border-border bg-card' : 'border-border/50 bg-secondary/50 opacity-50'}`}>
                <div className="flex items-center gap-2">
                  {isActive && <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
                  <span className={`font-display text-[11px] font-bold tracking-wider ${isActive ? 'text-accent' : 'text-foreground'}`}>{tier.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground">{tier.min}+</span>
                  <span className={`font-display text-[11px] font-bold ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>{tier.multiplier}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <BrainlyAvatar size={56} />
        <div>
          <span className="font-display text-sm font-bold tracking-wider text-accent">{brainLevel}</span>
          <p className="text-xs text-muted-foreground mt-0.5">Tap Brainly to chat with AI. Unlock outfits in the Outfitter!</p>
        </div>
      </div>
    </div>
  );
}
