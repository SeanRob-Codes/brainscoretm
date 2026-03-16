import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Flame, RotateCcw, Trophy, Timer, Skull } from 'lucide-react';

interface GauntletQuestion {
  category: string;
  question: string;
  choices: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

const GAUNTLET_QUESTIONS: GauntletQuestion[] = [
  // Easy
  { category: 'Science', question: 'What planet is known as the Red Planet?', choices: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars', difficulty: 'easy', timeLimit: 15 },
  { category: 'Math', question: 'What is 15 × 8?', choices: ['110', '120', '130', '115'], answer: '120', difficulty: 'easy', timeLimit: 12 },
  { category: 'Geography', question: 'Which continent is the largest?', choices: ['Africa', 'North America', 'Asia', 'Europe'], answer: 'Asia', difficulty: 'easy', timeLimit: 15 },
  { category: 'Science', question: 'Water boils at what temperature (°C)?', choices: ['90', '100', '110', '95'], answer: '100', difficulty: 'easy', timeLimit: 10 },
  { category: 'Language', question: 'How many vowels in the English alphabet?', choices: ['4', '5', '6', '7'], answer: '5', difficulty: 'easy', timeLimit: 10 },
  { category: 'History', question: 'Who painted the Mona Lisa?', choices: ['Michelangelo', 'Da Vinci', 'Raphael', 'Donatello'], answer: 'Da Vinci', difficulty: 'easy', timeLimit: 12 },
  // Medium
  { category: 'Science', question: 'What is the chemical symbol for Gold?', choices: ['Go', 'Gd', 'Au', 'Ag'], answer: 'Au', difficulty: 'medium', timeLimit: 12 },
  { category: 'Math', question: 'What is the square root of 196?', choices: ['12', '13', '14', '16'], answer: '14', difficulty: 'medium', timeLimit: 15 },
  { category: 'Geography', question: 'Which country has the most time zones?', choices: ['Russia', 'USA', 'China', 'France'], answer: 'France', difficulty: 'medium', timeLimit: 15 },
  { category: 'Science', question: 'How many bones in the adult human body?', choices: ['196', '206', '216', '186'], answer: '206', difficulty: 'medium', timeLimit: 15 },
  { category: 'History', question: 'In what year did the Titanic sink?', choices: ['1910', '1912', '1914', '1908'], answer: '1912', difficulty: 'medium', timeLimit: 12 },
  { category: 'Math', question: 'What is 17² − 8²?', choices: ['225', '245', '200', '260'], answer: '225', difficulty: 'medium', timeLimit: 18 },
  { category: 'Language', question: 'What is the longest word in English without a vowel?', choices: ['rhythm', 'gym', 'myth', 'sync'], answer: 'rhythm', difficulty: 'medium', timeLimit: 15 },
  // Hard
  { category: 'Science', question: 'What is the speed of light in km/s (approx)?', choices: ['200,000', '300,000', '400,000', '150,000'], answer: '300,000', difficulty: 'hard', timeLimit: 12 },
  { category: 'Math', question: 'What is the 10th Fibonacci number?', choices: ['34', '55', '89', '21'], answer: '55', difficulty: 'hard', timeLimit: 18 },
  { category: 'Geography', question: 'What is the deepest point in the ocean?', choices: ['Mariana Trench', 'Tonga Trench', 'Java Trench', 'Puerto Rico Trench'], answer: 'Mariana Trench', difficulty: 'hard', timeLimit: 12 },
  { category: 'Science', question: 'What element has atomic number 79?', choices: ['Silver', 'Gold', 'Platinum', 'Copper'], answer: 'Gold', difficulty: 'hard', timeLimit: 12 },
  { category: 'History', question: 'Who was the first Emperor of Rome?', choices: ['Julius Caesar', 'Augustus', 'Nero', 'Caligula'], answer: 'Augustus', difficulty: 'hard', timeLimit: 15 },
  { category: 'Math', question: 'What is log₂(1024)?', choices: ['8', '9', '10', '12'], answer: '10', difficulty: 'hard', timeLimit: 15 },
];

export function GauntletPage() {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [questions, setQuestions] = useState<GauntletQuestion[]>([]);
  const [qi, setQi] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const { addGameResult, setGauntletHighScore, gauntletHighScore, brainlyEnabled } = useGameStore();

  const startGauntlet = () => {
    const shuffled = [...GAUNTLET_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setQi(0);
    setStrikes(0);
    setCorrect(0);
    setSelected(null);
    setStreak(0);
    setTotalScore(0);
    setPhase('playing');
    setTimeLeft(shuffled[0].timeLimit);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Time's up = wrong
          handleAnswer('__timeout__');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qi]);

  const handleAnswer = useCallback((choice: string) => {
    if (selected) return;
    clearInterval(timerRef.current);
    setSelected(choice);
    const q = questions[qi];
    const isCorrect = choice === q.answer;
    
    let newStrikes = strikes;
    let newCorrect = correct;
    let newStreak = streak;
    let newScore = totalScore;
    
    if (isCorrect) {
      newCorrect++;
      newStreak++;
      const diffMultiplier = q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 1.5 : 2;
      const streakBonus = Math.min(newStreak, 5) * 5;
      const timeBonus = Math.round(timeLeft * 2);
      newScore += Math.round((25 * diffMultiplier) + streakBonus + timeBonus);
    } else {
      newStrikes++;
      newStreak = 0;
    }
    
    setStrikes(newStrikes);
    setCorrect(newCorrect);
    setStreak(newStreak);
    setTotalScore(newScore);

    setTimeout(() => {
      if (newStrikes >= 3 || qi + 1 >= questions.length) {
        setPhase('done');
        addGameResult({ game: 'gauntlet', score: newScore, date: new Date().toISOString(), detail: `${newCorrect} correct, ${newStrikes} strikes` });
        setGauntletHighScore(newScore);
      } else {
        const nextQ = questions[qi + 1];
        setQi(qi + 1);
        setSelected(null);
        setTimeLeft(nextQ.timeLimit);
      }
    }, 800);
  }, [qi, questions, strikes, correct, streak, totalScore, selected]);

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Flame className="h-3.5 w-3.5" />
        Trivia Gauntlet · 3 Strikes
      </div>
      
      <div className="rounded-xl border border-border bg-card p-5">
        {/* Strikes */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Strikes</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-4 w-4 rounded-full border transition-all ${i < strikes ? 'bg-destructive border-destructive glow-accent' : 'border-border'}`} />
            ))}
          </div>
          {phase === 'playing' && (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" /> {totalScore}
              {streak >= 3 && <span className="text-accent ml-1">🔥×{streak}</span>}
            </span>
          )}
        </div>
        
        {phase === 'idle' && (
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Answer trivia questions. 3 wrong answers and you're out!</p>
            <p className="text-xs text-muted-foreground">Difficulty escalates. Time bonuses. Streak multipliers.</p>
            {gauntletHighScore > 0 && (
              <p className="text-xs text-accent flex items-center justify-center gap-1"><Trophy className="h-3 w-3" /> High Score: {gauntletHighScore}</p>
            )}
            <button onClick={startGauntlet} className="gradient-accent rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all">
              Start Gauntlet
            </button>
          </div>
        )}
        
        {phase === 'playing' && questions[qi] && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {questions[qi].category} · {questions[qi].difficulty}
              </span>
              <span className={`flex items-center gap-1 text-sm font-display font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
                <Timer className="h-3.5 w-3.5" /> {timeLeft}s
              </span>
            </div>
            
            <p className="text-sm font-medium leading-relaxed">{questions[qi].question}</p>
            
            <div className="grid grid-cols-2 gap-2">
              {questions[qi].choices.map(c => (
                <button
                  key={c}
                  onClick={() => handleAnswer(c)}
                  disabled={!!selected}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition-all
                    ${selected === c
                      ? c === questions[qi].answer ? 'border-success bg-success/20 text-success' : 'border-destructive bg-destructive/20 text-destructive'
                      : selected && c === questions[qi].answer ? 'border-success bg-success/10 text-success'
                      : 'border-border bg-secondary text-foreground hover:border-accent/50'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
            
            <div className="text-xs text-center text-muted-foreground">
              Q{qi + 1} · {correct} correct · {strikes} wrong
            </div>
          </div>
        )}
        
        {phase === 'done' && (
          <div className="text-center space-y-3">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${strikes >= 3 ? 'bg-destructive/20' : 'gradient-accent'}`}>
              {strikes >= 3 ? <Skull className="h-8 w-8 text-destructive" /> : <Trophy className="h-8 w-8 text-accent-foreground" />}
            </div>
            <div className="font-display text-2xl font-bold text-accent">{totalScore}</div>
            <p className="text-xs text-muted-foreground">{correct} correct · {strikes} strikes · {streak > 0 ? `Best streak: ${streak}` : ''}</p>
            {gauntletHighScore > 0 && <p className="text-[10px] text-muted-foreground">All-time high: {gauntletHighScore}</p>}
            <div className="flex justify-center gap-2">
              <button onClick={startGauntlet} className="gradient-accent rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-accent-foreground flex items-center gap-1">
                <RotateCcw className="h-3 w-3" /> Again
              </button>
              <button onClick={() => setPhase('idle')} className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
