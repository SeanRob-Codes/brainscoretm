import { useGameStore, type ThemeColor } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Palette, Bot, Share2, Shirt, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { OutfitSelector } from '@/components/OutfitSelector';

const THEMES: { id: ThemeColor; label: string }[] = [
  { id: 'red', label: 'Aggressive Red' },
  { id: 'cyan', label: 'Neon Cyan' },
  { id: 'purple', label: 'Midnight Purple' },
];

export function SettingsPage() {
  const { theme, setTheme, brainlyEnabled, setBrainlyEnabled, brainScore, brainLevel, peakScore } = useGameStore();
  const { user, signOut } = useAuth();
  const [outfitOpen, setOutfitOpen] = useState(false);

  const shareScore = () => {
    const text = `🧠 My BrainScore is ${brainScore} (${brainLevel})! Peak: ${peakScore}\nTrain your brain at BrainScore™\nhttps://brainscoretm.lovable.app`;
    if (navigator.share) {
      navigator.share({ title: 'BrainScore™', text, url: 'https://brainscoretm.lovable.app' });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Settings className="h-3.5 w-3.5" />
        Settings
      </div>
      
      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-accent">
            <User className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-display text-xs font-bold tracking-wider block truncate">{user?.email}</span>
            <span className="text-[10px] text-muted-foreground">Peak Score: {peakScore}</span>
          </div>
          <button
            onClick={signOut}
            className="rounded-full border border-destructive/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-destructive hover:bg-destructive/10 transition-all flex items-center gap-1"
          >
            <LogOut className="h-3 w-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-accent" />
          <span className="font-display text-xs font-bold tracking-wider">Theme</span>
        </div>
        <p className="text-xs text-muted-foreground">Pick your BrainScore skin. Changes all accent colors.</p>
        <div className="flex gap-2">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex-1 rounded-xl border py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-all
                ${theme === t.id ? 'gradient-accent border-accent text-accent-foreground' : 'border-border text-muted-foreground hover:text-foreground hover:border-accent/30'}
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Brainly Toggle */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-accent" />
            <div>
              <span className="font-display text-xs font-bold tracking-wider">Brainly Mode</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Toggle AI comments & auto messages</p>
            </div>
          </div>
          <button
            onClick={() => setBrainlyEnabled(!brainlyEnabled)}
            className={`relative h-7 w-12 rounded-full transition-all ${brainlyEnabled ? 'gradient-accent' : 'bg-secondary border border-border'}`}
          >
            <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-foreground shadow-md transition-all ${brainlyEnabled ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
      
      {/* Outfit selector */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="h-4 w-4 text-accent" />
            <div>
              <span className="font-display text-xs font-bold tracking-wider">Brainly Outfitter</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Customize your Brainly avatar</p>
            </div>
          </div>
          <button
            onClick={() => setOutfitOpen(true)}
            className="rounded-full border border-border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all"
          >
            Open
          </button>
        </div>
      </div>
      
      {/* Share */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-accent" />
            <div>
              <span className="font-display text-xs font-bold tracking-wider">Share with Friends</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Share your BrainScore & tier</p>
            </div>
          </div>
          <button
            onClick={shareScore}
            className="rounded-full border border-border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all"
          >
            Share
          </button>
        </div>
      </div>
      
      <OutfitSelector open={outfitOpen} onClose={() => setOutfitOpen(false)} />
    </div>
  );
}
