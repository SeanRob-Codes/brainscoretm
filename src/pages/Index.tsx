import { useState, useEffect } from 'react';
import { BottomNav, type TabId } from '@/components/BottomNav';
import { BrainlyPanel } from '@/components/BrainlyPanel';
import { BrainlyAvatar } from '@/components/BrainlyAvatar';
import { ScrollToTop } from '@/components/ScrollToTop';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { AudioSystem } from '@/components/AudioSystem';
import { CoinShop } from '@/components/CoinShop';
import { LivesLockScreen } from '@/components/LivesSystem';
import { DashboardPage } from './DashboardPage';
import { GamesPage } from './GamesPage';
import { GauntletPage } from './GauntletPage';
import { LeaderboardPage } from './LeaderboardPage';
import { SocialPage } from './SocialPage';
import { PlusPage } from './PlusPage';
import { SettingsPage } from './SettingsPage';
import { useGameStore } from '@/store/gameStore';
import { useProfileSync } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Index() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [brainlyOpen, setBrainlyOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const { theme, brainlyEnabled, lives } = useGameStore();
  const { user } = useAuth();

  useProfileSync();

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles')
      .select('onboarding_complete')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data && !data.onboarding_complete) {
          setShowOnboarding(true);
        }
      });
  }, [user]);

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
      case 'leaderboard': return <LeaderboardPage />;
      case 'social': return <SocialPage />;
      case 'plus': return <PlusPage />;
      case 'settings': return <SettingsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
      
      {/* Lives Lock Screen */}
      {lives <= 0 && (tab === 'games' || tab === 'gauntlet') && (
        <LivesLockScreen 
          onRefill={() => {}} 
          onBuyCoins={() => setShopOpen(true)} 
        />
      )}

      {/* Coin Shop */}
      <CoinShop open={shopOpen} onClose={() => setShopOpen(false)} />

      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent font-display text-xs font-extrabold text-accent-foreground">
              B
            </div>
            <span className="font-display text-xs font-bold tracking-[0.12em] uppercase text-foreground">BrainScore™</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShopOpen(true)} className="text-[10px] font-display font-bold text-warning flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 hover:bg-warning/20 transition-colors">
              🛒 Shop
            </button>
            <BrainlyAvatar size={28} className="opacity-80" />
          </div>
        </div>
      </header>

      <main className="px-3 pb-20 pt-3 transition-all duration-300 ease-out">
        {renderPage()}
      </main>

      <BottomNav active={tab} onTabChange={setTab} />
      <ScrollToTop />
      <AudioSystem />

      {brainlyEnabled && (
        <>
          <button
            onClick={() => setBrainlyOpen(!brainlyOpen)}
            className="fixed right-3 bottom-16 z-40 h-12 w-12 rounded-full gradient-accent shadow-lg glow-accent flex items-center justify-center hover:scale-105 transition-transform"
          >
            <BrainlyAvatar size={30} />
          </button>
          <BrainlyPanel open={brainlyOpen} onClose={() => setBrainlyOpen(false)} />
        </>
      )}
    </div>
  );
}
