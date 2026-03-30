import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, GraduationCap, Flame, FlaskConical } from 'lucide-react';
import { BrainlyAvatar } from './BrainlyAvatar';
import { useGameStore } from '@/store/gameStore';

interface BrainlyPanelProps {
  open: boolean;
  onClose: () => void;
  contextMessage?: string;
}

interface ChatMessage {
  sender: 'user' | 'brainly';
  text: string;
}

export type PersonalityMode = 'coach' | 'savage' | 'scientist';

const PERSONALITY_CONFIG: Record<PersonalityMode, { label: string; icon: typeof GraduationCap; desc: string }> = {
  coach: { label: 'Coach', icon: GraduationCap, desc: 'Motivational & encouraging' },
  savage: { label: 'Savage', icon: Flame, desc: 'Roasts & tough love' },
  scientist: { label: 'Scientist', icon: FlaskConical, desc: 'Analytical & data-driven' },
};

const INTRO_MESSAGES: Record<PersonalityMode, string> = {
  coach: "Hey champ! I'm BrainlyElla in Coach mode! 🧠💪 Let's crush those brain goals together! Ask me anything!",
  savage: "Oh look, someone finally showed up. I'm BrainlyElla in Savage mode. 🔥 Let's see if your brain can keep up with my roasts.",
  scientist: "Greetings. BrainlyElla here, operating in Scientist mode. 🧬 I'll provide data-driven cognitive analysis. What would you like to explore?",
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/brainly-chat`;

export function BrainlyPanel({ open, onClose, contextMessage }: BrainlyPanelProps) {
  const [personality, setPersonality] = useState<PersonalityMode>('coach');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'brainly', text: INTRO_MESSAGES.coach }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { brainlyEnabled, brainScore, brainLevel, peakScore, gameResults } = useGameStore();

  useEffect(() => {
    if (contextMessage && open && brainlyEnabled) {
      setMessages(prev => [...prev, { sender: 'brainly', text: contextMessage }]);
    }
  }, [contextMessage, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const switchPersonality = (mode: PersonalityMode) => {
    setPersonality(mode);
    setMessages([{ sender: 'brainly', text: INTRO_MESSAGES[mode] }]);
    setShowModes(false);
  };

  if (!open || !brainlyEnabled) return null;

  const send = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = input.trim();
    setInput('');

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsStreaming(true);

    const context = {
      brainScore,
      brainLevel,
      peakScore,
      gamesPlayed: gameResults.length,
      recentGames: gameResults.slice(-3).map(g => ({ game: g.game, score: g.score })),
      personality,
    };

    const apiMessages = newMessages.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: m.text,
    }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, context }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'BrainlyElla had a brain freeze!' }));
        setMessages(prev => [...prev, { sender: 'brainly', text: err.error || 'Oops! My neurons misfired. Try again! 🧠' }]);
        setIsStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantText = '';

      setMessages(prev => [...prev, { sender: 'brainly', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantText += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { sender: 'brainly', text: assistantText };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'brainly', text: "My synapses got tangled! Try again in a sec. 🧠" }]);
    }
    setIsStreaming(false);
  };

  const quickPrompts: Record<PersonalityMode, string[]> = {
    coach: ["How's my brain doing?", "Motivate me!", "Tips to improve"],
    savage: ["Roast my score", "Am I dumb?", "Rate my brain"],
    scientist: ["Analyze my data", "Brain fact", "Cognitive trends"],
  };

  const PersonalityIcon = PERSONALITY_CONFIG[personality].icon;

  return (
    <div className="fixed right-4 bottom-20 z-[100] w-[340px] max-h-[520px] animate-pop-in rounded-2xl border border-accent/25 bg-card/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 gradient-accent px-4 py-3 text-accent-foreground">
        <BrainlyAvatar size={28} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-sm font-bold tracking-wider">BrainlyElla</span>
            <button
              onClick={() => setShowModes(!showModes)}
              className="rounded-full bg-background/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider hover:bg-background/30 transition-colors flex items-center gap-0.5"
            >
              <PersonalityIcon className="h-2.5 w-2.5" />
              {PERSONALITY_CONFIG[personality].label}
            </button>
          </div>
          <span className="block text-[9px] opacity-80">AI Brain Companion · {PERSONALITY_CONFIG[personality].desc}</span>
        </div>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-background/20 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Personality mode selector */}
      {showModes && (
        <div className="border-b border-border bg-secondary/50 p-2 flex gap-1.5">
          {(Object.entries(PERSONALITY_CONFIG) as [PersonalityMode, typeof PERSONALITY_CONFIG.coach][]).map(([mode, config]) => {
            const ModeIcon = config.icon;
            return (
              <button
                key={mode}
                onClick={() => switchPersonality(mode)}
                className={`flex-1 rounded-lg py-2 px-2 text-center transition-all ${
                  personality === mode
                    ? 'gradient-accent text-accent-foreground'
                    : 'bg-background/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <ModeIcon className="h-4 w-4 mx-auto mb-0.5" />
                <span className="text-[9px] font-bold uppercase tracking-wider block">{config.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[300px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed
              ${msg.sender === 'user'
                ? 'gradient-accent text-accent-foreground border border-accent/30'
                : 'bg-secondary border border-border text-foreground'
              }`}>
              {msg.sender === 'brainly' && (
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> BrainlyElla · {PERSONALITY_CONFIG[personality].label}
                </span>
              )}
              {msg.text || (isStreaming ? <span className="typewriter-cursor">Thinking</span> : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 2 && (
        <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto hide-scrollbar">
          {quickPrompts[personality].map(p => (
            <button
              key={p}
              onClick={() => { setInput(p); }}
              className="whitespace-nowrap rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-[10px] font-semibold text-accent hover:bg-accent/10 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-t border-border p-3 bg-background/50">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Talk to BrainlyElla..."
          className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          rows={1}
          disabled={isStreaming}
        />
        <button
          onClick={send}
          disabled={isStreaming || !input.trim()}
          className="gradient-accent rounded-lg px-3 py-2 text-accent-foreground hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
