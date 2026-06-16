import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar } from "lucide-react";
import { useGoalsStore, GoalCategory } from "@/stores/goals.store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const CAT_COLOR: Record<GoalCategory, { dot: string; bar: string; text: string }> = {
  academics: { dot: 'bg-blue-500',   bar: 'bg-blue-500',   text: 'text-blue-400' },
  chess:     { dot: 'bg-purple-500', bar: 'bg-purple-500', text: 'text-purple-400' },
  guitar:    { dot: 'bg-green-500',  bar: 'bg-green-500',  text: 'text-green-400' },
  startup:   { dot: 'bg-orange-500', bar: 'bg-orange-500', text: 'text-orange-400' },
};

const CAT_HREF: Record<GoalCategory, string> = {
  academics: '/academics',
  chess:     '/chess',
  guitar:    '/guitar',
  startup:   '/startup',
};

function daysUntil(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

function deadlineLabel(deadline: string): string {
  const d = daysUntil(deadline);
  if (d < 0) return 'Overdue';
  if (d === 0) return 'Today';
  if (d < 7) return `${d}d left`;
  return `${Math.round(d / 7)}w left`;
}

function deadlineCls(deadline: string): string {
  const d = daysUntil(deadline);
  if (d < 0) return 'text-red-400 border-red-500/30';
  if (d <= 3) return 'text-amber-400 border-amber-500/30';
  return 'text-muted-foreground border-border/40';
}

export function GoalProgress() {
  const { goals } = useGoalsStore();
  const active = goals.slice(0, 5);

  return (
    <Card className="p-6 bg-card border-border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Target className="w-4 h-4" /> Active Goals
        </p>
        <Link href="/settings">
          <span className="text-xs text-primary hover:underline cursor-pointer">+ Add</span>
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
          <Target className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No goals yet</p>
          <Link href="/settings">
            <span className="text-xs text-primary hover:underline cursor-pointer">Set your first goal →</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((goal, i) => {
            const col = CAT_COLOR[goal.category as GoalCategory] ?? CAT_COLOR.academics;
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', col.dot)} />
                    <span className="text-sm font-semibold truncate">{goal.subcategory}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant="outline" className={cn('text-[10px] gap-0.5 py-0 px-1.5', deadlineCls(goal.deadline))}>
                      <Calendar className="w-2.5 h-2.5" />
                      {deadlineLabel(goal.deadline)}
                    </Badge>
                    <span className={cn('text-xs font-bold tabular-nums', col.text)}>
                      {goal.targetValue.toLocaleString()}
                      <span className="font-normal text-muted-foreground ml-0.5 text-[10px]">{goal.unit}</span>
                    </span>
                  </div>
                </div>
                {goal.description && (
                  <p className="text-[11px] text-muted-foreground truncate pl-4">{goal.description}</p>
                )}
                <Link href={CAT_HREF[goal.category as GoalCategory] ?? '/'}>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    <div className={cn('h-full rounded-full w-0', col.bar)} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
