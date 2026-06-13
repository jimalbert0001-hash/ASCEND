import { useEffect } from "react";

export function RegisterPage() {
  useEffect(() => {
    window.location.href = "/api/login";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 rounded-lg bg-primary mx-auto mb-4 flex items-center justify-center text-primary-foreground font-black text-2xl">
          A
        </div>
        <p className="text-muted-foreground animate-pulse tracking-widest text-sm">REDIRECTING</p>
      </div>
    </div>
  );
}
