import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface FunComparisonProps {
  gameType: string;
  score: number;
  show: boolean;
}

const COMPARISONS: Record<string, { threshold: number; good: string[]; great: string[] }> = {
  reaction: {
    threshold: 200,
    good: [
      "⚡ Your reflexes are like a cat pouncing on a laser pointer!",
      "🏎️ NASCAR drivers would respect that reaction time!",
      "🥊 Muhammad Ali would nod in approval at those reflexes!",
    ],
    great: [
      "⚡ Usain Bolt wishes his starting block reaction was this fast!",
      "🦅 Your reflexes are literally faster than a falcon's dive!",
      "🎯 Fighter pilot reflexes detected! Top Gun material! 🛩️",
    ],
  },
  memory: {
    threshold: 150,
    good: [
      "🧠 Your memory is sharper than a steel trap!",
      "📚 You're giving librarians a run for their money!",
      "🎵 Mozart-level pattern recognition right there!",
    ],
    great: [
      "🧠 Kim Peek (the real Rain Man) would be impressed!",
      "🔢 You remember digits like the guy who memorized 70,000 digits of Pi!",
      "💫 Your hippocampus is working overtime! Photographic memory vibes!",
    ],
  },
  logic: {
    threshold: 150,
    good: [
      "🧪 Sherlock Holmes would hire you as an assistant!",
      "♟️ Your logical thinking rivals a chess grandmaster!",
      "📐 Pythagoras is taking notes on your reasoning!",
    ],
    great: [
      "🧪 Einstein would approve of that reasoning! E=MC² level stuff!",
      "🌌 Stephen Hawking-tier logical deduction right there!",
      "🏛️ Aristotle himself couldn't have reasoned better!",
    ],
  },
  color: {
    threshold: 120,
    good: [
      "🎨 Your visual processing is like an artist's!",
      "👁️ Eagle-eye precision on those colors!",
      "🌈 Your brain sorts colors faster than a prism!",
    ],
    great: [
      "🎨 Picasso's color perception has nothing on yours!",
      "👁️ Your Stroop effect resistance is superhuman!",
      "⚡ Your visual cortex is firing on all cylinders!",
    ],
  },
  sequence: {
    threshold: 150,
    good: [
      "🧩 Pattern master! Your brain sees order in chaos!",
      "🔮 You spot sequences like a code-breaker!",
      "🎹 Musical genius-level pattern recognition!",
    ],
    great: [
      "🔐 Alan Turing would want you on his Enigma team!",
      "🧬 DNA-sequencing-level pattern recognition!",
      "🌟 Your pattern IQ is off the charts!",
    ],
  },
  scramble: {
    threshold: 120,
    good: [
      "📖 Wordsmith! Your vocabulary game is strong!",
      "🎭 Shakespeare would tip his hat to you!",
      "📝 Scrabble champion in the making!",
    ],
    great: [
      "📖 Shakespeare is JEALOUS of that vocabulary! 📚",
      "🏆 You'd dominate any spelling bee on Earth!",
      "✍️ Mark Twain-level word mastery detected!",
    ],
  },
};

export function FunComparison({ gameType, score, show }: FunComparisonProps) {
  const [comparison, setComparison] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show || score <= 0) return;
    const data = COMPARISONS[gameType];
    if (!data) return;

    const pool = score >= data.threshold ? data.great : data.good;
    const msg = pool[Math.floor(Math.random() * pool.length)];
    setComparison(msg);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [show, score, gameType]);

  if (!visible || !comparison) return null;

  return (
    <div className="animate-pop-in rounded-xl border border-accent/30 bg-accent/5 p-3 flex items-start gap-2">
      <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
      <p className="text-sm font-medium leading-relaxed">{comparison}</p>
    </div>
  );
}
