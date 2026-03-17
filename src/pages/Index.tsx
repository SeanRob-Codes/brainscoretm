import { useState, useEffect } from 'react';
import { BottomNav, type TabId } from '@/components/BottomNav';
import { BrainlyPanel } from '@/components/BrainlyPanel';
import { BrainlyAvatar } from '@/components/BrainlyAvatar';
import { ScrollToTop } from '@/components/ScrollToTop';
import { DashboardPage } from './DashboardPage';
import { GamesPage } from './GamesPage';
import { GauntletPage } from './GauntletPage';
import { HistoryPage } from './HistoryPage';
import { PlusPage } from './PlusPage';
import { SettingsPage } from './SettingsPage';
import { useGameStore } from '@/store/gameStore';
import { useProfileSync } from '@/hooks/useProfile';

export default function Index() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [brainlyOpen, setBrainlyOpen] = useState(false);
  const { theme, brainlyEnabled } = useGameStore();

  // Sync profile with cloud
  useProfileSync();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-cyan', 'theme-purple');
    if (theme === 'cyan') root.classList.add('theme-cyan');
    if (theme === 'purple') root.classList.add('theme-purple');
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  const renderPage = () => {
    switch (tab) {
      case 'dashboard': return <DashboardPage />;
      case 'games': return <GamesPage />;
      case 'gauntlet': return <GauntletPage />;
      case 'history': return <HistoryPage />;
      case 'plus': return <PlusPage />;
      case 'settings': return <SettingsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent font-display text-sm font-extrabold text-accent-foreground">
              BS
            </div>
            <span className="font-display text-sm font-bold tracking-[0.15em] uppercase text-foreground">BrainScore™</span>
          </div>
          <div className="flex items-center gap-2">
            <BrainlyAvatar size={32} className="opacity-80" />
          </div>
        </div>
      </header>

      <main className="px-4 pb-24 pt-4">
        {renderPage()}
      </main>

      <BottomNav active={tab} onTabChange={setTab} />
      <ScrollToTop />

      {brainlyEnabled && (
        <>
          <button
            onClick={() => setBrainlyOpen(!brainlyOpen)}
            className="fixed right-4 bottom-20 z-40 h-14 w-14 rounded-full gradient-accent shadow-lg glow-accent flex items-center justify-center hover:scale-105 transition-transform"
          >
            <BrainlyAvatar size={36} />
          </button>
          <BrainlyPanel open={brainlyOpen} onClose={() => setBrainlyOpen(false)} />
        </>
      )}
    </div>
  );
}
