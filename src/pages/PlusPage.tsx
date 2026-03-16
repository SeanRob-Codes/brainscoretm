import { Star, Check, ExternalLink } from 'lucide-react';

export function PlusPage() {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Star className="h-3.5 w-3.5" />
        BrainScore Plus
      </div>
      
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
        <h3 className="font-display text-base font-bold tracking-wider mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 text-accent" />
          Unlock More
        </h3>
        
        <ul className="space-y-2.5 mb-6">
          {[
            'Unlimited score history (export to CSV)',
            'Peak performance insights & trends',
            'Exclusive Plus-only mini games',
            'Priority Brainly – deeper, longer conversations',
            'No ads (when we add them for free tier)',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 shrink-0 text-success mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
        
        <div className="text-center space-y-2 mb-4">
          <div className="font-display text-3xl font-bold text-accent">$2.99 <span className="text-sm font-normal text-muted-foreground">/ month</span></div>
          <p className="text-xs text-muted-foreground">Cancel anytime. Card charged monthly.</p>
        </div>
        
        <a
          href="https://buy.stripe.com/6oU7sNbcVcL59SC7jIa3u01"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 gradient-accent rounded-full py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all"
        >
          Subscribe — $2.99/mo
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
