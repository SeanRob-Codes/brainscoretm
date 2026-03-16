import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Zap, Brain, Puzzle, Palette, Grid3X3, Type, Timer, Trophy, ArrowRight, RotateCcw } from 'lucide-react';

// ===== REACTION PULSE =====
function ReactionGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [phase, setPhase] = useState<'wait' | 'ready' | 'go' | 'result' | 'early'>('wait');
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [round, setRound] = useState(0);
  const totalRounds = 5;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const startRound = useCallback(() => {
    setPhase('ready');
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setPhase('go');
      setStartTime(Date.now());
    }, delay);
  }, []);

  useEffect(() => {
    startRound();
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleClick = () => {
    if (phase === 'ready') {
      clearTimeout(timerRef.current);
      setPhase('early');
      setTimeout(() => { setPhase('wait'); startRound(); }, 1000);
    } else if (phase === 'go') {
      const rt = Date.now() - startTime;
      const newTimes = [...times, rt];
      setTimes(newTimes);
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= totalRounds) {
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        const score = Math.max(0, Math.round((500 - avg) * 2));
        setPhase('result');
        onFinish(score);
      } else {
        setPhase('wait');
        setTimeout(startRound, 500);
      }
    }
  };

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">Round {Math.min(round + 1, totalRounds)}/{totalRounds} · Avg: {avg}ms</div>
      <button
        onClick={handleClick}
        className={`w-full rounded-xl p-8 text-center font-display text-lg font-bold tracking-wider transition-all
          ${phase === 'ready' ? 'bg-destructive/20 border border-destructive/40 text-destructive' :
            phase === 'go' ? 'bg-success/20 border border-success/40 text-success animate-glow-pulse' :
            phase === 'early' ? 'bg-warning/20 border border-warning/40 text-warning' :
            phase === 'result' ? 'gradient-accent text-accent-foreground' :
            'bg-secondary border border-border text-muted-foreground'
          }`}
      >
        {phase === 'wait' ? 'Get ready...' :
         phase === 'ready' ? 'WAIT FOR GREEN...' :
         phase === 'go' ? 'TAP NOW!' :
         phase === 'early' ? 'Too early!' :
         `Done! Avg: ${avg}ms`}
      </button>
      {phase === 'result' && (
        <div className="text-center text-xs text-muted-foreground">
          Best: {Math.min(...times)}ms · Worst: {Math.max(...times)}ms
        </div>
      )}
    </div>
  );
}

