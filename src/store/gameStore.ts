import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'red' | 'cyan' | 'purple';
export type OutfitId = 'default' | 'scientist' | 'viking' | 'cyber' | 'king' | 'athlete';

export interface GameResult {
  game: string;
  score: number;
  date: string;
  detail?: string;
}

export interface HistoryEntry {
  date: string;
  brainScore: number;
  results: GameResult[];
}

export interface OutfitInfo {
  id: OutfitId;
  name: string;
  requiredScore: number;
  description: string;
}

export const OUTFITS: OutfitInfo[] = [
  { id: 'default', name: 'Smooth Brain', requiredScore: 0, description: 'Your starter look' },
  { id: 'scientist', name: 'Lab Coat', requiredScore: 600, description: 'Earned at 600 BrainScore' },
  { id: 'athlete', name: 'Athlete', requiredScore: 750, description: 'Earned at 750 BrainScore' },
  { id: 'viking', name: 'Viking', requiredScore: 900, description: 'Earned at 900 BrainScore' },
  { id: 'cyber', name: 'Cyber Visor', requiredScore: 1100, description: 'Earned at 1100 BrainScore' },
  { id: 'king', name: 'Brain King', requiredScore: 1400, description: 'Earned at 1400 BrainScore' },
];

interface GameStore {
  // Score
  brainScore: number;
  peakScore: number;
  brainLevel: string;
  
  // Theme
  theme: ThemeColor;
  setTheme: (t: ThemeColor) => void;
  
  // Brainly
  brainlyEnabled: boolean;
  setBrainlyEnabled: (v: boolean) => void;
  selectedOutfit: OutfitId;
  setSelectedOutfit: (id: OutfitId) => void;
  
  // Games
  gameResults: GameResult[];
  addGameResult: (r: GameResult) => void;
  
  // History
  history: HistoryEntry[];
  saveToHistory: () => void;
  
  // Gauntlet
  gauntletHighScore: number;
  setGauntletHighScore: (s: number) => void;
  
  // Multiplier
  nextMultiplier: number;
  setNextMultiplier: (m: number) => void;
  
  // Helpers
  resetDay: () => void;
  getUnlockedOutfits: () => OutfitId[];
  syncFromCloud: (score: number, peak: number, gauntletHigh: number) => void;
}

function getBrainLevel(score: number): string {
  if (score < 550) return 'Smooth Brain';
  if (score < 700) return 'Wrinkled Apprentice';
  if (score < 850) return 'Synapse Soldier';
  if (score < 1000) return 'Cortex Commander';
  if (score < 1200) return 'Neural Architect';
  return 'Galaxy Brain';
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      brainScore: 500,
      peakScore: 500,
      brainLevel: 'Smooth Brain',
      theme: 'red',
      setTheme: (t) => set({ theme: t }),
      brainlyEnabled: true,
      setBrainlyEnabled: (v) => set({ brainlyEnabled: v }),
      selectedOutfit: 'default',
      setSelectedOutfit: (id) => set({ selectedOutfit: id }),
      gameResults: [],
      addGameResult: (r) => {
        const results = [...get().gameResults, r];
        // Recalculate brainScore based on game results
        let bonus = 0;
        results.forEach(g => {
          bonus += Math.round(g.score * 0.15);
        });
        const newScore = Math.min(2000, 500 + bonus);
        const peak = Math.max(get().peakScore, newScore);
        set({
          gameResults: results,
          brainScore: newScore,
          peakScore: peak,
          brainLevel: getBrainLevel(newScore),
        });
      },
      history: [],
      saveToHistory: () => {
        const { brainScore, gameResults, history } = get();
        const entry: HistoryEntry = {
          date: new Date().toLocaleDateString(),
          brainScore,
          results: [...gameResults],
        };
        set({ history: [entry, ...history].slice(0, 50) });
      },
      gauntletHighScore: 0,
      setGauntletHighScore: (s) => set({ gauntletHighScore: Math.max(s, get().gauntletHighScore) }),
      nextMultiplier: 1,
      setNextMultiplier: (m) => set({ nextMultiplier: m }),
      resetDay: () => set({ gameResults: [], brainScore: 500, brainLevel: 'Smooth Brain', nextMultiplier: 1 }),
      syncFromCloud: (score, peak, gauntletHigh) => set({
        brainScore: score,
        peakScore: peak,
        brainLevel: getBrainLevel(score),
        gauntletHighScore: Math.max(gauntletHigh, get().gauntletHighScore),
      }),
      getUnlockedOutfits: () => {
        const peak = get().peakScore;
        return OUTFITS.filter(o => peak >= o.requiredScore).map(o => o.id);
      },
    }),
    { name: 'brainscore-store' }
  )
);
