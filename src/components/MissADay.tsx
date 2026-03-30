import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react';

export function MissADay({ onDismiss }: { onDismiss: () => void }) {
  const { user } = useAuth();
  const [daysOff, setDaysOff] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles')
      .select('last_login_date')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.last_login_date) {
          const last = new Date(data.last_login_date);
          const today = new Date();
          const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          if (diff > 1) {
            setDaysOff(diff);
            setShow(true);
          }
        }
      });
  }, [user]);

  if (!show) return null;

  const getMessage = () => {
    if (daysOff <= 2) return "Your momentum slowed a bit. Let's get back on track! 💪";
    if (daysOff <= 5) return "Your brain muscles need warming up. A few games will get you back! 🧠";
    return "Welcome back! Your neural pathways missed you. Let's rebuild that streak! 🔥";
  };

  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 space-y-3 animate-slide-up">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-warning/20 p-2">
          <TrendingDown className="h-4 w-4 text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xs font-bold tracking-wider text-warning">
            {daysOff} day{daysOff > 1 ? 's' : ''} since last session
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{getMessage()}</p>
        </div>
      </div>
      <button
        onClick={() => { setShow(false); onDismiss(); }}
        className="w-full gradient-accent rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-widest text-accent-foreground flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
      >
        Let's Go <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
