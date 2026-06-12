import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { isMock, user } = useAuth();

  useEffect(() => {
    if (!isMock && user) setLocation("/");
  }, [user, isMock, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isMock) {
      setTimeout(() => {
        window.location.reload(); // Simple way to trigger mock auth update
      }, 500);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setLocation("/");
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
          <div className="w-12 h-12 rounded-lg bg-primary mx-auto mb-4 flex items-center justify-center text-primary-foreground font-black text-2xl">
            A
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Mission Control</h2>
          <p className="text-muted-foreground mt-2">Initialize sequence</p>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
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
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Passcode</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline" data-testid="link-forgot-password">
                  Override sequence
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
                data-testid="input-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full font-bold tracking-widest uppercase mt-6" 
              disabled={loading}
              data-testid="button-login"
            >
              {loading ? "Authenticating..." : "Initialize"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          New operator? <Link href="/auth/register" className="text-primary hover:underline font-medium" data-testid="link-register">Request clearance</Link>
        </p>
      </div>
    </div>
  );
}
