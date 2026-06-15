import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-fetch';
import { useAuth } from '@/providers/AuthProvider';

export function OnboardingPage() {
  const { refreshUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last) {
      setError('Please enter both your first and last name.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify({ full_name: `${first} ${last}` }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to save your name. Please try again.');
        return;
      }
      await refreshUser();
      window.location.href = '/';
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-lg bg-primary mx-auto flex items-center justify-center text-primary-foreground font-black text-2xl">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to ASCEND</h1>
          <p className="text-muted-foreground text-sm">
            Let's get started. What's your name?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="first-name" className="text-sm font-medium">
                First name
              </label>
              <input
                id="first-name"
                type="text"
                required
                autoFocus
                autoComplete="given-name"
                placeholder="Prince"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setError(''); }}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="last-name" className="text-sm font-medium">
                Last name
              </label>
              <input
                id="last-name"
                type="text"
                required
                autoComplete="family-name"
                placeholder="Kumar"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setError(''); }}
                className={inputClass}
              />
            </div>
          </div>

          {firstName.trim() && lastName.trim() && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                {firstName.trim()[0].toUpperCase()}{lastName.trim()[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{firstName.trim()} {lastName.trim()}</p>
                <p className="text-xs text-muted-foreground">Your profile initials will be <span className="font-bold text-primary">{firstName.trim()[0].toUpperCase()}{lastName.trim()[0].toUpperCase()}</span></p>
              </div>
            </div>
          )}

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
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