// ===== MEMORY FLASH =====
function MemoryGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [phase, setPhase] = useState<'show' | 'input' | 'result'>('show');
  const [digits, setDigits] = useState('');
  const [input, setInput] = useState('');
  const [level, setLevel] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const totalRounds = 5;

  const generateDigits = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');

  useEffect(() => {
    const d = generateDigits(level);
    setDigits(d);
    setPhase('show');
    const timer = setTimeout(() => setPhase('input'), 1200 + level * 300);
    return () => clearTimeout(timer);
  }, [round, level]);

  const submit = () => {
    const correct = input === digits;
    const newScore = score + (correct ? level * 20 : 0);
    setScore(newScore);
    const newRound = round + 1;
    if (newRound >= totalRounds) {
      setPhase('result');
      onFinish(newScore);
    } else {
      setRound(newRound);
      setLevel(correct ? level + 1 : Math.max(3, level - 1));
      setInput('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">Round {Math.min(round + 1, totalRounds)}/{totalRounds} · Level: {level} digits · Score: {score}</div>
      {phase === 'show' && (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-6 text-center font-display text-2xl tracking-[0.3em] text-accent animate-glow-pulse">
          {digits}
        </div>
      )}
      {phase === 'input' && (
        <div className="space-y-2">
          <input
            type="text"
            inputMode="numeric"
            value={input}
            onChange={e => setInput(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Type the digits..."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-display text-xl tracking-[0.2em] text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            autoFocus
          />
          <button onClick={submit} className="w-full gradient-accent rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest text-accent-foreground">
            Submit
          </button>
        </div>
      )}
      {phase === 'result' && (
        <div className="rounded-xl gradient-accent p-6 text-center font-display text-lg text-accent-foreground">
          Final Score: {score}
        </div>
      )}
    </div>
  );
}

// ===== LOGIC SNAP =====
const LOGIC_QUESTIONS = [
  { q: "What comes next: 2, 6, 12, 20, ?", choices: ["28", "30", "32", "24"], answer: "30" },
  { q: "If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops Lazzles?", choices: ["Yes", "No", "Maybe", "Impossible"], answer: "Yes" },
  { q: "Complete: 1, 1, 2, 3, 5, 8, ?", choices: ["11", "12", "13", "10"], answer: "13" },
  { q: "Which is the odd one out: 3, 5, 11, 14, 17?", choices: ["3", "5", "14", "17"], answer: "14" },
  { q: "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much is the ball?", choices: ["$0.10", "$0.05", "$0.15", "$0.01"], answer: "$0.05" },
  { q: "What number is 3 times the sum of its digits? (Hint: it's a 2-digit number under 30)", choices: ["18", "27", "24", "21"], answer: "27" },
  { q: "If you rearrange 'CIFAIPC', you get a word meaning relating to the ocean:", choices: ["PACIFIC", "CAPITAL", "TYPICAL", "TOPICAL"], answer: "PACIFIC" },
  { q: "Next in sequence: J, F, M, A, M, ?", choices: ["J", "N", "A", "S"], answer: "J" },
];

function LogicGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const questions = useRef(LOGIC_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 5)).current;
  const totalRounds = questions.length;

  const handleChoice = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const correct = choice === questions[qi].answer;
    const newScore = score + (correct ? 50 : 0);
    setScore(newScore);
    setTimeout(() => {
      if (qi + 1 >= totalRounds) {
        onFinish(newScore);
      } else {
        setQi(qi + 1);
        setSelected(null);
      }
    }, 800);
  };

  if (qi >= totalRounds) return <div className="gradient-accent rounded-xl p-6 text-center font-display text-lg text-accent-foreground">Score: {score}</div>;

  const q = questions[qi];
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">Q{qi + 1}/{totalRounds} · Score: {score}</div>
      <p className="text-sm font-medium">{q.q}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.choices.map(c => (
          <button
            key={c}
            onClick={() => handleChoice(c)}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-all
              ${selected === c
                ? c === q.answer ? 'border-success bg-success/20 text-success' : 'border-destructive bg-destructive/20 text-destructive'
                : selected && c === q.answer ? 'border-success bg-success/10 text-success'
                : 'border-border bg-secondary text-foreground hover:border-accent/50'
              }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ===== COLOR MATCH =====
const COLORS = [
  { name: 'RED', hsl: '0 84% 60%' },
  { name: 'BLUE', hsl: '217 91% 60%' },
  { name: 'GREEN', hsl: '142 71% 45%' },
  { name: 'YELLOW', hsl: '48 96% 53%' },
  { name: 'PURPLE', hsl: '271 81% 65%' },
];

function ColorMatchGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [wordColor, setWordColor] = useState(COLORS[0]);
  const [textColor, setTextColor] = useState(COLORS[0]);
  const [shouldMatch, setShouldMatch] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const totalRounds = 15;

  const nextRound = useCallback(() => {
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    const t = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWordColor(w);
    setTextColor(t);
    setShouldMatch(w.name === t.name);
    setFeedback(null);
  }, []);

  useEffect(() => { nextRound(); }, []);

  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleAnswer = (match: boolean) => {
    if (feedback) return;
    const correct = match === shouldMatch;
    setFeedback(correct ? 'correct' : 'wrong');
    const newScore = score + (correct ? 15 : -5);
    setScore(Math.max(0, newScore));
    const newRound = round + 1;
    setRound(newRound);
    if (newRound >= totalRounds || timeLeft <= 0) {
      setTimeout(() => onFinish(Math.max(0, newScore)), 500);
    } else {
      setTimeout(nextRound, 400);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Round {Math.min(round + 1, totalRounds)}/{totalRounds}</span>
        <span>Score: {score}</span>
        <span className={timeLeft <= 5 ? 'text-destructive font-bold' : ''}>⏱ {timeLeft}s</span>
      </div>
      <div className="rounded-xl border border-border bg-secondary p-8 text-center">
        <span className="font-display text-3xl font-bold tracking-wider" style={{ color: `hsl(${textColor.hsl})` }}>
          {wordColor.name}
        </span>
      </div>
      <p className="text-xs text-center text-muted-foreground">Does the <b>ink color</b> match the word?</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleAnswer(true)} className={`rounded-xl border py-3 text-sm font-bold uppercase tracking-wider transition-all ${feedback === 'correct' && shouldMatch ? 'border-success bg-success/20 text-success' : feedback === 'wrong' && !shouldMatch ? 'border-destructive bg-destructive/20 text-destructive' : 'border-border bg-secondary text-foreground hover:border-success/50'}`}>
          ✓ Match
        </button>
        <button onClick={() => handleAnswer(false)} className={`rounded-xl border py-3 text-sm font-bold uppercase tracking-wider transition-all ${feedback === 'correct' && !shouldMatch ? 'border-success bg-success/20 text-success' : feedback === 'wrong' && shouldMatch ? 'border-destructive bg-destructive/20 text-destructive' : 'border-border bg-secondary text-foreground hover:border-destructive/50'}`}>
          ✗ No Match
        </button>
      </div>
    </div>
  );
}

// ===== SEQUENCE TAP =====
function SequenceGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<'showing' | 'input' | 'result'>('showing');
  const [level, setLevel] = useState(3);
  const [score, setScore] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const totalRounds = 5;

  const generateSequence = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 9));

  const showSequence = useCallback((seq: number[]) => {
    setPhase('showing');
    seq.forEach((cell, i) => {
      setTimeout(() => {
        setActiveCell(cell);
        setTimeout(() => setActiveCell(null), 400);
      }, i * 600);
    });
    setTimeout(() => {
      setPhase('input');
      setPlayerInput([]);
    }, seq.length * 600 + 200);
  }, []);

  useEffect(() => {
    const seq = generateSequence(level);
    setSequence(seq);
    showSequence(seq);
  }, [round, level]);

  const handleCellClick = (cell: number) => {
    if (phase !== 'input') return;
    const newInput = [...playerInput, cell];
    setPlayerInput(newInput);
    setActiveCell(cell);
    setTimeout(() => setActiveCell(null), 200);

    if (newInput.length === sequence.length) {
      const correct = newInput.every((v, i) => v === sequence[i]);
      const newScore = score + (correct ? level * 25 : 0);
      setScore(newScore);
      const newRound = round + 1;
      if (newRound >= totalRounds) {
        setPhase('result');
        onFinish(newScore);
      } else {
        setRound(newRound);
        setLevel(correct ? level + 1 : Math.max(3, level - 1));
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">Round {Math.min(round + 1, totalRounds)}/{totalRounds} · Level: {level} · Score: {score}</div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            onClick={() => handleCellClick(i)}
            className={`h-16 rounded-xl border transition-all duration-200
              ${activeCell === i ? 'gradient-accent border-accent glow-accent scale-95' : 'border-border bg-secondary hover:border-accent/30'}
              ${phase !== 'input' ? 'cursor-default' : 'cursor-pointer'}
            `}
          />
        ))}
      </div>
      <div className="text-center text-xs text-muted-foreground">
        {phase === 'showing' ? '👀 Watch the pattern...' : phase === 'input' ? `Tap: ${playerInput.length}/${sequence.length}` : `Done! Score: ${score}`}
      </div>
      {phase === 'result' && (
        <div className="gradient-accent rounded-xl p-4 text-center font-display text-lg text-accent-foreground">Score: {score}</div>
      )}
    </div>
  );
}

