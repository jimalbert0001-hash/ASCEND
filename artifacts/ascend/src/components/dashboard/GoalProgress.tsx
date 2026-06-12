import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { sampleData } from "@/lib/sample-data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  return (
    <Card className="p-6 bg-card border-border shadow-sm">
      <p className="text-sm font-medium text-muted-foreground mb-6 flex items-center gap-2">
        <Target className="w-4 h-4" /> Active Goals
      </p>
      <div className="space-y-5">
        {sampleData.goals.slice(0,4).map((goal, i) => (
          <motion.div 
            key={goal.id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-1.5"
          >
            <div className="flex justify-between text-sm items-center">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", getDomainColor(goal.domain).split(' ')[0])} />
                <span className="font-semibold truncate max-w-[200px]">{goal.title}</span>
              </div>
              <span className="text-muted-foreground text-xs font-bold tabular-nums">
                {goal.label || `${goal.progress}%`}
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className={cn("h-full", getDomainColor(goal.domain).split(' ')[0])}
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
