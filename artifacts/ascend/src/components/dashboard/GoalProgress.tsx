import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useStatsStore } from "@/stores/stats.store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EditableField } from "@/components/ui/EditableField";

const getDomainColor = (domain: string) => {
  switch(domain) {
    case 'academics': return 'bg-chart-1 text-chart-1';
    case 'startup': return 'bg-chart-2 text-chart-2';
    case 'chess': return 'bg-chart-3 text-chart-3';
    case 'guitar': return 'bg-chart-4 text-chart-4';
    default: return 'bg-primary text-primary';
  }
};

export function GoalProgress() {
  const { goals, updateGoal } = useStatsStore();

  return (
    <Card className="p-6 bg-card border-border shadow-sm">
      <p className="text-sm font-medium text-muted-foreground mb-6 flex items-center gap-2">
        <Target className="w-4 h-4" /> Active Goals
      </p>
      <div className="space-y-5">
        {goals.slice(0,4).map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-1.5"
          >
            <div className="flex justify-between text-sm items-center">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", getDomainColor(goal.domain).split(' ')[0])} />
                <span className="font-semibold truncate cursor-text hover:bg-primary/5 rounded px-1 -mx-1 transition-colors">
                  <EditableField
                    value={goal.title}
                    onSave={(val) => updateGoal(goal.id, { title: String(val) })}
                    type="text"
                    className="font-semibold"
                  />
                </span>
              </div>
              <span className="text-muted-foreground text-xs font-bold tabular-nums ml-2 flex-shrink-0">
                <EditableField
                  value={goal.progress}
                  onSave={(val) => updateGoal(goal.id, { progress: Number(val) })}
                  min={0}
                  max={100}
                  suffix="%"
                  className="text-xs font-bold tabular-nums"
                  compact
                />
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden group">
              <div
                className={cn("h-full", getDomainColor(goal.domain).split(' ')[0])}
                style={{ width: `${goal.progress}%` }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={goal.progress}
                onChange={(e) => updateGoal(goal.id, { progress: Number(e.target.value) })}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                style={{ position: 'relative' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
