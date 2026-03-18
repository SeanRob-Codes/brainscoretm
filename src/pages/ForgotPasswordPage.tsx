import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Brain, ArrowLeft, Loader2, Mail } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent glow-accent">
            <Brain className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-[0.15em] uppercase text-foreground">Reset Password</h1>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center space-y-3">
            <Mail className="h-10 w-10 text-success mx-auto" />
            <h2 className="font-display text-sm font-bold tracking-wider">Check Your Email</h2>
            <p className="text-xs text-muted-foreground">We sent a password reset link to <strong className="text-foreground">{email}</strong>. Click the link to reset your password.</p>
            <button onClick={onBack} className="text-xs text-accent font-semibold hover:underline">← Back to Login</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <p className="text-xs text-muted-foreground text-center">Enter your email and we'll send you a reset link.</p>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="brain@example.com"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {error && <p className="text-xs text-destructive text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-accent rounded-xl py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Reset Link
            </button>
            <button type="button" onClick={onBack} className="w-full text-center text-xs text-muted-foreground hover:text-accent">
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
