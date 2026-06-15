import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { useStreakStore } from "@/stores/streak.store";
import { motion } from "framer-motion";

export function StreakCounter() {
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const longestStreak = useStreakStore((s) => s.longestStreak);
  const hasLoggedToday = useStreakStore((s) => s.hasLoggedToday);
  const loggedToday = hasLoggedToday();

  const atRisk = currentStreak > 0 && !loggedToday;

  return (
    <Card className="p-6 bg-card border-border shadow-sm flex flex-col justify-center relative overflow-hidden group">
      <div
        className={`absolute -bottom-8 -right-8 w-40 h-40 rounded-full blur-3xl transition-all ${
          atRisk
            ? 'bg-red-500/15 group-hover:bg-red-500/25'
            : 'bg-orange-500/10 group-hover:bg-orange-500/20'
        }`}
      />

      <div className="flex items-center justify-between mb-2 relative z-10">
        <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
        <motion.div
          animate={atRisk ? { scale: [1, 1.2, 1], rotate: [-5, 5, -5, 5, 0] } : { scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: atRisk ? 1.5 : 2 }}
        >
          <Flame
            className={`w-6 h-6 transition-colors ${
              atRisk ? 'text-red-400 fill-red-400' : 'text-orange-500 fill-orange-500'
            }`}
          />
        </motion.div>
      </div>

      <div className="text-5xl md:text-6xl font-black text-foreground tracking-tighter tabular-nums relative z-10">
        {currentStreak}
      </div>

      <p className="text-xs text-muted-foreground mt-2 relative z-10 font-medium">
        Longest:{' '}
        <span className="text-foreground font-semibold">{longestStreak} days</span>
      </p>

      {atRisk && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold text-red-400 uppercase tracking-wider mt-1.5 relative z-10"
        >
          ⚠ Log today to keep your streak!
        </motion.p>
      )}

      {loggedToday && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-1.5 relative z-10"
        >
          ✓ Logged today
        </motion.p>
      )}
    </Card>
  );
}
