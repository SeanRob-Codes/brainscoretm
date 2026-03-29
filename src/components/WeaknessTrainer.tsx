import { useGameStore } from '@/store/gameStore';
import { AlertTriangle, Target, ArrowRight, Brain } from 'lucide-react';

const SKILL_MAP: Record<string, { label: string; game: string; tip: string }> = {
  reaction: { label: 'Reaction', game: 'reaction', tip: 'Practice Reaction Pulse to sharpen reflexes' },
  memory: { label: 'Memory', game: 'memory', tip: 'Try Memory Flash to boost recall' },
  logic: { label: 'Logic', game: 'logic', tip: 'Run Logic Snap to strengthen reasoning' },
  color: { label: 'Focus', game: 'color', tip: 'Play Color Match to improve attention' },
  sequence: { label: 'Pattern Recognition', game: 'sequence', tip: 'Train with Sequence Tap' },
  scramble: { label: 'Language', game: 'scramble', tip: 'Unscramble words to boost vocabulary' },
};

export function WeaknessTrainer({ onStartGame }: { onStartGame: (gameId: string) => void }) {
  const { gameResults } = useGameStore();

  // Calculate average scores per skill
  const skillScores: Record<string, number[]> = {};
  gameResults.forEach(r => {
    if (SKILL_MAP[r.game]) {
      if (!skillScores[r.game]) skillScores[r.game] = [];
      skillScores[r.game].push(r.score);
    }
  });

  const avgScores = Object.entries(skillScores).map(([game, scores]) => ({
    game,
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    count: scores.length,
  }));

  // Find untested skills
  const allSkills = Object.keys(SKILL_MAP);
  const testedSkills = new Set(avgScores.map(s => s.game));
  const untestedSkills = allSkills.filter(s => !testedSkills.has(s));

  // Sort by worst performance
  avgScores.sort((a, b) => a.avg - b.avg);

  const weakest = avgScores.length > 0 ? avgScores[0] : null;
  const weakSkills = avgScores.filter(s => s.avg < 100).slice(0, 2);

  if (avgScores.length < 2 && untestedSkills.length < 2) return null;

  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-warning">
        <Target className="h-3 w-3" /> Weakness Training
      </div>

      {weakest && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-sm text-foreground font-medium">
              Your <span className="text-warning font-bold">{SKILL_MAP[weakest.game].label}</span> needs work
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{SKILL_MAP[weakest.game].tip}</p>
          <button
            onClick={() => onStartGame(weakest.game)}
            className="w-full rounded-xl border-2 border-warning/30 bg-warning/10 py-3 text-sm font-bold uppercase tracking-wider text-warning hover:bg-warning/20 transition-all flex items-center justify-center gap-2"
          >
            <Brain className="h-4 w-4" /> Train {SKILL_MAP[weakest.game].label}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {weakSkills.length > 1 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Other areas to improve</p>
          {weakSkills.slice(1).map(s => (
            <button
              key={s.game}
              onClick={() => onStartGame(s.game)}
              className="w-full flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-2.5 text-xs hover:border-warning/30 transition-all"
            >
              <span className="text-foreground font-medium">{SKILL_MAP[s.game].label} — avg {Math.round(s.avg)} pts</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {untestedSkills.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Untested skills</p>
          <div className="flex flex-wrap gap-1.5">
            {untestedSkills.map(s => (
              <button
                key={s}
                onClick={() => onStartGame(s)}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-accent/30 hover:text-foreground transition-all"
              >
                {SKILL_MAP[s].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
