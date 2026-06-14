import { Card } from "@/components/ui/card";
import { useStatsStore } from "@/stores/stats.store";
import { motion } from "framer-motion";
import { EditableField } from "@/components/ui/EditableField";

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeeklyProgress() {
  const { weeklyScores, setWeeklyScore } = useStatsStore();
  const maxScore = Math.max(...weeklyScores, 1000);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Weekly Progress</h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">THIS WEEK</span>
      </div>

      <div className="flex items-end justify-between h-32 gap-2">
        {weeklyScores.map((score, i) => {
          const height = Math.max((score / maxScore) * 100, 5);
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="w-full bg-secondary rounded-sm relative overflow-hidden h-full flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="w-full bg-primary rounded-sm opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">{days[i]}</span>
              <span className="text-[10px] font-bold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                <EditableField
                  value={score}
                  onSave={(val) => setWeeklyScore(i, Number(val))}
                  min={0}
                  max={1000}
                  className="text-[10px] font-bold"
                  compact
                />
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
