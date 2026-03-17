import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import { Trophy, Medal, Crown, TrendingUp, Users } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  username: string | null;
  display_name: string | null;
  brain_score: number;
  peak_score: number;
  selected_outfit: string;
  login_streak: number;
}

const RANK_ICONS = [Crown, Medal, Medal];
const RANK_COLORS = ['text-warning', 'text-muted-foreground', 'text-accent'];

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'peak' | 'current' | 'streak'>('peak');
  const { user } = useAuth();
  const { peakScore, brainScore } = useGameStore();

  useEffect(() => {
    loadLeaderboard();
  }, [tab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const orderCol = tab === 'peak' ? 'peak_score' : tab === 'current' ? 'brain_score' : 'login_streak';
    const { data } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, brain_score, peak_score, selected_outfit, login_streak')
      .order(orderCol, { ascending: false })
      .limit(50);
    setEntries((data as LeaderboardEntry[]) || []);
    setLoading(false);
  };

  const myRank = entries.findIndex(e => e.user_id === user?.id) + 1;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Trophy className="h-3.5 w-3.5" />
        Global Leaderboard
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {([['peak', 'Peak Score'], ['current', 'Today'], ['streak', 'Streak']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-xl border py-2 text-[11px] font-bold uppercase tracking-wider transition-all
              ${tab === id ? 'gradient-accent border-accent text-accent-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* My rank */}
      {myRank > 0 && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-accent font-display text-xs font-bold text-accent-foreground">
            #{myRank}
          </div>
          <div className="flex-1">
            <span className="font-display text-xs font-bold tracking-wider">Your Rank</span>
            <span className="block text-[10px] text-muted-foreground">
              {tab === 'peak' ? `Peak: ${peakScore}` : tab === 'current' ? `Score: ${brainScore}` : 'Streak'}
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No players yet!</p>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, i) => {
              const isMe = entry.user_id === user?.id;
              const RankIcon = i < 3 ? RANK_ICONS[i] : null;
              const rankColor = i < 3 ? RANK_COLORS[i] : '';
              const displayName = entry.display_name || entry.username || 'Anonymous Brain';
              const scoreVal = tab === 'peak' ? entry.peak_score : tab === 'current' ? entry.brain_score : entry.login_streak;

              return (
                <div key={entry.user_id} className={`flex items-center gap-3 px-4 py-3 transition-all ${isMe ? 'bg-accent/5' : ''}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'gradient-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    {RankIcon ? <RankIcon className={`h-3.5 w-3.5 ${rankColor}`} /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`font-display text-[11px] font-bold tracking-wider truncate block ${isMe ? 'text-accent' : 'text-foreground'}`}>
                      {displayName} {isMe && '(You)'}
                    </span>
                    {entry.login_streak > 2 && tab !== 'streak' && (
                      <span className="text-[9px] text-warning">🔥 {entry.login_streak} day streak</span>
                    )}
                  </div>
                  <span className="font-display text-sm font-bold text-accent">
                    {scoreVal}{tab === 'streak' ? ' days' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
