import { useGameStore, OUTFITS } from '@/store/gameStore';
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

interface BrainlyAvatarProps {
  size?: number;
  className?: string;
}

export function BrainlyAvatar({ size = 48, className = '' }: BrainlyAvatarProps) {
  const { selectedOutfit } = useGameStore();
  const img = outfitImages[selectedOutfit] || outfitImages.default;

  return (
    <img
      src={img}
      alt={`Brainly - ${OUTFITS.find(o => o.id === selectedOutfit)?.name}`}
      className={`object-contain drop-shadow-lg ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
