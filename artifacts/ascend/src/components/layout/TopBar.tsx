import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Flame, Bot } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/providers/AuthProvider";
import { useStatsStore } from "@/stores/stats.store";
import { cn } from "@/lib/utils";

export function TopBar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const currentStreak = useStatsStore((s) => s.currentStreak);

  const getPageTitle = () => {
    switch (location) {
      case '/': return 'Dashboard';
      case '/academics': return 'Academics';
      case '/startup': return 'Startup';
      case '/chess': return 'Chess';
      case '/guitar': return 'Guitar';
      case '/ai-mentor': return 'AI Mentor';
      case '/achievements': return 'Achievements';
      case '/profile': return 'Profile';
      case '/settings': return 'Settings';
      default: return 'ASCEND';
    }
  };

  const initials = user?.name
    ? user.name.trim().split(/\s+/).filter(Boolean).map((p) => p[0].toUpperCase()).filter((_, i, arr) => i === 0 || i === arr.length - 1).join('')
    : '?';

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <h1 className="text-xl font-bold tracking-tight">{getPageTitle()}</h1>

      <div className="flex items-center gap-4 md:gap-6">
        <Link href="/ai-mentor" className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-sm font-bold text-accent-foreground shadow-sm transition-all",
          location === '/ai-mentor' && "bg-primary/10 text-primary ring-1 ring-primary"
        )}>
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">AI Mentor</span>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-sm font-bold text-accent-foreground shadow-sm">
          <Flame className={cn("w-4 h-4", currentStreak > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-muted-foreground")} />
          <span>{currentStreak} days</span>
        </div>

        <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
