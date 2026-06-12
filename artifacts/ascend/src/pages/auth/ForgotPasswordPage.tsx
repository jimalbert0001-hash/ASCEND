import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { isMock } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isMock) {
      setTimeout(() => {
        setSent(true);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sequence Override</h2>
          <p className="text-muted-foreground mt-2">Reset operator passcode</p>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 shadow-xl">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm">Instructions transmitted to operator console.</p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/auth/login" data-testid="link-back-login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Operator ID (Email)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="operator@ascend.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                  data-testid="input-reset-email"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full font-bold tracking-widest uppercase mt-6" 
                disabled={loading}
                data-testid="button-reset"
              >
                {loading ? "Transmitting..." : "Transmit Override"}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Cancel override? <Link href="/auth/login" className="text-primary hover:underline font-medium" data-testid="link-cancel-reset">Return</Link>
        </p>
      </div>
    </div>
  );
}
