import { useGoalsStore, GoalCategory } from '@/stores/goals.store';
import { Target, Calendar, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CAT_COLOR: Record<GoalCategory, { card: string; text: string }> = {
  academics: { card: 'border-blue-500/25 bg-blue-500/5',   text: 'text-blue-400' },
  chess:     { card: 'border-purple-500/25 bg-purple-500/5', text: 'text-purple-400' },
  guitar:    { card: 'border-green-500/25 bg-green-500/5',  text: 'text-green-400' },
  startup:   { card: 'border-orange-500/25 bg-orange-500/5', text: 'text-orange-400' },
};

function daysUntil(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

function deadlineLabel(deadline: string): string {
  const d = daysUntil(deadline);
  if (d < 0) return 'Overdue';
  if (d === 0) return 'Due today';
  if (d === 1) return '1 day left';
  if (d < 7) return `${d} days left`;
  const weeks = Math.round(d / 7);
  return weeks === 1 ? '1 week left' : `${weeks} weeks left`;
}

function deadlineCls(deadline: string): string {
  const d = daysUntil(deadline);
  if (d < 0) return 'text-red-400 border-red-500/30';
  if (d <= 3) return 'text-amber-400 border-amber-500/30';
  return 'text-muted-foreground border-border/40';
}

export function GoalsBanner({ category }: { category: GoalCategory }) {
  const { goals, deleteGoal } = useGoalsStore();
  const filtered = goals.filter((g) => g.category === category);
  if (filtered.length === 0) return null;

  const { card, text } = CAT_COLOR[category];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scroll-smooth">
      {filtered.map((goal) => (
        <Card
          key={goal.id}
          className={cn('flex-shrink-0 p-4 border min-w-[210px] max-w-[260px]', card)}
        >
          <div className="flex items-start justify-between gap-1 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Target className={cn('w-3.5 h-3.5 shrink-0', text)} />
              <p className={cn('text-xs font-semibold truncate', text)}>{goal.subcategory}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5 shrink-0 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 -mr-1.5 -mt-0.5"
              onClick={() => deleteGoal(goal.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          <p className="text-xl font-bold leading-none">
            {goal.targetValue.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground ml-1">{goal.unit}</span>
          </p>

          {goal.description && (
            <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {goal.description}
            </p>
          )}

          <Badge variant="outline" className={cn('mt-2.5 text-[10px] gap-1 py-0.5', deadlineCls(goal.deadline))}>
            <Calendar className="w-2.5 h-2.5" />
            {deadlineLabel(goal.deadline)}
          </Badge>
        </Card>
      ))}
    </div>
  );
}
