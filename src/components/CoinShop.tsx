import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Coins, ShoppingCart, Sparkles, Clock, Crown, Zap, Shield, Star, Heart, X, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const COIN_PACKS = [
  { id: 'pack-100', coins: 100, price: '$0.99', popular: false },
  { id: 'pack-500', coins: 500, price: '$3.99', popular: true },
  { id: 'pack-1200', coins: 1200, price: '$7.99', popular: false },
  { id: 'pack-3000', coins: 3000, price: '$14.99', popular: false },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  skin: Crown,
  powerup: Zap,
  boost: Star,
};

const CATEGORY_LABELS: Record<string, string> = {
  skin: 'Skins',
  powerup: 'Power-Ups',
  boost: 'Boosts',
};

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  is_premium: boolean;
  is_limited: boolean;
  available_until: string | null;
  image_key: string | null;
}

export function CoinShop({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { coins, spendCoins, addCoins, refillLives, setNextMultiplier, addSecondChance, setStreakProtection } = useGameStore();
  const { user } = useAuth();
  const [tab, setTab] = useState<'shop' | 'coins'>('shop');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    // Load shop items
    supabase.from('shop_items').select('*').then(({ data }) => {
      if (data) setItems(data as ShopItem[]);
    });
    // Load user purchases
    supabase.from('user_purchases').select('item_id').eq('user_id', user.id).then(({ data }) => {
      if (data) setPurchased(new Set(data.map((p: any) => p.item_id)));
    });
  }, [open, user]);

  const handleBuyItem = async (item: ShopItem) => {
    if (!user) return;
    if (purchased.has(item.id) && item.category === 'skin') return;
    if (!spendCoins(item.price)) return;
    
    setBuying(item.id);
    
    // Record purchase
    await supabase.from('user_purchases').insert({ user_id: user.id, item_id: item.id });
    await supabase.from('coin_transactions').insert({ user_id: user.id, amount: -item.price, reason: `Bought ${item.name}` });
    await supabase.from('profiles').update({ coins: coins - item.price }).eq('user_id', user.id);
    
    // Apply effect
    if (item.image_key === 'life-refill') refillLives();
    else if (item.image_key === '2x-boost') setNextMultiplier(2);
    else if (item.image_key === '3x-boost') setNextMultiplier(3);
    else if (item.image_key === 'second-chance') addSecondChance();
    else if (item.image_key === 'streak-shield') setStreakProtection(true);
    
    if (item.category === 'skin') setPurchased(new Set([...purchased, item.id]));
    
    setBuying(null);
  };

  const handleBuyCoins = async (pack: typeof COIN_PACKS[0]) => {
    // In production this would open Stripe
    // For now, simulate purchase
    addCoins(pack.coins);
    if (user) {
      await supabase.from('coin_transactions').insert({ user_id: user.id, amount: pack.coins, reason: `Purchased ${pack.coins} coin pack` });
      await supabase.from('profiles').update({ coins: coins + pack.coins }).eq('user_id', user.id);
    }
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.category === filter);
  const limitedItems = items.filter(i => i.is_limited && i.available_until && new Date(i.available_until) > new Date());

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md max-h-[85vh] rounded-t-2xl sm:rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-accent" />
            <h2 className="font-display text-sm font-bold tracking-wider">BRAIN SHOP</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-warning/20 px-3 py-1">
              <Coins className="h-3.5 w-3.5 text-warning" />
              <span className="font-display text-xs font-bold text-warning">{coins}</span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button onClick={() => setTab('shop')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${tab === 'shop' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'}`}>
            Items
          </button>
          <button onClick={() => setTab('coins')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${tab === 'coins' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'}`}>
            Buy Coins
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'coins' ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Get BrainCoins to unlock skins, boosts, and power-ups!</p>
              {COIN_PACKS.map(pack => (
                <button
                  key={pack.id}
                  onClick={() => handleBuyCoins(pack)}
                  className={`w-full rounded-xl border-2 p-4 flex items-center gap-4 transition-all hover:border-accent/50 ${pack.popular ? 'border-accent/40 bg-accent/5' : 'border-border bg-secondary'}`}
                >
                  <div className="rounded-lg bg-warning/20 p-2.5">
                    <Coins className="h-6 w-6 text-warning" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold">{pack.coins.toLocaleString()}</span>
                      <span className="text-xs text-warning">💰</span>
                      {pack.popular && <span className="text-[9px] uppercase tracking-wider bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">Best Value</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">BrainCoins</span>
                  </div>
                  <span className="font-display text-sm font-bold text-accent">{pack.price}</span>
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Limited Time Items */}
              {limitedItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-warning font-bold">
                    <Clock className="h-3 w-3" /> Limited Time
                  </div>
                  {limitedItems.map(item => (
                    <div key={item.id} className="rounded-xl border-2 border-warning/30 bg-warning/5 p-3 flex items-center gap-3">
                      <div className="rounded-lg bg-warning/20 p-2">
                        <Sparkles className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.description}</p>
                        {item.available_until && (
                          <p className="text-[9px] text-warning mt-0.5">
                            Expires {new Date(item.available_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={coins < item.price || buying === item.id || (purchased.has(item.id) && item.category === 'skin')}
                        className="rounded-lg gradient-accent px-3 py-1.5 text-[10px] font-bold text-accent-foreground disabled:opacity-40"
                      >
                        {purchased.has(item.id) && item.category === 'skin' ? 'Owned' : `${item.price} 💰`}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                {['all', 'skin', 'powerup', 'boost'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all
                      ${filter === cat ? 'gradient-accent text-accent-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 gap-2">
                {filteredItems.filter(i => !i.is_limited).map(item => {
                  const Icon = CATEGORY_ICONS[item.category] || Star;
                  const owned = purchased.has(item.id) && item.category === 'skin';
                  return (
                    <div key={item.id} className={`rounded-xl border p-3 space-y-2 ${owned ? 'border-success/30 bg-success/5' : 'border-border bg-secondary'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg p-1.5 ${item.is_premium ? 'bg-warning/20' : 'bg-accent/20'}`}>
                          <Icon className={`h-4 w-4 ${item.is_premium ? 'text-warning' : 'text-accent'}`} />
                        </div>
                        {item.is_premium && <Crown className="h-3 w-3 text-warning" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{item.name}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={coins < item.price || buying === item.id || owned}
                        className="w-full rounded-lg border border-border py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all hover:border-accent/50 disabled:opacity-40"
                      >
                        {owned ? '✓ Owned' : `${item.price} 💰`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CoinsDisplay() {
  const { coins } = useGameStore();
  return (
    <div className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1">
      <Coins className="h-3 w-3 text-warning" />
      <span className="font-display text-[10px] font-bold text-warning">{coins}</span>
    </div>
  );
}
