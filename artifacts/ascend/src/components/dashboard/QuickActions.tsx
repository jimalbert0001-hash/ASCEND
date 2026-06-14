import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Crown, Music, CheckSquare, Plus } from "lucide-react";
import { useLocation } from "wouter";

interface QuickActionsProps {
  onReviewClick: () => void;
}

export function QuickActions({ onReviewClick }: QuickActionsProps) {
  const [, navigate] = useLocation();

  const actions = [
    { icon: BookOpen, label: "Log Study", color: "text-blue-400", onClick: () => navigate("/academics") },
    { icon: Crown, label: "Log Chess", color: "text-amber-400", onClick: () => navigate("/chess") },
    { icon: Music, label: "Log Guitar", color: "text-emerald-400", onClick: () => navigate("/guitar") },
    { icon: CheckSquare, label: "Daily Review", color: "text-primary", onClick: onReviewClick },
    { icon: Plus, label: "Add Task", color: "text-muted-foreground", onClick: () => navigate("/academics") },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, i) => (
          <Button
            key={i}
            variant="outline"
            onClick={action.onClick}
            className={`flex-1 min-w-[120px] h-auto py-3 flex flex-col gap-2 items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all group ${
              action.label === "Daily Review" ? "border-primary/30 bg-primary/5" : ""
            }`}
          >
            <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-bold">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
