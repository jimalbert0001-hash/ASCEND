import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-green-500 mx-auto flex items-center justify-center text-white font-black text-2xl">
            A
          </div>
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            If an account exists, a password reset link has been sent.
          </p>
          <button
            onClick={() => setLocation("/auth/login")}
            className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-primary mx-auto flex items-center justify-center text-primary-foreground font-black text-2xl">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
          <p className="text-muted-foreground text-sm">Enter your email and we'll send you a reset link</p>
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
          <div className="text-center text-sm">
            <a href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Back to sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
