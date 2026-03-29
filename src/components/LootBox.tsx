import { useState, useEffect } from 'react';
import { Gift, Zap, Star, X, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface LootReward {
  type: 'xp' | 'multiplier' | 'streak_shield' | 'bonus';
  label: string;
  description: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: React.ElementType;
}

const REWARD_POOL: Omit<LootReward, 'icon'>[] = [
  { type: 'xp', label: '+10 XP Boost', description: 'A small XP nudge', value: 10, rarity: 'common' },
  { type: 'xp', label: '+25 XP Boost', description: 'Nice bonus XP!', value: 25, rarity: 'common' },
  { type: 'xp', label: '+50 XP Surge', description: 'Serious brain fuel', value: 50, rarity: 'rare' },
  { type: 'xp', label: '+100 XP Mega', description: 'Massive XP drop!', value: 100, rarity: 'epic' },
  { type: 'bonus', label: '+15 Bonus Points', description: 'Extra score bump', value: 15, rarity: 'common' },
  { type: 'bonus', label: '+30 Bonus Points', description: 'Solid bonus', value: 30, rarity: 'rare' },
  { type: 'bonus', label: '+75 Bonus Points', description: 'Jackpot bonus!', value: 75, rarity: 'epic' },
  { type: 'multiplier', label: '1.5x Next Game', description: 'Score multiplier for next game', value: 1.5, rarity: 'rare' },
  { type: 'multiplier', label: '2x Next Game', description: 'Double score on next game!', value: 2, rarity: 'epic' },
  { type: 'multiplier', label: '3x Next Game', description: 'TRIPLE score on next game!!', value: 3, rarity: 'legendary' },
  { type: 'streak_shield', label: 'Streak Shield', description: 'Protects your login streak once', value: 1, rarity: 'epic' },
  { type: 'xp', label: '+200 XP Jackpot', description: 'The legendary brain jackpot!', value: 200, rarity: 'legendary' },
];

const RARITY_COLORS: Record<string, string> = {
  common: 'border-muted-foreground/30 bg-secondary',
  rare: 'border-accent/50 bg-accent/10',
  epic: 'border-purple-500/50 bg-purple-500/10',
  legendary: 'border-warning/50 bg-warning/10',
};

const RARITY_TEXT: Record<string, string> = {
  common: 'text-muted-foreground',
  rare: 'text-accent',
  epic: 'text-purple-400',
  legendary: 'text-warning',
};

function rollReward(): LootReward {
  const roll = Math.random();
  let pool: typeof REWARD_POOL;
  if (roll < 0.03) pool = REWARD_POOL.filter(r => r.rarity === 'legendary');
  else if (roll < 0.15) pool = REWARD_POOL.filter(r => r.rarity === 'epic');
  else if (roll < 0.40) pool = REWARD_POOL.filter(r => r.rarity === 'rare');
  else pool = REWARD_POOL.filter(r => r.rarity === 'common');
  
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { ...pick, icon: pick.type === 'multiplier' ? Zap : pick.type === 'streak_shield' ? Star : Sparkles };
}

export function LootBox({ show, onClose, gameScore }: { show: boolean; onClose: () => void; gameScore: number }) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'revealed'>('closed');
  const [reward, setReward] = useState<LootReward | null>(null);
  const { addGameResult, setNextMultiplier } = useGameStore();

  useEffect(() => {
    if (show) {
      setPhase('opening');
      const r = rollReward();
      setReward(r);
      setTimeout(() => setPhase('revealed'), 1200);
    } else {
      setPhase('closed');
    }
  }, [show]);

  const claimReward = () => {
    if (!reward) return;
    if (reward.type === 'xp' || reward.type === 'bonus') {
      addGameResult({ game: 'loot-box', score: reward.value, date: new Date().toISOString(), detail: reward.label });
    } else if (reward.type === 'multiplier') {
      setNextMultiplier(reward.value);
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-sm">
        {phase === 'opening' && (
          <div className="rounded-2xl border-2 border-accent/50 bg-card p-8 text-center space-y-4 animate-pulse">
            <div className="mx-auto w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center glow-accent">
              <Gift className="h-10 w-10 text-accent-foreground animate-bounce" />
            </div>
            <p className="font-display text-sm font-bold tracking-widest text-accent uppercase">Opening Loot Box...</p>
          </div>
        )}

        {phase === 'revealed' && reward && (
          <div className={`rounded-2xl border-2 ${RARITY_COLORS[reward.rarity]} p-6 text-center space-y-4 animate-scale-in`}>
            <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>

            <div className="text-[10px] uppercase tracking-widest font-bold">
              <span className={RARITY_TEXT[reward.rarity]}>{reward.rarity}</span>
            </div>

            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${RARITY_COLORS[reward.rarity]}`}>
              <reward.icon className={`h-8 w-8 ${RARITY_TEXT[reward.rarity]}`} />
            </div>

            <div>
              <h3 className={`font-display text-lg font-bold tracking-wider ${RARITY_TEXT[reward.rarity]}`}>
                {reward.label}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
            </div>

            <button
              onClick={claimReward}
              className="w-full gradient-accent rounded-xl py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all"
            >
              Claim Reward
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
