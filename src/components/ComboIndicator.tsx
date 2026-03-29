import { Flame, Zap } from 'lucide-react';

interface ComboIndicatorProps {
  streak: number;
  multiplier: number;
}

export function ComboIndicator({ streak, multiplier }: ComboIndicatorProps) {
  if (streak < 2) return null;

  const isOnFire = multiplier >= 2;

  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all animate-scale-in
      ${isOnFire
        ? 'bg-warning/20 border border-warning/40 text-warning'
        : 'bg-accent/20 border border-accent/40 text-accent'
      }`}
    >
      {isOnFire ? <Flame className="h-3.5 w-3.5 animate-pulse" /> : <Zap className="h-3.5 w-3.5" />}
      <span>{streak} streak</span>
      <span className="font-display">{multiplier}x</span>
    </div>
  );
}

export function getComboMultiplier(streak: number): number {
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}
