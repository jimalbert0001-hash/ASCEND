import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Crown, Music, Plus, CheckSquare } from "lucide-react";

export function QuickActions() {
  const actions = [
    { icon: BookOpen, label: "Log Study", color: "text-chart-1" },
    { icon: Crown, label: "Log Chess", color: "text-chart-3" },
    { icon: Music, label: "Log Practice", color: "text-chart-4" },
    { icon: CheckSquare, label: "Daily Review", color: "text-primary" },
    { icon: Plus, label: "Add Task", color: "text-muted-foreground" },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, i) => (
          <Button 
            key={i} 
            variant="outline" 
            className="flex-1 min-w-[120px] h-auto py-3 flex flex-col gap-2 items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-bold">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