// ===== WORD SCRAMBLE =====
const WORDS = [
  { word: 'NEURON', hint: 'Brain cell' },
  { word: 'CORTEX', hint: 'Brain outer layer' },
  { word: 'SYNAPSE', hint: 'Neural connection' },
  { word: 'MEMORY', hint: 'Recall ability' },
  { word: 'REFLEX', hint: 'Quick response' },
  { word: 'PUZZLE', hint: 'Problem to solve' },
  { word: 'LOGIC', hint: 'Reasoning skill' },
  { word: 'FOCUS', hint: 'Concentration' },
  { word: 'CLEVER', hint: 'Quick-witted' },
  { word: 'BRAIN', hint: 'Think tank' },
];

function WordScrambleGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [words] = useState(() => WORDS.sort(() => Math.random() - 0.5).slice(0, 5));
  const [wi, setWi] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (wi < words.length) {
      const w = words[wi].word;
      const arr = w.split('');
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      // Make sure it's actually scrambled
      if (arr.join('') === w) { arr.reverse(); }
      setScrambled(arr.join(''));
      setInput('');
      setFeedback(null);
    }
  }, [wi]);

  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const submit = () => {
    const correct = input.toUpperCase() === words[wi].word;
    setFeedback(correct ? 'correct' : 'wrong');
    const newScore = score + (correct ? 40 + Math.round(timeLeft * 0.5) : 0);
    setScore(newScore);
    setTimeout(() => {
      if (wi + 1 >= words.length || timeLeft <= 0) {
        onFinish(newScore);
      } else {
        setWi(wi + 1);
      }
    }, 600);
  };

  if (wi >= words.length) return <div className="gradient-accent rounded-xl p-6 text-center font-display text-lg text-accent-foreground">Score: {score}</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Word {wi + 1}/{words.length}</span>
        <span>Score: {score}</span>
        <span className={timeLeft <= 10 ? 'text-destructive font-bold' : ''}>⏱ {timeLeft}s</span>
      </div>
      <div className="rounded-xl border border-accent/30 bg-accent/10 p-6 text-center font-display text-2xl tracking-[0.4em] text-accent">
        {scrambled}
      </div>
      <p className="text-xs text-center text-muted-foreground">Hint: {words[wi].hint}</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Unscramble..."
          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-center font-display text-sm uppercase tracking-widest text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          autoFocus
        />
        <button onClick={submit} className="gradient-accent rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-widest text-accent-foreground">Go</button>
      </div>
      {feedback && (
        <div className={`text-center text-sm font-bold ${feedback === 'correct' ? 'text-success' : 'text-destructive'}`}>
          {feedback === 'correct' ? '✓ Correct!' : `✗ It was: ${words[wi].word}`}
        </div>
      )}
    </div>
  );
}

