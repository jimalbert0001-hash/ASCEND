import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export function LoginPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        window.location.href = "/";
      } else {
        window.location.href = "/api/login";
      }
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="w-12 h-12 rounded-lg bg-primary mx-auto mb-4 flex items-center justify-center text-primary-foreground font-black text-2xl">
          A
        </div>
        <p className="text-muted-foreground animate-pulse tracking-widest text-sm">INITIALIZING</p>
      </div>
    </div>
  );
}
