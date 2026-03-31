import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import { Skull, Trophy, Timer, Zap, Lock } from 'lucide-react';

const BOSS_QUESTIONS = [
  { q: "If a car travels 240km in 3 hours, then 180km in 2 hours, what's the average speed?", choices: ["78 km/h", "84 km/h", "80 km/h", "82 km/h"], answer: "84 km/h", time: 20 },
  { q: "What number, when multiplied by itself 3 times, gives 27?", choices: ["3", "9", "27", "6"], answer: "3", time: 15 },
  { q: "The Fibonacci sequence: F(15) = ?", choices: ["377", "610", "987", "233"], answer: "610", time: 25 },
  { q: "If 3x + 7 = 2x + 15, what is x²?", choices: ["49", "64", "36", "81"], answer: "64", time: 20 },
  { q: "Which element is most abundant in Earth's crust by mass?", choices: ["Silicon", "Oxygen", "Iron", "Aluminum"], answer: "Oxygen", time: 15 },
  { q: "How many possible unique handshakes in a room of 12 people?", choices: ["66", "132", "55", "78"], answer: "66", time: 25 },
  { q: "What is the derivative of x³ + 2x²?", choices: ["3x² + 4x", "3x² + 2x", "x² + 4x", "3x + 4"], answer: "3x² + 4x", time: 20 },
  { q: "The speed of sound in air at 20°C is approximately?", choices: ["290 m/s", "343 m/s", "400 m/s", "310 m/s"], answer: "343 m/s", time: 15 },
];

export function BossChallenge() {
  const { user } = useAuth();
  const { addGameResult } = useGameStore();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const questions = useRef(BOSS_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 6)).current;

  useEffect(() => {
    if (!user) return;
    const weekStart = getWeekStart();
    supabase.from('boss_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()
      .then(({ data }) => {
        if (data) {
          setAlreadyDone((data as any).completed);
          setBestScore((data as any).score);
        }
      });
  }, [user]);

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  const startBoss = () => {
    setPhase('playing');
    setQi(0);
    setScore(0);
    setSelected(null);
    setTimeLeft(questions[0].time);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleAnswer('__timeout__'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qi]);

  const handleAnswer = (choice: string) => {
    if (selected) return;
    clearInterval(timerRef.current);
    setSelected(choice);
    const correct = choice === questions[qi].answer;
    const timeBonus = Math.round(timeLeft * 3);
    const newScore = score + (correct ? 80 + timeBonus : 0);
    setScore(newScore);

    setTimeout(() => {
      if (qi + 1 >= questions.length) {
        finishBoss(newScore);
      } else {
        setQi(qi + 1);
        setSelected(null);
        setTimeLeft(questions[qi + 1].time);
      }
    }, 700);
  };

  const finishBoss = async (finalScore: number) => {
    setPhase('result');
    setAlreadyDone(true);
    setBestScore(Math.max(bestScore, finalScore));

    addGameResult({ game: 'boss-challenge', score: finalScore, date: new Date().toISOString(), detail: 'Weekly Boss' });

    if (user) {
      const weekStart = getWeekStart();
      await supabase.from('boss_challenges').upsert({
        user_id: user.id,
        week_start: weekStart,
        score: Math.max(bestScore, finalScore),
        completed: true,
      } as any, { onConflict: 'user_id,week_start' });
    }
  };

  if (alreadyDone && phase === 'intro') {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-5 space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-success/20 p-2">
            <Trophy className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-wider text-foreground">Boss Challenge Complete!</p>
            <p className="text-xs text-muted-foreground">Score: {bestScore} · Come back next week!</p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="rounded-2xl border-2 border-destructive/30 bg-gradient-to-br from-card to-destructive/5 p-6 text-center space-y-4">
        <div className="rounded-full bg-destructive/20 p-4 mx-auto w-fit animate-pulse">
          <Skull className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-display text-lg font-bold tracking-wider text-destructive">Weekly Boss Challenge</h2>
        <p className="text-sm text-muted-foreground">6 brutally hard questions. Time pressure. Massive rewards.</p>
        <button onClick={startBoss}
          className="w-full rounded-xl bg-destructive py-4 text-sm font-bold uppercase tracking-widest text-destructive-foreground hover:brightness-110 transition-all flex items-center justify-center gap-2">
          <Skull className="h-4 w-4" /> Enter the Boss Fight
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="rounded-2xl border-2 border-accent/30 bg-card p-6 text-center space-y-4 animate-scale-in">
        <Trophy className="h-10 w-10 text-accent mx-auto" />
        <h2 className="font-display text-3xl font-bold text-accent">{score}</h2>
        <p className="text-sm text-muted-foreground">Boss Challenge Score</p>
        <button onClick={() => setPhase('intro')}
          className="gradient-accent rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-accent-foreground">
          Done
        </button>
      </div>
    );
  }

  const q = questions[qi];
  return (
    <div className="rounded-2xl border-2 border-destructive/30 bg-card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Skull className="h-3.5 w-3.5 text-destructive" /> Boss Q{qi + 1}/{questions.length}
        </span>
        <span className={`flex items-center gap-1 font-display text-sm font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
          <Timer className="h-3.5 w-3.5" /> {timeLeft}s
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full bg-destructive transition-all" style={{ width: `${(timeLeft / q.time) * 100}%` }} />
      </div>
      <p className="text-base font-medium leading-relaxed">{q.q}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.choices.map(c => (
          <button key={c} onClick={() => handleAnswer(c)}
            className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all
              ${selected === c
                ? c === q.answer ? 'border-success bg-success/20 text-success' : 'border-destructive bg-destructive/20 text-destructive'
                : selected && c === q.answer ? 'border-success bg-success/10 text-success'
                : 'border-border bg-secondary text-foreground hover:border-destructive/50'
              }`}
          >{c}</button>
        ))}
      </div>
      <span className="text-center block font-display text-xs font-bold text-accent">+{score}</span>
    </div>
  );
}
