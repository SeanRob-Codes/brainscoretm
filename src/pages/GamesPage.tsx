import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { FunComparison } from '@/components/FunComparison';
import { SubjectSelector } from '@/components/SubjectSelector';
import { LootBox } from '@/components/LootBox';
import { ComboIndicator, getComboMultiplier } from '@/components/ComboIndicator';
import { Zap, Brain, Puzzle, Palette, Grid3X3, Type, Timer, Trophy, ArrowRight, RotateCcw, Gamepad2, Flame } from 'lucide-react';

// ===== SUBJECT-BASED QUESTION BANKS =====
const LOGIC_BY_SUBJECT: Record<string, { q: string; choices: string[]; answer: string }[]> = {
  general: [
    { q: "What comes next: 2, 6, 12, 20, ?", choices: ["28", "30", "32", "24"], answer: "30" },
    { q: "If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops Lazzles?", choices: ["Yes", "No", "Maybe", "Impossible"], answer: "Yes" },
    { q: "Complete: 1, 1, 2, 3, 5, 8, ?", choices: ["11", "12", "13", "10"], answer: "13" },
    { q: "Which is the odd one out: 3, 5, 11, 14, 17?", choices: ["3", "5", "14", "17"], answer: "14" },
    { q: "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much is the ball?", choices: ["$0.10", "$0.05", "$0.15", "$0.01"], answer: "$0.05" },
    { q: "What number is 3 times the sum of its digits?", choices: ["18", "27", "24", "21"], answer: "27" },
    { q: "If you rearrange 'CIFAIPC', you get a word meaning:", choices: ["PACIFIC", "CAPITAL", "TYPICAL", "TOPICAL"], answer: "PACIFIC" },
    { q: "Next in sequence: J, F, M, A, M, ?", choices: ["J", "N", "A", "S"], answer: "J" },
    { q: "How many squares on a chess board?", choices: ["64", "204", "32", "100"], answer: "204" },
    { q: "If 5 machines take 5 min to make 5 widgets, how long for 100 machines to make 100?", choices: ["100 min", "5 min", "20 min", "50 min"], answer: "5 min" },
  ],
  science: [
    { q: "What is the chemical formula for table salt?", choices: ["NaCl", "KCl", "CaCl₂", "NaOH"], answer: "NaCl" },
    { q: "Which planet has the most moons?", choices: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: "Saturn" },
    { q: "What is the powerhouse of the cell?", choices: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: "Mitochondria" },
    { q: "Light travels at approximately how many km/s?", choices: ["200,000", "300,000", "400,000", "150,000"], answer: "300,000" },
    { q: "What element has the atomic number 1?", choices: ["Helium", "Hydrogen", "Lithium", "Carbon"], answer: "Hydrogen" },
    { q: "How many bones are in the adult human body?", choices: ["196", "206", "216", "186"], answer: "206" },
    { q: "What gas do plants absorb from the atmosphere?", choices: ["O₂", "N₂", "CO₂", "H₂"], answer: "CO₂" },
    { q: "Which organ produces insulin?", choices: ["Liver", "Pancreas", "Kidney", "Spleen"], answer: "Pancreas" },
  ],
  math: [
    { q: "What is 17 × 13?", choices: ["211", "221", "231", "201"], answer: "221" },
    { q: "What is the square root of 256?", choices: ["14", "15", "16", "18"], answer: "16" },
    { q: "What is 15% of 240?", choices: ["32", "36", "34", "38"], answer: "36" },
    { q: "What is 2⁸?", choices: ["128", "256", "512", "64"], answer: "256" },
    { q: "What is log₂(1024)?", choices: ["8", "9", "10", "12"], answer: "10" },
    { q: "The 10th Fibonacci number is?", choices: ["34", "55", "89", "21"], answer: "55" },
    { q: "What is 17² − 8²?", choices: ["225", "245", "200", "260"], answer: "225" },
    { q: "If x + 7 = 15, what is x²?", choices: ["49", "64", "36", "56"], answer: "64" },
  ],
  geography: [
    { q: "Which continent is the largest by area?", choices: ["Africa", "N. America", "Asia", "Europe"], answer: "Asia" },
    { q: "Which country has the most time zones?", choices: ["Russia", "USA", "China", "France"], answer: "France" },
    { q: "What is the deepest point in the ocean?", choices: ["Mariana Trench", "Tonga Trench", "Java Trench", "Cayman Trench"], answer: "Mariana Trench" },
    { q: "Which river is the longest in the world?", choices: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: "Nile" },
    { q: "What is the smallest country by area?", choices: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: "Vatican City" },
    { q: "Which desert is the largest?", choices: ["Sahara", "Antarctic", "Arabian", "Gobi"], answer: "Antarctic" },
    { q: "Mount Everest is in which mountain range?", choices: ["Andes", "Alps", "Himalayas", "Rockies"], answer: "Himalayas" },
    { q: "Which ocean is the smallest?", choices: ["Indian", "Arctic", "Atlantic", "Southern"], answer: "Arctic" },
  ],
  history: [
    { q: "Who painted the Mona Lisa?", choices: ["Michelangelo", "Da Vinci", "Raphael", "Donatello"], answer: "Da Vinci" },
    { q: "In what year did the Titanic sink?", choices: ["1910", "1912", "1914", "1908"], answer: "1912" },
    { q: "Who was the first Emperor of Rome?", choices: ["Caesar", "Augustus", "Nero", "Caligula"], answer: "Augustus" },
    { q: "The Great Wall of China was primarily built to protect against whom?", choices: ["Japanese", "Mongols", "Koreans", "Indians"], answer: "Mongols" },
    { q: "Who discovered penicillin?", choices: ["Pasteur", "Fleming", "Curie", "Darwin"], answer: "Fleming" },
    { q: "What year did WW2 end?", choices: ["1943", "1944", "1945", "1946"], answer: "1945" },
    { q: "Which ancient wonder was in Alexandria?", choices: ["Colossus", "Lighthouse", "Gardens", "Temple"], answer: "Lighthouse" },
    { q: "Who wrote 'The Art of War'?", choices: ["Confucius", "Sun Tzu", "Lao Tzu", "Genghis Khan"], answer: "Sun Tzu" },
  ],
  language: [
    { q: "What is the longest word in English without a vowel?", choices: ["rhythm", "gym", "myth", "sync"], answer: "rhythm" },
    { q: "How many vowels in the English alphabet?", choices: ["4", "5", "6", "7"], answer: "5" },
    { q: "What does 'ubiquitous' mean?", choices: ["Rare", "Everywhere", "Unique", "Ancient"], answer: "Everywhere" },
    { q: "Which language has the most native speakers?", choices: ["English", "Spanish", "Mandarin", "Hindi"], answer: "Mandarin" },
    { q: "What is the plural of 'octopus'?", choices: ["Octopi", "Octopuses", "Octopodes", "All correct"], answer: "All correct" },
    { q: "An 'oxymoron' is:", choices: ["A contradiction", "A metaphor", "A simile", "A rhyme"], answer: "A contradiction" },
    { q: "Which word means 'fear of heights'?", choices: ["Claustrophobia", "Acrophobia", "Arachnophobia", "Vertigo"], answer: "Acrophobia" },
    { q: "What does the prefix 'meta' mean?", choices: ["Small", "Beyond/about", "Against", "Before"], answer: "Beyond/about" },
  ],
};

