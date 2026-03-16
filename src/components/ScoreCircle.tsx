import { useGameStore } from '@/store/gameStore';

export function ScoreCircle() {
  const { brainScore, brainLevel } = useGameStore();
  const pct = Math.min(100, (brainScore / 2000) * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative h-28 w-28 rounded-full p-1 glow-accent"
        style={{
          background: `conic-gradient(from 200deg, hsl(var(--success)), hsl(var(--accent)), hsl(var(--accent-glow)), hsl(var(--success)) ${pct}%, hsl(var(--border)) ${pct}%)`,
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-card">
          <span className="font-display text-3xl font-bold text-foreground">{brainScore}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Index</span>
        </div>
      </div>
      <span className="font-display text-xs tracking-wider text-accent">{brainLevel}</span>
    </div>
  );
}
