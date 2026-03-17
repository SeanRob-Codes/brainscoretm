import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { Users, Share2, Copy, Check, MessageSquare, Trophy, Flame } from 'lucide-react';

export function SocialPage() {
  const { brainScore, peakScore, brainLevel, gauntletHighScore } = useGameStore();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const shareUrl = 'https://brainscoretm.lovable.app';

  const shareText = `🧠 BrainScore™ Report Card\n\n📊 Current Score: ${brainScore}\n🏔️ Peak Score: ${peakScore}\n🎯 Level: ${brainLevel}\n⚔️ Gauntlet High: ${gauntletHighScore}\n\nThink you can beat me? Train your brain:\n${shareUrl}`;

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'BrainScore™', text: shareText, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`🧠 My BrainScore is ${brainScore} — ${brainLevel}! Peak: ${peakScore} 🏔️\n\nCan you beat me? ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        Social · Challenge Friends
      </div>

      {/* Share Card */}
      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-card to-accent/5 p-5 space-y-4">
        <div className="text-center space-y-2">
          <div className="font-display text-4xl font-bold text-accent">{brainScore}</div>
          <div className="font-display text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">{brainLevel}</div>
          <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-warning" /> Peak: {peakScore}</span>
            <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-destructive" /> Gauntlet: {gauntletHighScore}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={share}
            className="flex-1 gradient-accent rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
          >
            {copied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Share2 className="h-3.5 w-3.5" /> Share Score</>}
          </button>
          <button
            onClick={shareTwitter}
            className="rounded-xl border border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all"
          >
            𝕏
          </button>
        </div>
      </div>

      {/* Challenge prompts */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-display text-xs font-bold tracking-wider flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" />
          Challenge Messages
        </h3>
        <p className="text-[11px] text-muted-foreground">Tap to copy a challenge to send to friends:</p>
        {[
          `🧠 I just scored ${brainScore} on BrainScore™. Think you can beat that? ${shareUrl}`,
          `⚡ My reaction time is insane. Challenge me on BrainScore™! ${shareUrl}`,
          `🏆 I'm a ${brainLevel} — what's YOUR brain level? Find out: ${shareUrl}`,
        ].map((msg, i) => (
          <button
            key={i}
            onClick={() => { navigator.clipboard.writeText(msg); }}
            className="w-full text-left rounded-lg border border-border bg-secondary p-3 text-[11px] text-muted-foreground hover:border-accent/30 hover:text-foreground transition-all leading-relaxed"
          >
            {msg}
          </button>
        ))}
      </div>
    </div>
  );
}
