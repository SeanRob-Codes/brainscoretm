import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGameStore, type ThemeColor, type OutfitId } from '@/store/gameStore';

export function useProfileSync() {
  const { user } = useAuth();
  const store = useGameStore();

  // Load profile on login
  useEffect(() => {
    if (!user) return;
    
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        store.setTheme(data.selected_theme as ThemeColor);
        store.setSelectedOutfit(data.selected_outfit as OutfitId);
        store.setBrainlyEnabled(data.brainly_enabled);
        if (data.brain_score !== store.brainScore || data.peak_score !== store.peakScore) {
          const bestScore = Math.max(data.brain_score, store.brainScore);
          const bestPeak = Math.max(data.peak_score, store.peakScore);
          store.syncFromCloud(bestScore, bestPeak, data.gauntlet_high_score);
        }
      }
    };
    load();
  }, [user?.id]);

  // Save profile changes to cloud (including last_active_at)
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      supabase.from('profiles').update({
        selected_theme: store.theme,
        selected_outfit: store.selectedOutfit,
        brainly_enabled: store.brainlyEnabled,
        brain_score: store.brainScore,
        peak_score: store.peakScore,
        gauntlet_high_score: store.gauntletHighScore,
        last_login_date: today,
        last_active_at: new Date().toISOString(),
      }).eq('user_id', user.id).then(() => {});
    }, 1000);
    return () => clearTimeout(timeout);
  }, [user?.id, store.theme, store.selectedOutfit, store.brainlyEnabled, store.brainScore, store.peakScore, store.gauntletHighScore]);
}

export function useSaveHistory() {
  const { user } = useAuth();
  
  return async (brainScore: number, gamesPlayed: number, gameResults: any[]) => {
    if (!user) return;
    await supabase.from('score_history').insert({
      user_id: user.id,
      brain_score: brainScore,
      games_played: gamesPlayed,
      game_results: gameResults,
    });
  };
}
