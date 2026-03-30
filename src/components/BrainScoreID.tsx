import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Share2, Copy, Check, Brain, Trophy, Flame, Target, Zap, Shield } from 'lucide-react';

interface ProfileData {
  username: string | null;
  display_name: string | null;
  login_streak: number;
}

const TIER_DATA = [
  { name: 'Smooth Brain', min: 0, color: 'text-muted-foreground' },
  { name: 'Basic Brain', min: 550, color: 'text-success' },
  { name: 'Sharp Mind', min: 700, color: 'text-accent' },
  { name: 'Elite Thinker', min: 850, color: 'text-warning' },
  { name: 'Brain Genius', min: 1000, color: 'text-accent' },
  { name: 'Apex Mind', min: 1200, color: 'text-destructive' },
];

function getTier(score: number) {
  return [...TIER_DATA].reverse().find(t => score >= t.min) || TIER_DATA[0];
}

export function BrainScoreID() {
  const { brainScore, peakScore, gameResults } = useGameStore();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [copied, setCopied] = useState(false);
  const [percentile, setPercentile] = useState(50);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles')
      .select('username, display_name, login_streak')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });

    // Calculate percentile
    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).lt('brain_score', brainScore),
    ]).then(([total, below]) => {
      if (total.count && total.count > 0) {
        setPercentile(Math.round(((below.count || 0) / total.count) * 100));
      }
    });
  }, [user, brainScore]);

  const tier = getTier(brainScore);

  // Brain age calculation
  const baseBrainAge = Math.round(35 - ((brainScore - 500) / 1500) * 20);
  const brainAge = Math.max(14, Math.min(65, baseBrainAge));

  // Strongest skill
  const skillScores: Record<string, number[]> = {};
  gameResults.forEach(r => {
    if (!skillScores[r.game]) skillScores[r.game] = [];
    skillScores[r.game].push(r.score);
  });
  const topSkill = Object.entries(skillScores)
    .map(([g, s]) => ({ game: g, avg: s.reduce((a, b) => a + b, 0) / s.length }))
    .sort((a, b) => b.avg - a.avg)[0]?.game || 'N/A';

  const shareCard = () => {
    const text = `🧠 BrainScore™ ID Card\n\n🏆 Score: ${brainScore}\n⚡ Tier: ${tier.name}\n🧬 Brain Age: ${brainAge}\n📊 Top ${Math.max(1, 100 - percentile)}% of users\n🎯 Top Skill: ${topSkill}\n\nhttps://brainscoretm.lovable.app`;
    if (navigator.share) {
      navigator.share({ title: 'BrainScore ID', text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-card via-card to-accent/5 p-5 space-y-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-2 right-2 font-display text-[80px] font-bold text-accent">BS</div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center glow-accent">
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">BrainScore™ ID</h3>
              <p className="font-display text-sm font-bold tracking-wider text-foreground">
                {profile?.display_name || profile?.username || 'Brain Trainer'}
              </p>
            </div>
          </div>
          <button
            onClick={shareCard}
            className="rounded-full border border-accent/30 p-2 text-accent hover:bg-accent/10 transition-all"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-border bg-secondary/50 p-3">
            <Trophy className="h-4 w-4 text-warning mx-auto mb-1" />
            <div className="font-display text-lg font-bold text-accent">{brainScore}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</div>
          </div>
          <div className="rounded-xl border border-border bg-secondary/50 p-3">
            <Brain className="h-4 w-4 text-accent mx-auto mb-1" />
            <div className="font-display text-lg font-bold text-foreground">{brainAge}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Brain Age</div>
          </div>
          <div className="rounded-xl border border-border bg-secondary/50 p-3">
            <Target className="h-4 w-4 text-success mx-auto mb-1" />
            <div className="font-display text-lg font-bold text-success">#{Math.max(1, 100 - percentile)}%</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Rank</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 rounded-xl border border-border bg-secondary/30 p-2.5">
          <div className="flex items-center gap-2">
            <Zap className={`h-3.5 w-3.5 ${tier.color}`} />
            <span className={`font-display text-[11px] font-bold tracking-wider ${tier.color}`}>{tier.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Top Skill:</span>
            <span className="text-[10px] font-bold text-foreground capitalize">{topSkill}</span>
          </div>
          {(profile?.login_streak ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-warning">
              <Flame className="h-3 w-3" />
              <span className="text-[10px] font-bold">{profile?.login_streak}d</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
