import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { useStatsStore } from "@/stores/stats.store";
import { motion } from "framer-motion";
import { EditableField } from "@/components/ui/EditableField";

export function StreakCounter() {
  const { currentStreak, longestStreak, setCurrentStreak, setLongestStreak } = useStatsStore();

  return (
    <Card className="p-6 bg-card border-border shadow-sm flex flex-col justify-center relative overflow-hidden group">
      <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"></div>

      <div className="flex items-center justify-between mb-2 relative z-10">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          Current Streak
        </p>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
        </motion.div>
      </div>

      <div className="text-5xl md:text-6xl font-black text-foreground tracking-tighter tabular-nums relative z-10">
        <EditableField value={currentStreak} onSave={setCurrentStreak} min={0} className="text-5xl md:text-6xl font-black" />
      </div>

      <p className="text-xs text-muted-foreground mt-2 relative z-10 font-medium">
        Longest: <EditableField value={longestStreak} onSave={setLongestStreak} min={0} className="text-xs text-foreground font-medium" suffix=" days" />
      </p>
    </Card>
  );
}
