import { Card } from "@/components/ui/card";
import { Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { apiFetch } from "@/lib/api-fetch";

export function DailyScoreCard({ onReviewClick }: { onReviewClick?: () => void }) {
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [hasReview, setHasReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id ?? "mock-user-1";

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/ai/context?userId=${userId}`);
        if (res.ok) {
          const ctx = await res.json();
          const lastScore = ctx?.reviews?.lastDailyScore ?? 0;
          setScore(lastScore);
          setHasReview(lastScore > 0);
        }
      } catch { }
      finally { setLoading(false); }
    })();
  }, [userId]);

  useEffect(() => {
    if (loading) return;
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += score / steps;
      if (current >= score) { setDisplayScore(score); clearInterval(timer); }
      else setDisplayScore(Math.floor(current));
    }, stepTime);
    return () => clearInterval(timer);
  }, [score, loading]);

  const scoreColor = score >= 800 ? "text-emerald-400" : score >= 600 ? "text-primary" : score >= 400 ? "text-amber-400" : "text-muted-foreground";

  return (
    <Card className="p-6 bg-card border-border shadow-sm flex flex-col justify-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2 relative z-10">
        <Trophy className="w-4 h-4 text-primary" /> Daily Score
      </p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-5xl md:text-6xl font-black tracking-tighter tabular-nums relative z-10 ${scoreColor}`}
      >
        {loading ? "—" : displayScore}
      </motion.div>

      {!loading && (
        <div className="mt-3 relative z-10">
          {hasReview ? (
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
                Yesterday's score
              </span>
              {score >= 800 && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  🔥 High performer
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={onReviewClick}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
              No review yet — log today's
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