const WORD_BANKS: Record<string, { word: string; hint: string }[]> = {
  general: [
    { word: 'NEURON', hint: 'Brain cell' }, { word: 'CORTEX', hint: 'Brain outer layer' },
    { word: 'SYNAPSE', hint: 'Neural connection' }, { word: 'MEMORY', hint: 'Recall ability' },
    { word: 'REFLEX', hint: 'Quick response' }, { word: 'PUZZLE', hint: 'Problem to solve' },
    { word: 'LOGIC', hint: 'Reasoning skill' }, { word: 'FOCUS', hint: 'Concentration' },
    { word: 'CLEVER', hint: 'Quick-witted' }, { word: 'BRAIN', hint: 'Think tank' },
    { word: 'WISDOM', hint: 'Deep knowledge' }, { word: 'THINK', hint: 'Mental process' },
  ],
  science: [
    { word: 'PROTON', hint: 'Positive particle' }, { word: 'ENZYME', hint: 'Biological catalyst' },
    { word: 'PLASMA', hint: 'Fourth state of matter' }, { word: 'GENOME', hint: 'Complete DNA set' },
    { word: 'FUSION', hint: 'Combining atoms' }, { word: 'QUASAR', hint: 'Distant bright object' },
    { word: 'PHOTON', hint: 'Light particle' }, { word: 'BIOME', hint: 'Ecological community' },
  ],
  math: [
    { word: 'PRIME', hint: 'Only divisible by 1 and itself' }, { word: 'MATRIX', hint: 'Array of numbers' },
    { word: 'VECTOR', hint: 'Has direction and magnitude' }, { word: 'RADIUS', hint: 'Half a diameter' },
    { word: 'COSINE', hint: 'Trig function' }, { word: 'FACTOR', hint: 'Divides evenly' },
  ],
  geography: [
    { word: 'TUNDRA', hint: 'Frozen biome' }, { word: 'CANYON', hint: 'Deep valley' },
    { word: 'ISLAND', hint: 'Land surrounded by water' }, { word: 'SUMMIT', hint: 'Mountain top' },
    { word: 'GLACIER', hint: 'Moving ice mass' }, { word: 'DELTA', hint: 'River mouth formation' },
  ],
  history: [
    { word: 'EMPIRE', hint: 'Large ruled territory' }, { word: 'TREATY', hint: 'Peace agreement' },
    { word: 'DYNASTY', hint: 'Ruling family line' }, { word: 'KNIGHT', hint: 'Medieval warrior' },
    { word: 'PHARAOH', hint: 'Egyptian ruler' }, { word: 'COLONY', hint: 'Settlement abroad' },
  ],
  language: [
    { word: 'SYNTAX', hint: 'Sentence structure' }, { word: 'PREFIX', hint: 'Added before a word' },
    { word: 'SUFFIX', hint: 'Added after a word' }, { word: 'SIMILE', hint: 'Comparison using like/as' },
    { word: 'CLAUSE', hint: 'Part of a sentence' }, { word: 'ADVERB', hint: 'Modifies a verb' },
  ],
};

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

  useEffect(() => { startRound(); return () => clearTimeout(timerRef.current); }, []);

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
        className={`w-full rounded-xl p-10 text-center font-display text-xl font-bold tracking-wider transition-all
          ${phase === 'ready' ? 'bg-destructive/20 border-2 border-destructive/40 text-destructive' :
            phase === 'go' ? 'bg-success/20 border-2 border-success/40 text-success animate-glow-pulse' :
            phase === 'early' ? 'bg-warning/20 border-2 border-warning/40 text-warning' :
            phase === 'result' ? 'gradient-accent text-accent-foreground' :
            'bg-secondary border-2 border-border text-muted-foreground'
          }`}
      >
        {phase === 'wait' ? 'Get ready...' :
         phase === 'ready' ? '🔴 WAIT FOR GREEN...' :
         phase === 'go' ? '🟢 TAP NOW!' :
         phase === 'early' ? '⚠️ Too early!' :
         `Done! Avg: ${avg}ms`}
      </button>
      {phase === 'result' && (
        <div className="text-center text-xs text-muted-foreground">Best: {Math.min(...times)}ms · Worst: {Math.max(...times)}ms</div>
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
  const totalRounds = 6;

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
      <div className="text-xs text-muted-foreground">Round {Math.min(round + 1, totalRounds)}/{totalRounds} · Level: {level} · Score: {score}</div>
      {phase === 'show' && (
        <div className="rounded-xl border-2 border-accent/30 bg-accent/10 p-8 text-center font-display text-3xl tracking-[0.3em] text-accent animate-glow-pulse">
          {digits}
        </div>
      )}
      {phase === 'input' && (
        <div className="space-y-2">
          <input
            type="text" inputMode="numeric" value={input}
            onChange={e => setInput(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Type the digits..."
            className="w-full rounded-xl border-2 border-border bg-background px-4 py-4 text-center font-display text-2xl tracking-[0.2em] text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
            autoFocus
          />
          <button onClick={submit} className="w-full gradient-accent rounded-xl py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground">Submit</button>
        </div>
      )}
      {phase === 'result' && (
        <div className="rounded-xl gradient-accent p-6 text-center font-display text-xl text-accent-foreground">Final Score: {score}</div>
      )}
    </div>
  );
}

// ===== LOGIC SNAP =====
function LogicGame({ onFinish, subject = 'general' }: { onFinish: (score: number) => void; subject?: string }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const bank = LOGIC_BY_SUBJECT[subject] || LOGIC_BY_SUBJECT.general;
  const questions = useRef(bank.sort(() => Math.random() - 0.5).slice(0, 5)).current;
  const totalRounds = questions.length;

  const handleChoice = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const correct = choice === questions[qi].answer;
    const newScore = score + (correct ? 50 : 0);
    setScore(newScore);
    setTimeout(() => {
      if (qi + 1 >= totalRounds) { onFinish(newScore); }
      else { setQi(qi + 1); setSelected(null); }
    }, 800);
  };

  if (qi >= totalRounds) return <div className="gradient-accent rounded-xl p-6 text-center font-display text-xl text-accent-foreground">Score: {score}</div>;

  const q = questions[qi];
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">Q{qi + 1}/{totalRounds} · Score: {score}</div>
      <p className="text-base font-medium leading-relaxed">{q.q}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.choices.map(c => (
          <button key={c} onClick={() => handleChoice(c)}
            className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-all
              ${selected === c
                ? c === q.answer ? 'border-success bg-success/20 text-success' : 'border-destructive bg-destructive/20 text-destructive'
                : selected && c === q.answer ? 'border-success bg-success/10 text-success'
                : 'border-border bg-secondary text-foreground hover:border-accent/50 active:scale-[0.98]'
              }`}
          >{c}</button>
        ))}
      </div>
    </div>
  );
}

// ===== COLOR MATCH =====
const COLORS = [
  { name: 'RED', hsl: '0 84% 60%' }, { name: 'BLUE', hsl: '217 91% 60%' },
  { name: 'GREEN', hsl: '142 71% 45%' }, { name: 'YELLOW', hsl: '48 96% 53%' },
  { name: 'PURPLE', hsl: '271 81% 65%' },
];

function ColorMatchGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [wordColor, setWordColor] = useState(COLORS[0]);
  const [textColor, setTextColor] = useState(COLORS[0]);
  const [shouldMatch, setShouldMatch] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(25);
  const totalRounds = 18;

  const nextRound = useCallback(() => {
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    const t = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWordColor(w); setTextColor(t); setShouldMatch(w.name === t.name); setFeedback(null);
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
    } else { setTimeout(nextRound, 400); }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Round {Math.min(round + 1, totalRounds)}/{totalRounds}</span>
        <span>Score: {score}</span>
        <span className={timeLeft <= 5 ? 'text-destructive font-bold' : ''}>⏱ {timeLeft}s</span>
      </div>
      <div className="rounded-xl border-2 border-border bg-secondary p-10 text-center">
        <span className="font-display text-4xl font-bold tracking-wider" style={{ color: `hsl(${textColor.hsl})` }}>{wordColor.name}</span>
      </div>
      <p className="text-sm text-center text-muted-foreground">Does the <b>ink color</b> match the word?</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleAnswer(true)} className={`rounded-xl border-2 py-4 text-base font-bold uppercase tracking-wider transition-all ${feedback === 'correct' && shouldMatch ? 'border-success bg-success/20 text-success' : feedback === 'wrong' && !shouldMatch ? 'border-destructive bg-destructive/20 text-destructive' : 'border-border bg-secondary text-foreground hover:border-success/50 active:scale-[0.98]'}`}>
          ✓ Match
        </button>
        <button onClick={() => handleAnswer(false)} className={`rounded-xl border-2 py-4 text-base font-bold uppercase tracking-wider transition-all ${feedback === 'correct' && !shouldMatch ? 'border-success bg-success/20 text-success' : feedback === 'wrong' && shouldMatch ? 'border-destructive bg-destructive/20 text-destructive' : 'border-border bg-secondary text-foreground hover:border-destructive/50 active:scale-[0.98]'}`}>
          ✗ No Match
        </button>
      </div>
    </div>
  );
}

// ===== SEQUENCE TAP (Enhanced - longer, harder) =====
function SequenceGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<'showing' | 'input' | 'result'>('showing');
  const [level, setLevel] = useState(3);
  const [score, setScore] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [gridSize, setGridSize] = useState(9); // 3x3 initially, grows to 4x4
  const totalRounds = 7;

  const generateSequence = (len: number, grid: number) => Array.from({ length: len }, () => Math.floor(Math.random() * grid));

  const showSequence = useCallback((seq: number[]) => {
    setPhase('showing');
    const speed = Math.max(350, 600 - level * 30); // Gets faster
    seq.forEach((cell, i) => {
      setTimeout(() => {
        setActiveCell(cell);
        setTimeout(() => setActiveCell(null), speed * 0.65);
      }, i * speed);
    });
    setTimeout(() => { setPhase('input'); setPlayerInput([]); }, seq.length * speed + 200);
  }, [level]);

  useEffect(() => {
    // Increase grid at higher levels
    const newGrid = level >= 6 ? 16 : 9;
    setGridSize(newGrid);
    const seq = generateSequence(level, newGrid);
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
      const newScore = score + (correct ? level * 25 + (level >= 6 ? 20 : 0) : 0);
      setScore(newScore);
      const newRound = round + 1;
      if (newRound >= totalRounds) { setPhase('result'); onFinish(newScore); }
      else { setRound(newRound); setLevel(correct ? level + 1 : Math.max(3, level - 1)); }
    }
  };

  const cols = gridSize === 16 ? 4 : 3;

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">Round {Math.min(round + 1, totalRounds)}/{totalRounds} · Level: {level} · Score: {score}</div>
      <div className={`grid gap-2 ${cols === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {Array.from({ length: gridSize }, (_, i) => (
          <button key={i} onClick={() => handleCellClick(i)}
            className={`${cols === 4 ? 'h-14' : 'h-16'} rounded-xl border-2 transition-all duration-200
              ${activeCell === i ? 'gradient-accent border-accent glow-accent scale-95' : 'border-border bg-secondary hover:border-accent/30'}
              ${phase !== 'input' ? 'cursor-default' : 'cursor-pointer active:scale-90'}
            `}
          />
        ))}
      </div>
      <div className="text-center text-xs text-muted-foreground font-medium">
        {phase === 'showing' ? '👀 Watch the pattern...' : phase === 'input' ? `Tap: ${playerInput.length}/${sequence.length}` : `Done! Score: ${score}`}
      </div>
      {phase === 'result' && (
        <div className="gradient-accent rounded-xl p-4 text-center font-display text-xl text-accent-foreground">Score: {score}</div>
      )}
    </div>
  );
}

// ===== WORD SCRAMBLE (Enhanced) =====
function WordScrambleGame({ onFinish, subject = 'general' }: { onFinish: (score: number) => void; subject?: string }) {
  const bank = WORD_BANKS[subject] || WORD_BANKS.general;
  const [words] = useState(() => bank.sort(() => Math.random() - 0.5).slice(0, 6));
  const [wi, setWi] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(75);

  useEffect(() => {
    if (wi < words.length) {
      const w = words[wi].word;
      const arr = w.split('');
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      if (arr.join('') === w) arr.reverse();
      setScrambled(arr.join(''));
      setInput(''); setFeedback(null);
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
      if (wi + 1 >= words.length || timeLeft <= 0) { onFinish(newScore); }
      else { setWi(wi + 1); }
    }, 600);
  };

  if (wi >= words.length) return <div className="gradient-accent rounded-xl p-6 text-center font-display text-xl text-accent-foreground">Score: {score}</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Word {wi + 1}/{words.length}</span>
        <span>Score: {score}</span>
        <span className={timeLeft <= 10 ? 'text-destructive font-bold' : ''}>⏱ {timeLeft}s</span>
      </div>
      <div className="rounded-xl border-2 border-accent/30 bg-accent/10 p-8 text-center">
        <span className="font-display text-3xl tracking-[0.4em] text-accent font-bold">{scrambled}</span>
      </div>
      <p className="text-sm text-center text-muted-foreground font-medium">💡 Hint: {words[wi].hint}</p>
      <div className="flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Unscramble..."
          className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-4 text-center font-display text-base uppercase tracking-widest text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
          autoFocus
        />
        <button onClick={submit} className="gradient-accent rounded-xl px-6 py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 active:scale-95 transition-all">Go</button>
      </div>
      {feedback && (
        <div className={`text-center text-base font-bold ${feedback === 'correct' ? 'text-success' : 'text-destructive'}`}>
          {feedback === 'correct' ? '✓ Correct!' : `✗ It was: ${words[wi].word}`}
        </div>
      )}
    </div>
  );
}

// ===== MAIN GAMES PAGE =====
const GAME_DEFS = [
  { id: 'reaction', title: 'Reaction Pulse', desc: 'Click when green. Test your reflexes!', icon: Zap },
  { id: 'memory', title: 'Memory Flash', desc: 'Memorize digits & type them back.', icon: Brain },
  { id: 'logic', title: 'Logic Snap', desc: 'Quick logic & reasoning questions.', icon: Puzzle },
  { id: 'color', title: 'Color Match', desc: 'Stroop test — ink vs word matching.', icon: Palette },
  { id: 'sequence', title: 'Sequence Tap', desc: 'Watch & repeat patterns. Gets harder!', icon: Grid3X3 },
  { id: 'scramble', title: 'Word Scramble', desc: 'Unscramble words before time runs out.', icon: Type },
];

export function GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [subject, setSubject] = useState('general');
  const { addGameResult, gameResults, brainlyEnabled, nextMultiplier, setNextMultiplier } = useGameStore();
  const [brainlyMsg, setBrainlyMsg] = useState<string | null>(null);
  const [lastFinish, setLastFinish] = useState<{ game: string; score: number } | null>(null);
  const [showLootBox, setShowLootBox] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);

  const handleFinish = (gameId: string, rawScore: number) => {
    // Apply multipliers
    const comboMult = getComboMultiplier(comboStreak);
    const totalMult = nextMultiplier * comboMult;
    const finalScore = Math.round(rawScore * totalMult);
    
    addGameResult({ game: gameId, score: finalScore, date: new Date().toISOString(), detail: totalMult > 1 ? `${totalMult}x multiplier` : undefined });
    setLastFinish({ game: gameId, score: finalScore });
    
    // Reset loot box multiplier after use
    if (nextMultiplier > 1) setNextMultiplier(1);
    
    // Update combo streak
    if (rawScore > 50) {
      setComboStreak(s => s + 1);
    } else {
      setComboStreak(0);
    }

    // Random loot box chance (30% after game)
    if (Math.random() < 0.3) {
      setTimeout(() => setShowLootBox(true), 800);
    }

    if (brainlyEnabled) {
      const msgs = [
        finalScore > 150 ? "🔥 Beast mode! That was impressive." : "Not bad! You're warming up.",
        finalScore > 100 ? "Your neurons are buzzing!" : "Keep grinding, you'll get there.",
        "Brainly approves. 🧠",
      ];
      setBrainlyMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  };

  const getGameResult = (id: string) => {
    const results = gameResults.filter(r => r.game === id);
    return results.length > 0 ? results[results.length - 1] : null;
  };

  const renderGame = (id: string) => {
    const onFinish = (score: number) => { handleFinish(id, score); setActiveGame(null); };
    switch (id) {
      case 'reaction': return <ReactionGame onFinish={onFinish} />;
      case 'memory': return <MemoryGame onFinish={onFinish} />;
      case 'logic': return <LogicGame onFinish={onFinish} subject={subject} />;
      case 'color': return <ColorMatchGame onFinish={onFinish} />;
      case 'sequence': return <SequenceGame onFinish={onFinish} />;
      case 'scramble': return <WordScrambleGame onFinish={onFinish} subject={subject} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Gamepad2 className="h-3.5 w-3.5" />
        Mini Cognitive Drills
      </div>

      {/* Combo Indicator */}
      {comboStreak >= 2 && (
        <div className="flex justify-center">
          <ComboIndicator streak={comboStreak} multiplier={getComboMultiplier(comboStreak)} />
        </div>
      )}

      {/* Active Multiplier */}
      {nextMultiplier > 1 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 flex items-center gap-2 animate-pulse">
          <Flame className="h-4 w-4 text-warning" />
          <span className="text-sm font-bold text-warning">{nextMultiplier}x Loot Box Multiplier Active!</span>
        </div>
      )}

      {/* Subject Selector */}
      <SubjectSelector selected={subject} onSelect={setSubject} />

      {/* Fun Comparison */}
      {lastFinish && (
        <FunComparison gameType={lastFinish.game} score={lastFinish.score} show={!!lastFinish} />
      )}

      {brainlyMsg && brainlyEnabled && (
        <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 animate-pop-in">
          <span className="text-lg">🧠</span>
          <p className="text-sm text-muted-foreground">{brainlyMsg}</p>
          <button onClick={() => setBrainlyMsg(null)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">✕</button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {GAME_DEFS.map(({ id, title, desc, icon: Icon }) => {
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
                <div className="mt-2">{renderGame(id)}</div>
              ) : (
                <button
                  onClick={() => { setActiveGame(id); setBrainlyMsg(null); setLastFinish(null); }}
                  className="w-full rounded-lg border-2 border-border py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-accent hover:text-foreground transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                >
                  {result ? <><RotateCcw className="h-3 w-3" /> Retry</> : <><ArrowRight className="h-3 w-3" /> Run</>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Loot Box */}
      <LootBox show={showLootBox} onClose={() => setShowLootBox(false)} gameScore={lastFinish?.score || 0} />
    </div>
  );
}
