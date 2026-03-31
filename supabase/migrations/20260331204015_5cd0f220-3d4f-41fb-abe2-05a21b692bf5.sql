CREATE TABLE public.coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.coin_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.coin_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lives INTEGER NOT NULL DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_lives INTEGER NOT NULL DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_life_regen_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_protection BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE public.shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'skin',
  price INTEGER NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_limited BOOLEAN NOT NULL DEFAULT false,
  available_until TIMESTAMP WITH TIME ZONE,
  image_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view shop items" ON public.shop_items FOR SELECT TO authenticated USING (true);

CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.shop_items(id),
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON public.user_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON public.user_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);