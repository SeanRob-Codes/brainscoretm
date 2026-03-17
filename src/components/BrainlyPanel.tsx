import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/brainly-chat`;

export function BrainlyPanel({ open, onClose, contextMessage }: BrainlyPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'brainly', text: "Hey! I'm Brainly, your AI brain buddy! 🧠 Ask me anything about brain training, your scores, neuroscience, or just chat!" }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
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

  if (!open || !brainlyEnabled) return null;

  const send = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = input.trim();
    setInput('');

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsStreaming(true);

    // Build context for AI
    const context = {
      brainScore,
      brainLevel,
      peakScore,
      gamesPlayed: gameResults.length,
      recentGames: gameResults.slice(-3).map(g => ({ game: g.game, score: g.score })),
    };

    // Build API messages (last 10 for context)
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
        const err = await resp.json().catch(() => ({ error: 'Brainly had a brain freeze!' }));
        setMessages(prev => [...prev, { sender: 'brainly', text: err.error || 'Oops! My neurons misfired. Try again! 🧠' }]);
        setIsStreaming(false);
        return;
      }

      // Stream response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantText = '';

      // Add empty assistant message
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

  const quickPrompts = [
    "How's my brain doing?",
    "Give me a brain fact",
    "Tips to improve",
  ];

  return (
    <div className="fixed right-4 bottom-20 z-[100] w-[340px] max-h-[520px] animate-pop-in rounded-2xl border border-accent/25 bg-card/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 gradient-accent px-4 py-3 text-accent-foreground">
        <BrainlyAvatar size={28} />
        <div className="flex-1">
          <span className="font-display text-sm font-bold tracking-wider">Brainly AI</span>
          <span className="block text-[9px] opacity-80">Powered by AI · Your brain buddy</span>
        </div>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-background/20 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[340px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed
              ${msg.sender === 'user'
                ? 'gradient-accent text-accent-foreground border border-accent/30'
                : 'bg-secondary border border-border text-foreground'
              }`}>
              {msg.sender === 'brainly' && (
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> Brainly
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
          {quickPrompts.map(p => (
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
          placeholder="Talk to Brainly AI..."
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
