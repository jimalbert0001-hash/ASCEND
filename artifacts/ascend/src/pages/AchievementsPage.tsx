import { useState, useEffect } from "react";
import { Trophy, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAchievements, FrontendAchievement } from "@/lib/achievements-supabase";
import { useAuth } from "@/providers/AuthProvider";

export function AchievementsPage() {
  const [achievements, setAchievements] = useState<FrontendAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id ?? "mock-user-1";

  useEffect(() => {
    setLoading(true);
    getAchievements(userId).then(data => {
      setAchievements(data);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Achievements</h2>
        <p className="text-muted-foreground mt-1">Milestones, streaks, and mastery.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-5 bg-muted/50 border-dashed animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map(achievement => (
            <Card
              key={achievement.id}
              className={cn(
                "p-5 flex flex-col items-center text-center transition-all",
                achievement.earned
                  ? "bg-card border-primary/20 hover:border-primary/50 hover:shadow-md"
                  : "bg-muted/50 border-dashed opacity-70 grayscale-[0.8]"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                achievement.earned ? "bg-primary/20" : "bg-muted-foreground/20"
              )}>
                {achievement.earned ? (
                  <Trophy className="w-6 h-6 text-primary" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <h4 className={cn("font-bold text-sm mb-1", achievement.earned ? "text-foreground" : "text-muted-foreground")}>
                {achievement.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>
              {achievement.earned && achievement.date && (
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary/70 mt-4">
                  {new Date(achievement.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
