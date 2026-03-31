import { useGameStore } from '@/store/gameStore';
import { Brain, Star, Sparkles, Crown, Flame, Gem } from 'lucide-react';

const EVOLUTION_STAGES = [
  { minScore: 0, name: 'Smooth Brain', emoji: '🧠', level: 1, description: 'Just hatched. Fresh and smooth.', complexity: 'basic' },
  { minScore: 550, name: 'Wrinkled Thinker', emoji: '🧬', level: 2, description: 'First wrinkles forming. Learning!', complexity: 'developing' },
  { minScore: 700, name: 'Synapse Spark', emoji: '⚡', level: 3, description: 'Neural connections firing rapidly.', complexity: 'intermediate' },
  { minScore: 850, name: 'Cortex Commander', emoji: '🎖️', level: 4, description: 'Brain regions synchronized.', complexity: 'advanced' },
  { minScore: 1000, name: 'Neural Architect', emoji: '🏛️', level: 5, description: 'Building neural highways.', complexity: 'expert' },
  { minScore: 1200, name: 'Galaxy Brain', emoji: '🌌', level: 6, description: 'Transcended mortal cognition.', complexity: 'legendary' },
];

function getEvolutionStage(peakScore: number) {
  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    if (peakScore >= EVOLUTION_STAGES[i].minScore) return EVOLUTION_STAGES[i];
  }
  return EVOLUTION_STAGES[0];
}

function getNextStage(peakScore: number) {
  for (const stage of EVOLUTION_STAGES) {
    if (peakScore < stage.minScore) return stage;
  }
  return null;
}

export function AvatarEvolution() {
  const { peakScore, brainScore } = useGameStore();
  const current = getEvolutionStage(peakScore);
  const next = getNextStage(peakScore);
  const progress = next
    ? ((peakScore - current.minScore) / (next.minScore - current.minScore)) * 100
    : 100;

  // Visual complexity layers
  const complexityLayers = {
    basic: 1,
    developing: 2,
    intermediate: 3,
    advanced: 4,
    expert: 5,
    legendary: 6,
  };

  const layers = complexityLayers[current.complexity as keyof typeof complexityLayers];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3 w-3" /> Brain Evolution
      </div>

      <div className="flex items-center gap-4">
        {/* Avatar visualization */}
        <div className="relative">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center relative overflow-hidden
            ${layers >= 5 ? 'glow-accent' : ''}`}>
            {/* Base layer */}
            <div className={`absolute inset-0 rounded-full gradient-accent opacity-${Math.min(100, layers * 20)}`} />
            {/* Ring layers based on complexity */}
            {Array.from({ length: layers }).map((_, i) => (
              <div key={i} className="absolute rounded-full border border-accent/20"
                style={{
                  inset: `${i * 3}px`,
                  opacity: 0.3 + (i * 0.15),
                  animation: `score-pulse ${2 + i * 0.5}s ease-in-out infinite`,
                }}
              />
            ))}
            <span className="text-3xl relative z-10">{current.emoji}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full gradient-accent h-7 w-7 flex items-center justify-center text-[10px] font-display font-bold text-accent-foreground border-2 border-card">
            {current.level}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-display text-sm font-bold tracking-wider text-foreground">{current.name}</h3>
            <p className="text-[11px] text-muted-foreground">{current.description}</p>
          </div>

          {next && (
            <div>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                <span>Next: {next.name}</span>
                <span>{peakScore}/{next.minScore}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full gradient-accent transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All stages */}
      <div className="flex gap-1.5 justify-center">
        {EVOLUTION_STAGES.map((stage, i) => {
          const unlocked = peakScore >= stage.minScore;
          const isCurrent = stage === current;
          return (
            <div key={i}
              className={`flex flex-col items-center gap-0.5 rounded-lg border p-1.5 w-12 transition-all
                ${isCurrent ? 'border-accent/50 bg-accent/10 scale-110' : unlocked ? 'border-border' : 'border-border/30 opacity-30'}`}
              title={stage.name}
            >
              <span className="text-sm">{stage.emoji}</span>
              <span className="text-[7px] text-muted-foreground font-bold">Lv{stage.level}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
