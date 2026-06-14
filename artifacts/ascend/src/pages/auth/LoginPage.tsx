export function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-lg bg-primary mx-auto flex items-center justify-center text-primary-foreground font-black text-2xl">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ASCEND</h1>
          <p className="text-muted-foreground text-sm">Your Personal Achievement Operating System</p>
        </div>
        <a
          href="/api/login"
          className="block w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors text-center"
        >
          Log in
        </a>
      </div>
    </div>
  );
}
