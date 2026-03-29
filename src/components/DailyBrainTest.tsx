import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Zap, CheckCircle, ArrowRight, Trophy, X } from 'lucide-react';

// Abstract/mixed challenge types for daily brain test
interface Challenge {
  type: 'trivia' | 'math' | 'pattern' | 'reaction' | 'memory';
  question?: string;
  choices?: string[];
  answer?: string;
  digits?: string;
}

const CHALLENGE_POOL: Omit<Challenge, 'digits'>[] = [
  { type: 'trivia', question: "What percentage of the brain is water?", choices: ["50%", "60%", "73%", "80%"], answer: "73%" },
  { type: 'trivia', question: "Which side of the brain is associated with creativity?", choices: ["Left", "Right", "Both equally", "Neither"], answer: "Right" },
  { type: 'trivia', question: "How many neurons does the human brain have?", choices: ["1 million", "100 million", "86 billion", "1 trillion"], answer: "86 billion" },
  { type: 'math', question: "What is 37 + 56?", choices: ["83", "93", "91", "87"], answer: "93" },
  { type: 'math', question: "What is 144 ÷ 12?", choices: ["11", "12", "13", "14"], answer: "12" },
  { type: 'math', question: "What is 15 × 8?", choices: ["110", "120", "130", "115"], answer: "120" },
  { type: 'math', question: "What is √196?", choices: ["12", "13", "14", "16"], answer: "14" },
  { type: 'pattern', question: "What comes next: 3, 6, 12, 24, ?", choices: ["30", "36", "48", "42"], answer: "48" },
  { type: 'pattern', question: "What comes next: A, C, F, J, ?", choices: ["K", "L", "N", "O"], answer: "O" },
  { type: 'pattern', question: "What comes next: 1, 4, 9, 16, ?", choices: ["20", "21", "25", "36"], answer: "25" },
  { type: 'trivia', question: "What is the fastest muscle in the human body?", choices: ["Heart", "Eye", "Tongue", "Jaw"], answer: "Eye" },
  { type: 'trivia', question: "How many hours of sleep do most adults need?", choices: ["5-6", "6-7", "7-9", "9-10"], answer: "7-9" },
  { type: 'math', question: "What is 23² − 22²?", choices: ["41", "43", "45", "47"], answer: "45" },
  { type: 'pattern', question: "Complete: 2, 3, 5, 7, 11, ?", choices: ["12", "13", "14", "15"], answer: "13" },
  { type: 'trivia', question: "Which vitamin is known as the sunshine vitamin?", choices: ["A", "B", "C", "D"], answer: "D" },
  { type: 'trivia', question: "What's the average attention span of a human?", choices: ["2 sec", "8 sec", "15 sec", "30 sec"], answer: "8 sec" },
  { type: 'math', question: "What is 17 × 6?", choices: ["92", "96", "102", "108"], answer: "102" },
  { type: 'pattern', question: "What comes next: Z, X, V, T, ?", choices: ["R", "S", "Q", "P"], answer: "R" },
];

