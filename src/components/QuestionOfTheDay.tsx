import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import { HelpCircle, Check, X, Star } from 'lucide-react';

// Rotating daily questions - seeded by date
const QOTD_BANK = [
  { q: "The human brain weighs approximately how many pounds?", choices: ["2 lbs", "3 lbs", "4 lbs", "5 lbs"], answer: "3 lbs", fact: "Your brain weighs about 3 pounds — roughly 2% of your body weight but uses 20% of your energy!" },
  { q: "Which animal has the largest brain relative to body size?", choices: ["Dolphin", "Elephant", "Ant", "Human"], answer: "Ant", fact: "Ants' brains are about 15% of their body mass — the highest ratio in the animal kingdom!" },
  { q: "How many neurons does the average human brain contain?", choices: ["8.6 million", "86 million", "8.6 billion", "86 billion"], answer: "86 billion", fact: "Your brain has ~86 billion neurons, each connected to thousands of others. That's more connections than stars in the Milky Way!" },
  { q: "What percentage of the brain is water?", choices: ["55%", "65%", "73%", "85%"], answer: "73%", fact: "Your brain is 73% water. Just 2% dehydration can impair attention and memory!" },
  { q: "How fast can information travel in the brain?", choices: ["50 mph", "120 mph", "268 mph", "500 mph"], answer: "268 mph", fact: "Neural signals can travel up to 268 mph — faster than a Formula 1 car!" },
  { q: "The brain generates enough electricity to power what?", choices: ["A clock", "A light bulb", "A phone", "A TV"], answer: "A light bulb", fact: "Your brain generates about 12-25 watts of electricity — enough to power a low-wattage LED bulb! 💡" },
  { q: "Which side of the brain controls the left side of the body?", choices: ["Left", "Right", "Both", "Neither"], answer: "Right", fact: "The brain's hemispheres control opposite sides of the body — it's called contralateral control!" },
  { q: "What is the fastest muscle in the human body?", choices: ["Heart", "Eye", "Tongue", "Finger"], answer: "Eye", fact: "Your eye muscles are the fastest — they can move in just 1 millisecond! That's faster than you can blink!" },
  { q: "How long can the brain survive without oxygen?", choices: ["1-2 min", "4-6 min", "8-10 min", "15 min"], answer: "4-6 min", fact: "Brain cells start dying after just 4-6 minutes without oxygen. Your brain is incredibly energy-hungry!" },
  { q: "Dreams occur during which sleep stage?", choices: ["Stage 1", "Stage 2", "Stage 3", "REM"], answer: "REM", fact: "Most vivid dreams happen during REM sleep. You dream 4-6 times per night but forget 95% of them!" },
  { q: "What is the name of the largest part of the brain?", choices: ["Cerebellum", "Cerebrum", "Brain stem", "Hippocampus"], answer: "Cerebrum", fact: "The cerebrum makes up about 85% of the brain's weight and is responsible for thinking, learning, and consciousness!" },
  { q: "At what age is the brain fully developed?", choices: ["18", "21", "25", "30"], answer: "25", fact: "The prefrontal cortex — responsible for decision-making — isn't fully developed until around age 25!" },
  { q: "How many thoughts does the average person have per day?", choices: ["6,000", "12,000", "40,000", "70,000"], answer: "6,000", fact: "Research suggests we have about 6,200 thoughts per day — and many are repetitive!" },
  { q: "What connects the two hemispheres of the brain?", choices: ["Brain stem", "Corpus callosum", "Thalamus", "Pons"], answer: "Corpus callosum", fact: "The corpus callosum contains about 200 million nerve fibers connecting your brain's two halves!" },
];

function getDailyQuestion() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return QOTD_BANK[dayOfYear % QOTD_BANK.length];
}

export function QuestionOfTheDay() {
  const { user } = useAuth();
  const { addGameResult } = useGameStore();
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wasCorrect, setWasCorrect] = useState(false);
  const question = getDailyQuestion();

  useEffect(() => {
    if (!user) return;
    checkIfAnswered();
  }, [user]);

  const checkIfAnswered = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('qotd_responses')
      .select('*')
      .eq('user_id', user.id)
      .eq('question_date', today)
      .maybeSingle();

    if (data) {
      setAnswered(true);
      setWasCorrect(data.was_correct);
      setSelected(data.was_correct ? question.answer : '');
    }
    setLoading(false);
  };

  const handleAnswer = async (choice: string) => {
    if (answered || !user) return;
    setSelected(choice);
    const correct = choice === question.answer;
    setWasCorrect(correct);
    setAnswered(true);

    const points = correct ? 50 : 5; // 5 participation points even if wrong

    const today = new Date().toISOString().split('T')[0];
    await supabase.from('qotd_responses').insert({
      user_id: user.id,
      question_date: today,
      was_correct: correct,
      points_awarded: points,
    });

    addGameResult({ game: 'qotd', score: points, date: new Date().toISOString(), detail: correct ? 'Correct!' : 'Nice try' });
  };

  if (loading) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-lg gradient-accent p-1.5">
          <HelpCircle className="h-4 w-4 text-accent-foreground" />
        </div>
        <div>
          <span className="font-display text-xs font-bold tracking-wider">Question of the Day</span>
          <span className="flex items-center gap-1 text-[9px] text-accent font-bold">
            <Star className="h-2.5 w-2.5" /> +50 bonus points
          </span>
        </div>
      </div>

      <p className="text-sm font-medium leading-relaxed">{question.q}</p>

      <div className="grid grid-cols-2 gap-2">
        {question.choices.map(c => (
          <button
            key={c}
            onClick={() => handleAnswer(c)}
            disabled={answered}
            className={`rounded-xl border px-3 py-3 text-sm text-left transition-all
              ${answered && c === question.answer ? 'border-success bg-success/20 text-success font-bold' :
                answered && selected === c && c !== question.answer ? 'border-destructive bg-destructive/20 text-destructive' :
                answered ? 'border-border bg-secondary/50 text-muted-foreground' :
                'border-border bg-secondary text-foreground hover:border-accent/50 active:scale-[0.98]'
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {answered && (
        <div className={`rounded-xl border p-3 ${wasCorrect ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            {wasCorrect ? (
              <><Check className="h-3.5 w-3.5 text-success" /><span className="text-xs font-bold text-success">Correct! +50 pts 🎉</span></>
            ) : (
              <><X className="h-3.5 w-3.5 text-warning" /><span className="text-xs font-bold text-warning">Not quite! +5 pts for trying</span></>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{question.fact}</p>
        </div>
      )}
    </div>
  );
}
