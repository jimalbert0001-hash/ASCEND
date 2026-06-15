import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useStatsStore } from "@/stores/stats.store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export function UpcomingTasks() {
  const tasks = useStatsStore((s) => s.tasks.filter((t) => !t.completed));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Upcoming Tasks</h3>
        <span className="text-xs text-muted-foreground font-medium">{tasks.length} remaining</span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <ClipboardList className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No tasks yet</p>
          <p className="text-xs text-muted-foreground/60">Tasks you add will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 bg-card/50 transition-all group"
            >
              <div className="mt-0.5">
                <Checkbox id={`task-${task.id}`} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`task-${task.id}`}
                  className="text-sm font-semibold leading-none truncate mb-1.5 block cursor-pointer group-hover:text-primary transition-colors"
                >
                  {task.title}
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded uppercase tracking-wider text-[9px] font-bold",
                    task.priority === 'high' ? "bg-destructive/20 text-destructive" :
                    task.priority === 'medium' ? "bg-chart-4/20 text-chart-4" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {task.priority}
                  </span>
                  <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded uppercase tracking-wider text-[9px] font-bold">
                    {task.domain}
                  </span>
                  <span className="text-muted-foreground font-medium ml-auto">
                    {task.due}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