function getDailyChallenges(): Challenge[] {
  const today = new Date().toISOString().split('T')[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
  
  const shuffled = [...CHALLENGE_POOL].sort((a, b) => {
    const ha = (seed * 31 + a.question!.charCodeAt(0)) % 100;
    const hb = (seed * 31 + b.question!.charCodeAt(0)) % 100;
    return ha - hb;
  });
  
  const numChallenges = 3 + (seed % 3); // 3-5 challenges
  const selected = shuffled.slice(0, numChallenges);
  
  // Add a memory challenge
  const memDigits = Array.from({ length: 5 }, () => Math.floor(((seed * 7 + 3) % 10))).join('');
  const realMemDigits = Array.from({ length: 5 }, (_, i) => Math.floor(Math.random() * 10)).join('');
  selected.push({ type: 'memory', digits: realMemDigits } as any);
  
  return selected as Challenge[];
}

export function DailyBrainTest({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const { addGameResult } = useGameStore();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'memory-show' | 'memory-input' | 'result'>('intro');
  const [challenges] = useState(getDailyChallenges);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [memInput, setMemInput] = useState('');
  const [alreadyDone, setAlreadyDone] = useState(false);

  // Check if already completed today
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    supabase.from('daily_brain_tests')
      .select('id')
      .eq('user_id', user.id)
      .eq('test_date', today)
      .then(({ data }) => {
        if (data && data.length > 0) setAlreadyDone(true);
      });
  }, [user]);

  const current = challenges[currentIdx];

  const handleAnswer = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const correct = choice === current.answer;
    if (correct) {
      setScore(s => s + 25);
      setCorrectCount(c => c + 1);
    }
    setTimeout(() => {
      setSelected(null);
      if (currentIdx + 1 >= challenges.length) {
        finishTest(score + (correct ? 25 : 0), correctCount + (correct ? 1 : 0));
      } else {
        const next = currentIdx + 1;
        setCurrentIdx(next);
        const nextChallenge = challenges[next];
        if (nextChallenge.type === 'memory') {
          setPhase('memory-show');
          setTimeout(() => setPhase('memory-input'), 2000);
        }
      }
    }, 700);
  };

  const handleMemorySubmit = () => {
    const correct = memInput === current.digits;
    const bonus = correct ? 30 : 0;
    finishTest(score + bonus, correctCount + (correct ? 1 : 0));
  };

  const finishTest = async (finalScore: number, finalCorrect: number) => {
    setScore(finalScore);
    setCorrectCount(finalCorrect);
    setPhase('result');
    
    addGameResult({ game: 'daily-test', score: finalScore, date: new Date().toISOString(), detail: `${finalCorrect}/${challenges.length} correct` });

    if (user) {
      await supabase.from('daily_brain_tests').insert({
        user_id: user.id,
        score: finalScore,
        challenges_completed: challenges.length,
      });
    }
  };

  if (alreadyDone) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-success/20 p-2">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-wider text-foreground">Today's Brain Test Complete ✓</p>
            <p className="text-xs text-muted-foreground mt-0.5">Come back tomorrow for a new set of challenges!</p>
          </div>
        </div>
      </div>
    );
  }

  // INTRO - Big pulsing button
  if (phase === 'intro') {
    return (
      <div className="rounded-2xl border-2 border-accent/30 bg-card p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full gradient-accent p-4 glow-accent animate-pulse">
            <Brain className="h-8 w-8 text-accent-foreground" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Daily Brain Test</h2>
          <p className="text-sm text-muted-foreground mt-1">{challenges.length} quick challenges to kickstart your day</p>
        </div>
        <button
          onClick={() => {
            const first = challenges[0];
            if (first.type === 'memory') {
              setPhase('memory-show');
              setTimeout(() => setPhase('memory-input'), 2000);
            } else {
              setPhase('playing');
            }
          }}
          className="w-full gradient-accent rounded-xl py-4 text-base font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all animate-pulse glow-accent flex items-center justify-center gap-2"
        >
          <Zap className="h-5 w-5" /> Start Today's Brain Test
        </button>
      </div>
    );
  }

  // RESULT
  if (phase === 'result') {
    return (
      <div className="rounded-2xl border-2 border-accent/30 bg-card p-6 text-center space-y-4 animate-scale-in">
        <div className="rounded-full gradient-accent p-4 glow-accent mx-auto w-fit">
          <Trophy className="h-8 w-8 text-accent-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-wider text-accent">{score}</h2>
          <p className="text-sm text-muted-foreground">Daily Brain Test Score</p>
        </div>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>{correctCount}/{challenges.length} correct</span>
          <span>+{score} to BrainScore</span>
        </div>
        <button
          onClick={onComplete}
          className="w-full rounded-xl border-2 border-border py-3 text-sm font-semibold uppercase tracking-wider text-foreground hover:border-accent/50 transition-all flex items-center justify-center gap-2"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // MEMORY SHOW
  if (phase === 'memory-show') {
    return (
      <div className="rounded-2xl border-2 border-accent/30 bg-card p-6 text-center space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Memorize these digits</p>
        <div className="rounded-xl border-2 border-accent/30 bg-accent/10 p-8">
          <span className="font-display text-4xl tracking-[0.4em] text-accent font-bold animate-pulse">{current.digits}</span>
        </div>
        <p className="text-sm text-muted-foreground">Watch carefully...</p>
      </div>
    );
  }

  // MEMORY INPUT
  if (phase === 'memory-input') {
    return (
      <div className="rounded-2xl border-2 border-accent/30 bg-card p-6 space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground text-center">Type the digits you saw</p>
        <input
          type="text" inputMode="numeric" value={memInput}
          onChange={e => setMemInput(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handleMemorySubmit()}
          placeholder="Enter digits..."
          className="w-full rounded-xl border-2 border-border bg-background px-4 py-4 text-center font-display text-2xl tracking-[0.3em] text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
          autoFocus
        />
        <button onClick={handleMemorySubmit} className="w-full gradient-accent rounded-xl py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground">Submit</button>
      </div>
    );
  }

  // PLAYING - trivia/math/pattern questions
  return (
    <div className="rounded-2xl border-2 border-accent/30 bg-card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Challenge {currentIdx + 1}/{challenges.length}
        </span>
        <span className="font-display text-xs font-bold text-accent">+{score} pts</span>
      </div>
      
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full gradient-accent transition-all duration-500" style={{ width: `${((currentIdx + 1) / challenges.length) * 100}%` }} />
      </div>

      <p className="text-base font-medium leading-relaxed text-foreground">{current.question}</p>
      
      <div className="grid grid-cols-2 gap-2">
        {current.choices?.map(c => (
          <button key={c} onClick={() => handleAnswer(c)}
            className={`rounded-xl border-2 px-3 py-3.5 text-sm font-medium transition-all
              ${selected === c
                ? c === current.answer ? 'border-success bg-success/20 text-success' : 'border-destructive bg-destructive/20 text-destructive'
                : selected && c === current.answer ? 'border-success bg-success/10 text-success'
                : 'border-border bg-secondary text-foreground hover:border-accent/50 active:scale-[0.97]'
              }`}
          >{c}</button>
        ))}
      </div>
    </div>
  );
}
