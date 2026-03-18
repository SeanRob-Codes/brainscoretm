import { Star, Check, ExternalLink, Lock, Crown, Zap, BarChart3, MessageCircle, Gamepad2, Bot } from 'lucide-react';

const PLUS_FEATURES = [
  { icon: BarChart3, label: 'Unlimited score history & CSV export', description: 'Track every session. Export your data anytime.' },
  { icon: Zap, label: 'Peak performance insights & trend analysis', description: 'See your cognitive trends over weeks and months.' },
  { icon: Gamepad2, label: 'Exclusive Plus-only mini games', description: 'Access premium brain challenges.' },
  { icon: Bot, label: 'Priority Brainly AI — deeper, longer chats', description: 'Extended conversations with smarter responses.' },
  { icon: Crown, label: 'Plus badge on your profile', description: 'Stand out on leaderboards and social.' },
  { icon: MessageCircle, label: 'Unlimited score comments', description: 'Comment on any player\'s score without limits.' },
  { icon: Star, label: 'No ads (when we add them for free tier)', description: 'Enjoy a clean, distraction-free experience.' },
];

export function PlusPage() {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Star className="h-3.5 w-3.5" />
        BrainScore Plus
      </div>
      
      {/* Hero card */}
      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 p-6 text-center space-y-3">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent glow-accent">
          <Crown className="h-7 w-7 text-accent-foreground" />
        </div>
        <h2 className="font-display text-lg font-bold tracking-wider">Unlock Your Full Brain</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Go Plus to unlock premium features, deeper insights, and stand out on the leaderboard.
        </p>
      </div>

      {/* Features list */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-display text-xs font-bold tracking-wider uppercase text-muted-foreground">What you get</h3>
        <div className="space-y-3">
          {PLUS_FEATURES.map((feat, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-secondary p-3 hover:border-accent/20 transition-all">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-accent">
                <feat.icon className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground block">{feat.label}</span>
                <span className="text-[11px] text-muted-foreground">{feat.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free vs Plus comparison */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-xs font-bold tracking-wider uppercase text-muted-foreground mb-4">Free vs Plus</h3>
        <div className="space-y-2">
          {[
            ['Score History', '7 days', 'Unlimited'],
            ['Mini Games', '3 games', 'All games'],
            ['Brainly AI', 'Basic', 'Priority + Extended'],
            ['Profile Badge', '—', '⭐ Plus Badge'],
            ['Comments', '5/day', 'Unlimited'],
            ['Ads', 'Yes (coming)', 'Never'],
          ].map(([feature, free, plus], i) => (
            <div key={i} className="flex items-center text-xs rounded-lg border border-border bg-secondary p-2.5">
              <span className="flex-1 text-foreground font-medium">{feature}</span>
              <span className="w-20 text-center text-muted-foreground">{free}</span>
              <span className="w-24 text-center font-semibold text-accent">{plus}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA */}
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center space-y-3">
        <div className="font-display text-3xl font-bold text-accent">$2.99 <span className="text-sm font-normal text-muted-foreground">/ month</span></div>
        <p className="text-xs text-muted-foreground">Cancel anytime. Card charged monthly via Stripe.</p>
        
        <a
          href="https://buy.stripe.com/6oU7sNbcVcL59SC7jIa3u01"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 gradient-accent rounded-full py-3.5 text-sm font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all glow-accent"
        >
          Subscribe — $2.99/mo
          <ExternalLink className="h-4 w-4" />
        </a>
        
        <p className="text-[10px] text-muted-foreground">Secure checkout powered by Stripe. 🔒</p>
      </div>
    </div>
  );
}
