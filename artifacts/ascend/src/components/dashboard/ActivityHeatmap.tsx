import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useStreakStore } from "@/stores/streak.store";
import { useMemo } from "react";

const WEEKS = 26;
const DAYS_PER_WEEK = 7;

function getScoreIntensity(score: number): number {
  if (score <= 0) return 0;
  if (score < 150) return 1;
  if (score < 300) return 2;
  if (score < 500) return 3;
  return 4;
}

function getIntensityColor(intensity: number): string {
  switch (intensity) {
    case 1: return 'bg-primary/20';
    case 2: return 'bg-primary/40';
    case 3: return 'bg-primary/70';
    case 4: return 'bg-primary';
    default: return 'bg-secondary';
  }
}

export function ActivityHeatmap() {
  const activityLog = useStreakStore((s) => s.activityLog);

  const grid = useMemo(() => {
    const scoreByDate = new Map(activityLog.map((d) => [d.date, d.score]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (WEEKS * DAYS_PER_WEEK - 1));

    const weeks: { date: string; intensity: number }[][] = [];
    let cursor = new Date(startDate);

    for (let w = 0; w < WEEKS; w++) {
      const week: { date: string; intensity: number }[] = [];
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const dateStr = cursor.toISOString().split('T')[0];
        const score = scoreByDate.get(dateStr) ?? 0;
        week.push({ date: dateStr, intensity: getScoreIntensity(score) });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [activityLog]);

  const totalActiveDays = activityLog.length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Activity Heatmap</h3>
        </div>
        {totalActiveDays > 0 && (
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {totalActiveDays} active {totalActiveDays === 1 ? 'day' : 'days'}
          </span>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
        {grid.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((cell, dIdx) => (
              <motion.div
                key={`${wIdx}-${dIdx}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (wIdx * 7 + dIdx) * 0.002 }}
                title={cell.intensity > 0 ? `${cell.date}: activity logged` : cell.date}
                className={`w-3 h-3 rounded-sm cursor-default ${getIntensityColor(cell.intensity)}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <div className="w-3 h-3 rounded-sm bg-primary/20" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/70" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}
