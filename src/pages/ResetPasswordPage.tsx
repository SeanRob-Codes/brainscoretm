import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Eye, EyeOff, Loader2, Check } from 'lucide-react';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/20 mx-auto">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h1 className="font-display text-lg font-bold tracking-wider">Password Updated!</h1>
          <p className="text-sm text-muted-foreground">Your password has been reset. You're now logged in.</p>
          <a href="/" className="inline-block gradient-accent rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent glow-accent">
            <Brain className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-[0.15em] uppercase text-foreground">New Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <p className="text-xs text-muted-foreground text-center">Enter your new password below.</p>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">New Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-accent rounded-xl py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
