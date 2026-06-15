import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { setTokens } from '@/lib/api-fetch';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setAuthError(false);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setAuthError(true);
          setError('Incorrect email or password. Please try again.');
        } else {
          setError(data.error || 'Login failed. Please try again.');
        }
        return;
      }
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);
      window.location.href = data.user?.name ? '/' : '/onboarding';
    } catch (err) {
      const msg = err instanceof TypeError ? 'Unable to reach the server. Please check your connection and try again.' : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 bg-background ${
      hasError
        ? 'border-destructive focus:ring-destructive/40'
        : 'border-input focus:ring-ring'
    }`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-lg bg-primary mx-auto flex items-center justify-center text-primary-foreground font-black text-2xl">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ASCEND</h1>
          <p className="text-muted-foreground text-sm">Your Personal Achievement Operating System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setAuthError(false); setError(''); }}
              className={inputClass(authError)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(false); setError(''); }}
              className={inputClass(authError)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </div>
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
