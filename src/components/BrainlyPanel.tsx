import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { BrainlyAvatar } from './BrainlyAvatar';
import { useGameStore } from '@/store/gameStore';

const BRAINLY_RESPONSES = [
  "Not bad for a smooth brain! Keep grinding those synapses. 🧠",
  "Your neurons are firing on all cylinders today!",
  "I've seen better... just kidding, you're doing great!",
  "Pro tip: sleep is basically a brain spa. Get some rest.",
  "Every game you play, I grow smarter too. We're in this together!",
  "Fun fact: your brain uses 20% of your body's energy. Feed me! 🍕",
  "That score? *chef's kiss* 🤌",
  "You know what's wild? Your brain has ~86 billion neurons. Use 'em!",
  "I'm just a brain with legs, but even I'm impressed.",
  "Keep it up and you'll unlock my Viking helmet. It's pretty rad.",
];

interface BrainlyPanelProps {
  open: boolean;
  onClose: () => void;
  contextMessage?: string;
}

interface ChatMessage {
  sender: 'user' | 'brainly';
  text: string;
}

export function BrainlyPanel({ open, onClose, contextMessage }: BrainlyPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'brainly', text: "Hey! I'm Brainly, your brain buddy. Ask me anything or just chat!" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { brainlyEnabled } = useGameStore();

  useEffect(() => {
    if (contextMessage && open && brainlyEnabled) {
      setMessages(prev => [...prev, { sender: 'brainly', text: contextMessage }]);
    }
  }, [contextMessage, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!open || !brainlyEnabled) return null;

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    
    setTimeout(() => {
      const response = BRAINLY_RESPONSES[Math.floor(Math.random() * BRAINLY_RESPONSES.length)];
      setMessages(prev => [...prev, { sender: 'brainly', text: response }]);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="fixed right-4 bottom-20 z-[100] w-[340px] max-h-[460px] animate-pop-in rounded-2xl border border-accent/25 bg-card/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 gradient-accent px-4 py-3 text-accent-foreground">
        <BrainlyAvatar size={28} />
        <span className="flex-1 font-display text-sm font-bold tracking-wider">Brainly</span>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-background/20 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[300px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed
              ${msg.sender === 'user'
                ? 'gradient-accent text-accent-foreground border border-accent/30'
                : 'bg-secondary border border-border text-foreground'
              }`}>
              {msg.sender === 'brainly' && (
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Brainly</span>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2 border-t border-border p-3 bg-background/50">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Talk to Brainly..."
          className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          rows={1}
        />
        <button onClick={send} className="gradient-accent rounded-lg px-4 py-2 text-xs font-bold text-accent-foreground tracking-wider uppercase hover:brightness-110 transition-all">
          Send
        </button>
      </div>
    </div>
  );
}
