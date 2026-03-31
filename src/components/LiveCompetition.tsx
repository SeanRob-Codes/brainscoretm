import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { Zap, Trophy, Timer, Users, RotateCcw } from 'lucide-react';

const LIVE_QUESTIONS = [
  { q: "What is 23 × 17?", choices: ["381", "391", "401", "371"], answer: "391" },
  { q: "Which gas is most abundant in Earth's atmosphere?", choices: ["Oxygen", "Nitrogen", "CO2", "Argon"], answer: "Nitrogen" },
  { q: "What is the capital of Australia?", choices: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: "Canberra" },
  { q: "How many sides does a dodecahedron have?", choices: ["10", "12", "20", "8"], answer: "12" },
  { q: "What is 15% of 340?", choices: ["45", "51", "55", "48"], answer: "51" },
  { q: "Who discovered gravity?", choices: ["Einstein", "Newton", "Galileo", "Kepler"], answer: "Newton" },
  { q: "What is the atomic number of Carbon?", choices: ["4", "6", "8", "12"], answer: "6" },
  { q: "How many bytes in a kilobyte?", choices: ["1000", "1024", "512", "2048"], answer: "1024" },
];

// Simulated live opponent for MVP
export function LiveCompetition() {
  const { addGameResult } = useGameStore();
  const [phase, setPhase] = useState<'waiting' | 'playing' | 'result'>('waiting');
  const [qi, setQi] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [opponentName] = useState(() => ['BrainMaster', 'NeuralNinja', 'SynapseKing', 'CortexQueen'][Math.floor(Math.random() * 4)]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const questions = useRef(LIVE_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 5)).current;

  const startMatch = () => {
    setPhase('playing');
    setQi(0);
    setMyScore(0);
    setOpponentScore(0);
    setSelected(null);
    setTimeLeft(10);
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
    const newMyScore = myScore + (correct ? 30 + Math.round(timeLeft * 2) : 0);
    setMyScore(newMyScore);

    // Simulate opponent (60-75% accuracy)
    const oppCorrect = Math.random() > 0.3;
    const oppTime = 3 + Math.random() * 5;
    const newOppScore = opponentScore + (oppCorrect ? 30 + Math.round(oppTime * 2) : 0);
    setOpponentScore(newOppScore);

    setTimeout(() => {
      if (qi + 1 >= questions.length) {
        setPhase('result');
        addGameResult({ game: 'live-match', score: newMyScore, date: new Date().toISOString(), detail: `vs ${opponentName}` });
      } else {
        setQi(qi + 1);
        setSelected(null);
        setTimeLeft(10);
      }
    }, 700);
  };

  if (phase === 'waiting') {
    return (
      <div className="rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-card to-accent/5 p-6 text-center space-y-4">
        <div className="rounded-full gradient-accent p-4 mx-auto w-fit glow-accent">
          <Zap className="h-8 w-8 text-accent-foreground" />
        </div>
        <h2 className="font-display text-lg font-bold tracking-wider">Live Competition</h2>
        <p className="text-sm text-muted-foreground">Same questions. Same timer. Real-time scoring.</p>
        <button onClick={startMatch}
          className="w-full gradient-accent rounded-xl py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all flex items-center justify-center gap-2">
          <Users className="h-4 w-4" /> Find Opponent
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    const won = myScore > opponentScore;
    return (
      <div className="rounded-2xl border-2 border-accent/30 bg-card p-6 text-center space-y-4 animate-scale-in">
        <Trophy className={`h-10 w-10 mx-auto ${won ? 'text-success' : 'text-destructive'}`} />
        <h2 className={`font-display text-xl font-bold ${won ? 'text-success' : 'text-destructive'}`}>
          {won ? 'VICTORY!' : myScore === opponentScore ? 'TIE!' : 'DEFEAT!'}
        </h2>
        <div className="flex justify-center gap-8">
          <div><span className="font-display text-2xl font-bold text-accent">{myScore}</span><p className="text-[10px] text-muted-foreground">You</p></div>
          <div className="text-muted-foreground font-display font-bold self-center">vs</div>
          <div><span className="font-display text-2xl font-bold text-foreground">{opponentScore}</span><p className="text-[10px] text-muted-foreground">{opponentName}</p></div>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={startMatch}
            className="gradient-accent rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-accent-foreground flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Rematch
          </button>
          <button onClick={() => setPhase('waiting')}
            className="rounded-full border border-border px-5 py-2 text-xs font-semibold text-muted-foreground">
            Done
          </button>
        </div>
      </div>
    );
  }

  const q = questions[qi];
  return (
    <div className="rounded-2xl border-2 border-accent/30 bg-card p-5 space-y-4">
      {/* Score comparison bar */}
      <div className="flex items-center gap-2">
        <span className="font-display text-xs font-bold text-accent">{myScore}</span>
        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full rounded-full gradient-accent transition-all" style={{ width: `${myScore + opponentScore > 0 ? (myScore / (myScore + opponentScore)) * 100 : 50}%` }} />
        </div>
        <span className="font-display text-xs font-bold text-muted-foreground">{opponentScore}</span>
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>You</span>
        <span>{opponentName}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Q{qi + 1}/{questions.length}</span>
        <span className={`flex items-center gap-1 font-display text-sm font-bold ${timeLeft <= 3 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
          <Timer className="h-3.5 w-3.5" /> {timeLeft}s
        </span>
      </div>

      <p className="text-base font-medium">{q.q}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.choices.map(c => (
          <button key={c} onClick={() => handleAnswer(c)}
            className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all
              ${selected === c
                ? c === q.answer ? 'border-success bg-success/20 text-success' : 'border-destructive bg-destructive/20 text-destructive'
                : selected && c === q.answer ? 'border-success bg-success/10 text-success'
                : 'border-border bg-secondary text-foreground hover:border-accent/50'
              }`}
          >{c}</button>
        ))}
      </div>
    </div>
  );
}
