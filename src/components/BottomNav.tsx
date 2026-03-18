import { Home, Gamepad2, Flame, Trophy, Users, Settings, Star } from 'lucide-react';

export type TabId = 'dashboard' | 'games' | 'gauntlet' | 'leaderboard' | 'social' | 'plus' | 'settings';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'gauntlet', label: 'Gauntlet', icon: Flame },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'plus', label: 'Plus', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface BottomNavProps {
  active: TabId;
  onTabChange: (id: TabId) => void;
}

export function BottomNav({ active, onTabChange }: BottomNavProps) {
  const handleClick = (id: TabId) => {
    if (id === active && (id === 'games' || id === 'gauntlet')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onTabChange(id);
    }
  };

  return (
    <nav className="fixed left-0 right-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md safe-area-pb">
      <div className="flex justify-between gap-0.5 px-1 py-1.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[9px] font-semibold uppercase tracking-wider transition-all
              ${active === id
                ? 'gradient-accent text-accent-foreground border border-accent/30 shadow-md'
                : id === 'plus'
                ? 'text-warning border border-transparent hover:text-foreground'
                : 'text-muted-foreground border border-transparent hover:text-foreground'
              }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
