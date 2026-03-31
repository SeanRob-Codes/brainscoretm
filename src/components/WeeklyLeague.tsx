import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Crown, TrendingUp, TrendingDown, Shield, Gem, Flame, Medal } from 'lucide-react';

const LEAGUES = [
  { id: 'bronze', name: 'Bronze', color: 'text-amber-600', icon: Shield, minScore: 0 },
  { id: 'silver', name: 'Silver', color: 'text-gray-400', icon: Medal, minScore: 200 },
  { id: 'gold', name: 'Gold', color: 'text-warning', icon: Crown, minScore: 500 },
  { id: 'elite', name: 'Elite', color: 'text-accent', icon: Gem, minScore: 1000 },
];

interface LeagueEntry {
  user_id: string;
  username?: string;
  display_name?: string;
  weekly_score: number;
  league: string;
  games_played: number;
}

export function WeeklyLeague() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeagueEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeagueEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeague(); }, [user?.id]);

  const loadLeague = async () => {
    if (!user) return;
    setLoading(true);
    const weekStart = getWeekStart();

    // Get or create my entry
    const { data: myData } = await supabase
      .from('weekly_leagues')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single();

    if (!myData) {
      await supabase.from('weekly_leagues').insert({ user_id: user.id, week_start: weekStart } as any);
    }

    // Load all entries for this week
    const { data } = await supabase
      .from('weekly_leagues')
      .select('*')
      .eq('week_start', weekStart)
      .order('weekly_score', { ascending: false })
      .limit(50);

    if (data) {
      const userIds = data.map(d => (d as any).user_id);
      const { data: profiles } = await supabase.from('public_profiles').select('user_id, username, display_name').in('user_id', userIds);
      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.user_id!] = p; });

      const enriched = data.map(d => ({
        ...(d as any),
        username: profileMap[(d as any).user_id]?.username,
        display_name: profileMap[(d as any).user_id]?.display_name,
      })) as LeagueEntry[];

      setEntries(enriched);
      setMyEntry(enriched.find(e => e.user_id === user.id) || null);
    }
    setLoading(false);
  };

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  const getLeagueInfo = (league: string) => LEAGUES.find(l => l.id === league) || LEAGUES[0];
  const myRank = entries.findIndex(e => e.user_id === user?.id) + 1;
  const myLeague = getLeagueInfo(myEntry?.league || 'bronze');
  const nextLeague = LEAGUES[LEAGUES.indexOf(myLeague) + 1];
  const LeagueIcon = myLeague.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Crown className="h-3.5 w-3.5" /> Weekly League
      </div>

      {/* My league status */}
      <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-card to-accent/5 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full gradient-accent p-3 glow-accent">
            <LeagueIcon className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className={`font-display text-base font-bold tracking-wider ${myLeague.color}`}>{myLeague.name} League</h3>
            <p className="text-xs text-muted-foreground">
              {myRank > 0 ? `Rank #${myRank}` : 'Unranked'} · {myEntry?.weekly_score || 0} pts this week
            </p>
          </div>
        </div>

        {nextLeague && (
          <div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>Progress to {nextLeague.name}</span>
              <span>{myEntry?.weekly_score || 0}/{nextLeague.minScore}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full gradient-accent transition-all" style={{ width: `${Math.min(100, ((myEntry?.weekly_score || 0) / nextLeague.minScore) * 100)}%` }} />
            </div>
          </div>
        )}

        <div className="flex gap-3 text-center">
          {LEAGUES.map(l => {
            const isActive = myEntry?.league === l.id;
            const LIcon = l.icon;
            return (
              <div key={l.id} className={`flex-1 rounded-lg border p-2 transition-all ${isActive ? 'border-accent/30 bg-accent/10' : 'border-border/50 opacity-50'}`}>
                <LIcon className={`h-4 w-4 mx-auto ${l.color}`} />
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground block mt-0.5">{l.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">No players this week yet!</p>
        ) : (
          <div className="divide-y divide-border">
            {entries.slice(0, 15).map((entry, i) => {
              const isMe = entry.user_id === user?.id;
              const league = getLeagueInfo(entry.league);
              return (
                <div key={entry.user_id} className={`flex items-center gap-3 px-4 py-2.5 ${isMe ? 'bg-accent/5' : ''}`}>
                  <span className={`font-display text-xs font-bold w-6 ${i < 3 ? 'text-accent' : 'text-muted-foreground'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[11px] font-bold truncate block ${isMe ? 'text-accent' : 'text-foreground'}`}>
                      {entry.display_name || entry.username || 'Anonymous'} {isMe && '(You)'}
                    </span>
                    <span className={`text-[9px] ${league.color}`}>{league.name}</span>
                  </div>
                  <span className="font-display text-xs font-bold text-accent">{entry.weekly_score}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-secondary/50 p-3">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-success" />
          <span>Top 3 promote to next league · Bottom 3 demote</span>
        </div>
      </div>
    </div>
  );
}
