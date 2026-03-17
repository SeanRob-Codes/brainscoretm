import { useGameStore } from '@/store/gameStore';
import { BookOpen, Beaker, Calculator, Globe, History, Lightbulb } from 'lucide-react';

const SUBJECTS = [
  { id: 'general', label: 'General', icon: Lightbulb, desc: 'Mixed brain teasers' },
  { id: 'science', label: 'Science', icon: Beaker, desc: 'Physics, chemistry, biology' },
  { id: 'math', label: 'Math', icon: Calculator, desc: 'Numbers & patterns' },
  { id: 'geography', label: 'Geography', icon: Globe, desc: 'World knowledge' },
  { id: 'history', label: 'History', icon: History, desc: 'Past events & people' },
  { id: 'language', label: 'Language', icon: BookOpen, desc: 'Words & vocabulary' },
];

interface SubjectSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function SubjectSelector({ selected, onSelect }: SubjectSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Subject Focus</span>
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
        {SUBJECTS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all
              ${selected === id
                ? 'gradient-accent border-accent text-accent-foreground'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-accent/30'
              }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { SUBJECTS };
