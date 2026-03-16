import { useGameStore, OUTFITS, type OutfitId } from '@/store/gameStore';
import { Lock, Check } from 'lucide-react';
import brainlyDefault from '@/assets/brainly-default.png';
import brainlyScientist from '@/assets/brainly-scientist.png';
import brainlyViking from '@/assets/brainly-viking.png';
import brainlyCyber from '@/assets/brainly-cyber.png';
import brainlyKing from '@/assets/brainly-king.png';
import brainlyAthlete from '@/assets/brainly-athlete.png';

const outfitImages: Record<string, string> = {
  default: brainlyDefault,
  scientist: brainlyScientist,
  viking: brainlyViking,
  cyber: brainlyCyber,
  king: brainlyKing,
  athlete: brainlyAthlete,
};

interface OutfitSelectorProps {
  open: boolean;
  onClose: () => void;
}

export function OutfitSelector({ open, onClose }: OutfitSelectorProps) {
  const { selectedOutfit, setSelectedOutfit, getUnlockedOutfits, peakScore } = useGameStore();
  const unlocked = getUnlockedOutfits();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md p-4" onClick={onClose}>
      <div className="w-full max-w-md animate-pop-in rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-lg font-bold tracking-wider mb-1">Brainly Outfitter</h2>
        <p className="text-xs text-muted-foreground mb-4">Peak Score: {peakScore} — Unlock outfits by earning higher BrainScores!</p>
        
        <div className="grid grid-cols-3 gap-3">
          {OUTFITS.map(outfit => {
            const isUnlocked = unlocked.includes(outfit.id);
            const isSelected = selectedOutfit === outfit.id;
            return (
              <button
                key={outfit.id}
                onClick={() => isUnlocked && setSelectedOutfit(outfit.id)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all
                  ${isSelected ? 'border-accent bg-accent/10 glow-accent' : 'border-border bg-secondary'}
                  ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent/50 cursor-pointer'}
                `}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 rounded-full gradient-accent p-0.5">
                    <Check className="h-3 w-3 text-accent-foreground" />
                  </div>
                )}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <img src={outfitImages[outfit.id]} alt={outfit.name} className="h-14 w-14 object-contain" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{outfit.name}</span>
                <span className="text-[9px] text-muted-foreground">{outfit.requiredScore}+</span>
              </button>
            );
          })}
        </div>
        
        <button onClick={onClose} className="mt-4 w-full rounded-full border border-border py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}
