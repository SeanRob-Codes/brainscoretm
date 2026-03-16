import { ScoreCircle } from '@/components/ScoreCircle';
import { BrainlyAvatar } from '@/components/BrainlyAvatar';
import { useGameStore } from '@/store/gameStore';
import { Battery, Brain, Zap } from 'lucide-react';

export function DashboardPage() {
  const { brainScore, gameResults, saveToHistory, resetDay, brainLevel } = useGameStore();
  const testsRun = gameResults.length;
  const fatigue = Math.min(100, testsRun * 12);
  const tier = brainScore < 600 ? 'Bronze' : brainScore < 800 ? 'Silver' : brainScore < 1000 ? 'Gold' : brainScore < 1200 ? 'Diamond' : 'Galaxy';

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Brain className="h-3.5 w-3.5" />
        Today · BrainScore Card
      </div>
      
      <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
        <div className="flex items-center gap-5">
          <ScoreCircle />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="gradient-accent rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">{tier}</span>
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
        
        <div className="mt-4 flex gap-2">
          <button onClick={resetDay} className="rounded-full border border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            New Day
          </button>
          <button onClick={saveToHistory} className="gradient-accent rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-accent-foreground hover:brightness-110 transition-all">
            Save to History
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <BrainlyAvatar size={56} />
        <div>
          <span className="font-display text-sm font-bold tracking-wider text-accent">{brainLevel}</span>
          <p className="text-xs text-muted-foreground mt-0.5">Tap Brainly to chat. Unlock outfits in the Outfitter!</p>
        </div>
      </div>
    </div>
  );
}
