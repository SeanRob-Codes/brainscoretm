import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Heart, Coins, ShoppingCart, Timer, Zap, AlertTriangle } from 'lucide-react';

export function LivesDisplay() {
  const { lives, maxLives, lastLifeRegenAt, regenLives } = useGameStore();
  const [timeToNext, setTimeToNext] = useState('');

  useEffect(() => {
    regenLives();
    const interval = setInterval(() => {
      regenLives();
      if (lives < maxLives) {
        const elapsed = Date.now() - new Date(lastLifeRegenAt).getTime();
        const regenInterval = 10 * 60 * 1000;
        const remaining = regenInterval - (elapsed % regenInterval);
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeToNext(`${mins}:${secs.toString().padStart(2, '0')}`);
      } else {
        setTimeToNext('');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lives, maxLives, lastLifeRegenAt]);

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: maxLives }, (_, i) => (
        <Heart
          key={i}
          className={`h-4 w-4 transition-all ${
            i < lives
              ? lives === 1 ? 'text-destructive fill-destructive animate-pulse' : 'text-destructive fill-destructive'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
      {timeToNext && lives < maxLives && (
        <span className="text-[9px] text-muted-foreground ml-1 flex items-center gap-0.5">
          <Timer className="h-2.5 w-2.5" /> {timeToNext}
        </span>
      )}
    </div>
  );
}

export function LivesLockScreen({ onRefill, onBuyCoins }: { onRefill: () => void; onBuyCoins: () => void }) {
  const { lives, maxLives, coins, spendCoins, refillLives, lastLifeRegenAt } = useGameStore();
  const [timeToNext, setTimeToNext] = useState('');
  const REFILL_COST = 50;

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(lastLifeRegenAt).getTime();
      const regenInterval = 10 * 60 * 1000;
      const remaining = regenInterval - (elapsed % regenInterval);
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeToNext(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastLifeRegenAt]);

  if (lives > 0) return null;

  const handleRefill = () => {
    if (spendCoins(REFILL_COST)) {
      refillLives();
      onRefill();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md animate-fade-in">
      <div className="mx-4 w-full max-w-sm space-y-6 rounded-2xl border-2 border-destructive/30 bg-card p-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div>
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground">You're Out of Focus ⚡</h2>
          <p className="text-sm text-muted-foreground mt-2">Your brain needs a break. Choose how to continue:</p>
        </div>

        <div className="flex justify-center gap-1">
          {Array.from({ length: maxLives }, (_, i) => (
            <Heart key={i} className="h-6 w-6 text-muted-foreground/20" />
          ))}
        </div>

        <div className="space-y-3">
          {/* Wait */}
          <div className="rounded-xl border border-border bg-secondary p-4 flex items-center gap-3">
            <Timer className="h-5 w-5 text-muted-foreground" />
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-foreground">Wait for Recovery</p>
              <p className="text-xs text-muted-foreground">Next life in {timeToNext}</p>
            </div>
          </div>

          {/* Refill with coins */}
          <button
            onClick={handleRefill}
            disabled={coins < REFILL_COST}
            className="w-full rounded-xl border-2 border-accent/50 bg-accent/10 p-4 flex items-center gap-3 hover:bg-accent/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Coins className="h-5 w-5 text-accent" />
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-foreground">Refill with Coins</p>
              <p className="text-xs text-muted-foreground">Cost: {REFILL_COST} 💰 (You have: {coins})</p>
            </div>
          </button>

          {/* Buy coins */}
          <button
            onClick={onBuyCoins}
            className="w-full gradient-accent rounded-xl p-4 flex items-center gap-3 hover:brightness-110 transition-all"
          >
            <ShoppingCart className="h-5 w-5 text-accent-foreground" />
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-accent-foreground">Buy Coins</p>
              <p className="text-xs text-accent-foreground/70">Opens the coin shop</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
