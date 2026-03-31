import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bell, X, Flame, TrendingUp, Trophy, Zap } from 'lucide-react';

interface Notification {
  id: string;
  icon: typeof Bell;
  message: string;
  color: string;
  priority: number;
}

export function SmartNotifications() {
  const { brainScore, peakScore, gameResults, gauntletHighScore } = useGameStore();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateNotifications();
  }, [brainScore, gameResults.length]);

  const generateNotifications = async () => {
    const notifs: Notification[] = [];

    // Close to peak score
    if (brainScore > 0 && brainScore >= peakScore - 20 && brainScore < peakScore) {
      notifs.push({
        id: 'near-peak',
        icon: TrendingUp,
        message: `You're only ${peakScore - brainScore} points from a new high score!`,
        color: 'text-success',
        priority: 1,
      });
    }

    // Streak at risk (check login streak)
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('login_streak, last_login_date')
        .eq('user_id', user.id)
        .single();
      if (data && (data as any).login_streak >= 3) {
        notifs.push({
          id: 'streak-risk',
          icon: Flame,
          message: `Your ${(data as any).login_streak}-day streak is at risk! Play a game to keep it.`,
          color: 'text-warning',
          priority: 2,
        });
      }
    }

    // Close to tier promotion
    const TIER_THRESHOLDS = [550, 700, 850, 1000, 1200];
    const nextTier = TIER_THRESHOLDS.find(t => brainScore < t);
    if (nextTier && nextTier - brainScore <= 30) {
      notifs.push({
        id: 'tier-close',
        icon: Trophy,
        message: `Just ${nextTier - brainScore} points to the next tier!`,
        color: 'text-accent',
        priority: 1,
      });
    }

    // Milestone achievements
    if (gameResults.length === 5) {
      notifs.push({
        id: 'five-games',
        icon: Zap,
        message: "5 games completed today! You're on fire! 🔥",
        color: 'text-accent',
        priority: 3,
      });
    }

    setNotifications(notifs.filter(n => !dismissed.has(n.id)).sort((a, b) => a.priority - b.priority));
  };

  const dismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-2">
      {notifications.slice(0, 2).map(notif => {
        const Icon = notif.icon;
        return (
          <div key={notif.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 animate-slide-up">
            <Icon className={`h-4 w-4 ${notif.color} shrink-0`} />
            <p className="text-xs text-foreground flex-1">{notif.message}</p>
            <button onClick={() => dismiss(notif.id)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
