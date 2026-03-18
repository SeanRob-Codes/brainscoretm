import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Brain, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ForgotPasswordPage } from './ForgotPasswordPage';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  if (mode === 'forgot') {
    return <ForgotPasswordPage onBack={() => setMode('login')} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'signup') {
      if (!username.trim()) { setError('Username is required'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
      const { error } = await signUp(email, password, username.trim());
      if (error) setError(error);
      else setSuccess('Check your email to confirm your account!');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent glow-accent">
            <Brain className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-[0.15em] uppercase text-foreground">BrainScore™</h1>
          <p className="text-xs text-muted-foreground text-center">Train your brain. Track your score. Level up.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-display text-sm font-bold tracking-wider text-center uppercase">
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </h2>

          {mode === 'signup' && (
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="BrainChamp99"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                autoComplete="username"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="brain@example.com"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <button type="button" onClick={() => setMode('forgot')} className="block w-full text-right text-[11px] text-accent hover:underline">
              Forgot password?
            </button>
          )}

          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          {success && <p className="text-xs text-success text-center">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-accent rounded-xl py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            className="text-accent font-semibold hover:underline"
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