// ===== MAIN GAMES PAGE =====
const GAME_DEFS = [
  { id: 'reaction', title: 'Reaction Pulse', desc: 'Click when the screen glows green. 5 rounds.', icon: Zap, Component: ReactionGame },
  { id: 'memory', title: 'Memory Flash', desc: 'Memorize digits, then type them back. Difficulty scales.', icon: Brain, Component: MemoryGame },
  { id: 'logic', title: 'Logic Snap', desc: 'Quick pattern & logic questions.', icon: Puzzle, Component: LogicGame },
  { id: 'color', title: 'Color Match', desc: 'Does the ink color match the word? Stroop test!', icon: Palette, Component: ColorMatchGame },
  { id: 'sequence', title: 'Sequence Tap', desc: 'Watch the flashing pattern, then repeat it.', icon: Grid3X3, Component: SequenceGame },
  { id: 'scramble', title: 'Word Scramble', desc: 'Unscramble the word before time runs out.', icon: Type, Component: WordScrambleGame },
];

export function GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const { addGameResult, gameResults, brainlyEnabled } = useGameStore();
  const [brainlyMsg, setBrainlyMsg] = useState<string | null>(null);

  const handleFinish = (gameId: string, score: number) => {
    addGameResult({ game: gameId, score, date: new Date().toISOString() });
    if (brainlyEnabled) {
      const msgs = [
        score > 150 ? "🔥 Beast mode! That was impressive." : "Not bad! You're warming up.",
        score > 100 ? "Your neurons are buzzing!" : "Keep grinding, you'll get there.",
        "Brainly approves. 🧠",
      ];
      setBrainlyMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  };

  const getGameResult = (id: string) => {
    const results = gameResults.filter(r => r.game === id);
    return results.length > 0 ? results[results.length - 1] : null;
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Gamepad2 className="h-3.5 w-3.5" />
        Mini Cognitive Drills
      </div>
      
      {brainlyMsg && brainlyEnabled && (
        <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 animate-pop-in">
          <span className="text-lg">🧠</span>
          <p className="text-xs text-muted-foreground">{brainlyMsg}</p>
          <button onClick={() => setBrainlyMsg(null)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">✕</button>
        </div>
      )}
      
      <div className="grid gap-3 sm:grid-cols-2">
        {GAME_DEFS.map(({ id, title, desc, icon: Icon, Component }) => {
          const result = getGameResult(id);
          const isActive = activeGame === id;
          
          return (
            <div key={id} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/30">
              <div className="flex items-start gap-3 mb-3">
                <div className="rounded-lg gradient-accent p-2">
                  <Icon className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xs font-bold tracking-wider">{title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                  {result && !isActive && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-success">
                      <Trophy className="h-3 w-3" /> Score: {result.score}
                    </span>
                  )}
                </div>
              </div>
              
              {isActive ? (
                <div className="mt-2">
                  <Component onFinish={(score) => { handleFinish(id, score); setActiveGame(null); }} />
                </div>
              ) : (
                <button
                  onClick={() => { setActiveGame(id); setBrainlyMsg(null); }}
                  className="w-full rounded-lg border border-border py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-accent hover:text-foreground transition-all flex items-center justify-center gap-1"
                >
                  {result ? <><RotateCcw className="h-3 w-3" /> Retry</> : <><ArrowRight className="h-3 w-3" /> Run</>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Need to import Gamepad2 at top
import { Gamepad2 } from 'lucide-react';
