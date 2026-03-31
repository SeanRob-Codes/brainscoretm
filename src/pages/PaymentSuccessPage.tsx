import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { Coins, CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addCoins } = useGameStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [coinsAdded, setCoinsAdded] = useState(0);

  useEffect(() => {
    const sessionId = params.get('session_id');
    const coins = parseInt(params.get('coins') || '0');
    if (!sessionId) { setStatus('error'); return; }

    supabase.functions.invoke('verify-coin-purchase', {
      body: { sessionId },
    }).then(({ data, error }) => {
      if (error || !data?.success) {
        setStatus('error');
        return;
      }
      addCoins(data.coins || coins);
      setCoinsAdded(data.coins || coins);
      setStatus('success');
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center space-y-4">
        {status === 'verifying' && (
          <>
            <Loader2 className="h-12 w-12 text-accent mx-auto animate-spin" />
            <h2 className="font-display text-lg font-bold">Verifying Purchase...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <h2 className="font-display text-lg font-bold">Purchase Complete!</h2>
            <div className="flex items-center justify-center gap-2 text-warning">
              <Coins className="h-6 w-6" />
              <span className="font-display text-2xl font-bold">+{coinsAdded.toLocaleString()}</span>
            </div>
            <p className="text-sm text-muted-foreground">BrainCoins have been added to your account</p>
            <button onClick={() => navigate('/')} className="w-full mt-4 gradient-accent rounded-xl py-3 text-sm font-bold text-accent-foreground">
              Back to BrainScore
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="font-display text-lg font-bold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">Please contact support if you were charged.</p>
            <button onClick={() => navigate('/')} className="w-full mt-4 border border-border rounded-xl py-3 text-sm font-bold">
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
