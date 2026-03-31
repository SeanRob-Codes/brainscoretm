import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import { Swords, Trophy, Check, X, Clock, Zap, RotateCcw } from 'lucide-react';

interface Challenge {
  id: string;
  challenger_id: string;
  opponent_id: string;
  status: string;
  challenger_score: number;
  opponent_score: number;
  winner_id: string | null;
  game_type: string;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
}

const CHALLENGE_QUESTIONS = [
  { q: "What is 17 × 14?", choices: ["228", "238", "248", "218"], answer: "238" },
  { q: "What planet has the most moons?", choices: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: "Saturn" },
  { q: "What is the square root of 625?", choices: ["20", "25", "30", "15"], answer: "25" },
  { q: "Who wrote '1984'?", choices: ["Huxley", "Orwell", "Bradbury", "Vonnegut"], answer: "Orwell" },
  { q: "What is 2¹⁰?", choices: ["512", "1024", "2048", "256"], answer: "1024" },
];

export function ChallengeSystem() {
  const { user } = useAuth();
  const { addGameResult } = useGameStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [phase, setPhase] = useState<'list' | 'playing' | 'result'>('list');
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [sendTo, setSendTo] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (user) loadChallenges();
  }, [user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('challenges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => {
        loadChallenges();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const loadChallenges = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setChallenges(data as Challenge[]);
      const ids = [...new Set(data.flatMap(c => [c.challenger_id, c.opponent_id]))];
      if (ids.length > 0) {
        const { data: profs } = await supabase.from('public_profiles').select('*').in('user_id', ids);
        const map: Record<string, UserProfile> = {};
        profs?.forEach(p => { map[p.user_id!] = p as UserProfile; });
        setProfiles(map);
      }
    }
  };

  const searchUsers = async () => {
    if (!sendTo.trim()) return;
    const { data } = await supabase
      .from('public_profiles')
      .select('user_id, username, display_name')
      .ilike('username', `%${sendTo.trim()}%`)
      .limit(5);
    setSearchResults((data as UserProfile[]) || []);
  };

  const sendChallenge = async (opponentId: string) => {
    if (!user) return;
    await supabase.from('challenges').insert({
      challenger_id: user.id,
      opponent_id: opponentId,
    } as any);
    setSendTo('');
    setSearchResults([]);
    loadChallenges();
  };

  const acceptChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setPhase('playing');
    setQi(0);
    setScore(0);
    setSelected(null);
  };

  const handleAnswer = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const correct = choice === CHALLENGE_QUESTIONS[qi].answer;
    const newScore = score + (correct ? 50 : 0);
    setScore(newScore);

    setTimeout(() => {
      if (qi + 1 >= CHALLENGE_QUESTIONS.length) {
        finishChallenge(newScore);
      } else {
        setQi(qi + 1);
        setSelected(null);
      }
    }, 600);
  };

  const finishChallenge = async (finalScore: number) => {
    if (!user || !activeChallenge) return;
    setPhase('result');
    
    const isChallenger = activeChallenge.challenger_id === user.id;
    const updates: any = isChallenger
      ? { challenger_score: finalScore }
      : { opponent_score: finalScore, status: 'completed' };

    if (!isChallenger) {
      // Determine winner
      const challengerScore = activeChallenge.challenger_score;
      updates.winner_id = finalScore > challengerScore ? user.id
        : finalScore < challengerScore ? activeChallenge.challenger_id
        : null;
      updates.completed_at = new Date().toISOString();
    } else {
      updates.status = 'accepted';
    }

    await supabase.from('challenges').update(updates).eq('id', activeChallenge.id);
    addGameResult({ game: '1v1-challenge', score: finalScore, date: new Date().toISOString(), detail: `vs ${getName(isChallenger ? activeChallenge.opponent_id : activeChallenge.challenger_id)}` });
    loadChallenges();
  };

  const getName = (id: string) => profiles[id]?.display_name || profiles[id]?.username || 'Anonymous';

  if (phase === 'playing') {
    const q = CHALLENGE_QUESTIONS[qi];
    return (
      <div className="rounded-2xl border-2 border-accent/30 bg-card p-5 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Swords className="h-3.5 w-3.5 text-accent" /> 1v1 Challenge
          </span>
          <span className="font-display text-xs font-bold text-accent">+{score} pts</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full gradient-accent transition-all" style={{ width: `${((qi + 1) / CHALLENGE_QUESTIONS.length) * 100}%` }} />
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

  if (phase === 'result' && activeChallenge) {
    return (
      <div className="rounded-2xl border-2 border-accent/30 bg-card p-6 text-center space-y-4 animate-scale-in">
        <Trophy className="h-10 w-10 text-accent mx-auto" />
        <h2 className="font-display text-2xl font-bold text-accent">{score}</h2>
        <p className="text-sm text-muted-foreground">Challenge Score Submitted!</p>
        <button onClick={() => { setPhase('list'); setActiveChallenge(null); }}
          className="gradient-accent rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-accent-foreground">
          Back to Challenges
        </button>
      </div>
    );
  }

  const pending = challenges.filter(c => c.status === 'pending' && c.opponent_id === user?.id);
  const myChallenges = challenges.filter(c => c.status === 'pending' && c.challenger_id === user?.id);
  const completed = challenges.filter(c => c.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Swords className="h-3.5 w-3.5" /> 1v1 Challenges
      </div>

      {/* Send challenge */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-semibold text-foreground">Challenge a Friend</p>
        <div className="flex gap-2">
          <input value={sendTo} onChange={e => setSendTo(e.target.value)}
            placeholder="Search username..."
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            onKeyDown={e => e.key === 'Enter' && searchUsers()}
          />
          <button onClick={searchUsers} className="gradient-accent rounded-xl px-4 py-2 text-xs font-bold text-accent-foreground">Find</button>
        </div>
        {searchResults.map(u => (
          <div key={u.user_id} className="flex items-center justify-between rounded-lg border border-border bg-secondary p-2">
            <span className="text-xs font-semibold">@{u.username || 'unknown'}</span>
            <button onClick={() => sendChallenge(u.user_id)}
              className="gradient-accent rounded-full px-3 py-1 text-[10px] font-bold text-accent-foreground flex items-center gap-1">
              <Swords className="h-3 w-3" /> Challenge
            </button>
          </div>
        ))}
      </div>

      {/* Pending incoming */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-warning flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Incoming Challenges</p>
          {pending.map(c => (
            <div key={c.id} className="rounded-xl border border-warning/30 bg-warning/5 p-3 flex items-center gap-3">
              <div className="flex-1">
                <span className="text-xs font-bold">{getName(c.challenger_id)}</span>
                <span className="block text-[10px] text-muted-foreground">wants to battle!</span>
              </div>
              <button onClick={() => acceptChallenge(c)}
                className="gradient-accent rounded-full px-4 py-1.5 text-[10px] font-bold text-accent-foreground">
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My pending */}
      {myChallenges.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Waiting for response...</p>
          {myChallenges.map(c => (
            <div key={c.id} className="rounded-lg border border-border bg-secondary p-2.5 flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Challenged {getName(c.opponent_id)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-foreground">Recent Results</p>
          {completed.slice(0, 5).map(c => {
            const won = c.winner_id === user?.id;
            const opponentId = c.challenger_id === user?.id ? c.opponent_id : c.challenger_id;
            const myScore = c.challenger_id === user?.id ? c.challenger_score : c.opponent_score;
            const theirScore = c.challenger_id === user?.id ? c.opponent_score : c.challenger_score;
            return (
              <div key={c.id} className={`rounded-lg border p-3 flex items-center gap-3 ${won ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                <span className={`font-display text-xs font-bold ${won ? 'text-success' : 'text-destructive'}`}>
                  {won ? 'WIN' : c.winner_id ? 'LOSS' : 'TIE'}
                </span>
                <div className="flex-1">
                  <span className="text-xs text-foreground">vs {getName(opponentId)}</span>
                </div>
                <span className="font-display text-xs font-bold text-accent">{myScore} - {theirScore}</span>
              </div>
            );
          })}
        </div>
      )}

      {challenges.length === 0 && (
        <p className="text-center text-xs text-muted-foreground py-6">No challenges yet. Send one to a friend!</p>
      )}
    </div>
  );
}
