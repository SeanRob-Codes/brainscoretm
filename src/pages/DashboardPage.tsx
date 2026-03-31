import { useState } from 'react';
import { ScoreCircle } from '@/components/ScoreCircle';
import { DailyBrainTest } from '@/components/DailyBrainTest';
import { DailyRewards } from '@/components/DailyRewards';
import { ScoreInsights } from '@/components/ScoreInsights';
import { BrainAge } from '@/components/BrainAge';
import { SmartNotifications } from '@/components/SmartNotifications';
import { MissADay } from '@/components/MissADay';
import { QuestionOfTheDay } from '@/components/QuestionOfTheDay';
import { LivesDisplay } from '@/components/LivesSystem';
import { CoinsDisplay } from '@/components/CoinShop';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Share2, Flame, ChevronDown, ChevronUp } from 'lucide-react';

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
  const { brainScore, gameResults, saveToHistory, resetDay, peakScore, nextMultiplier } = useGameStore();
  const [testDone, setTestDone] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const { user } = useAuth();
  const testsRun = gameResults.length;
  const currentTier = getCurrentTier(brainScore);
  const nextTier = getNextTier(brainScore);
  const tierProgress = nextTier ? ((brainScore - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  const shareScore = () => {
    const text = `🧠 My BrainScore is ${brainScore} — ${currentTier.name} (${currentTier.multiplier})!\nPeak: ${peakScore}\nhttps://brainscoretm.lovable.app`;
    if (navigator.share) {
      navigator.share({ title: 'BrainScore™', text, url: 'https://brainscoretm.lovable.app' });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="space-y-3 animate-slide-up max-w-lg mx-auto">
      {/* Status Bar: Lives + Coins + Multiplier */}
      <div className="flex items-center justify-between">
        <LivesDisplay />
        <div className="flex items-center gap-2">
          {nextMultiplier > 1 && (
            <div className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 animate-pulse">
              <Flame className="h-3 w-3 text-warning" />
              <span className="font-display text-[10px] font-bold text-warning">{nextMultiplier}x</span>
            </div>
          )}
          <CoinsDisplay />
        </div>
      </div>

      {/* Smart Notifications - compact */}
      <SmartNotifications />

      {/* Miss a Day */}
      <MissADay onDismiss={() => {}} />

      {/* 🔴 Daily Brain Test - THE FIRST THING */}
      <DailyBrainTest onComplete={() => setTestDone(true)} />

      {/* Score Summary Card - compact */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-4">
          <ScoreCircle />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="gradient-accent rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-accent-foreground">{currentTier.name}</span>
              <span className="text-[9px] font-display font-bold text-muted-foreground">{currentTier.multiplier}</span>
            </div>
            {/* Tier Progress */}
            <div>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-0.5">
                <span className="flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" /> Tier</span>
                {nextTier && <span>{nextTier.min - brainScore} to {nextTier.name}</span>}
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full gradient-accent transition-all duration-700" style={{ width: `${tierProgress}%` }} />
              </div>
            </div>
            {/* Tests run */}
            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
              <span>{testsRun}/6 games today</span>
              <button onClick={shareScore} className="flex items-center gap-0.5 text-accent hover:text-accent/80 transition-colors">
                <Share2 className="h-2.5 w-2.5" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Rewards */}
      <DailyRewards />

      {/* Score Insights */}
      <ScoreInsights />

      {/* Brain Age */}
      <BrainAge />

      {/* Question of the Day */}
      <QuestionOfTheDay />

      {/* Show More */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {showMore ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> More Stats & Tools</>}
      </button>

      {showMore && (
        <div className="space-y-3 animate-slide-up">
          {/* Tier List */}
          <div className="rounded-2xl border border-border bg-card p-3">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Brain Tiers</div>
            <div className="space-y-1.5">
              {TIERS.map((tier) => {
                const isActive = brainScore >= tier.min && brainScore <= tier.max;
                return (
                  <div key={tier.name} className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px] transition-all ${isActive ? 'bg-accent/10 border border-accent/30' : 'bg-secondary/50'}`}>
                    <div className="flex items-center gap-1.5">
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                      <span className={`font-display font-bold tracking-wider ${isActive ? 'text-accent' : 'text-foreground'}`}>{tier.name}</span>
                    </div>
                    <span className="text-muted-foreground">{tier.min}+ · {tier.multiplier}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={resetDay} className="flex-1 rounded-full border border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              New Day
            </button>
            <button onClick={saveToHistory} className="flex-1 gradient-accent rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-accent-foreground hover:brightness-110 transition-all">
              Save History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
