import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export function ActivityHeatmap() {
  // Generate mock heatmap data (e.g., 26 weeks x 7 days for half year)
  const weeks = 26;
  const days = 7;
  
  const generateData = () => {
    const grid = [];
    for (let w = 0; w < weeks; w++) {
      const weekData = [];
      for (let d = 0; d < days; d++) {
        // Random intensity 0-4
        weekData.push(Math.floor(Math.random() * 5));
      }
      grid.push(weekData);
    }
    return grid;
  };

  const gridData = generateData();

  const getIntensityColor = (intensity: number) => {
    switch(intensity) {
      case 0: return 'bg-secondary';
      case 1: return 'bg-primary/20';
      case 2: return 'bg-primary/40';
      case 3: return 'bg-primary/70';
      case 4: return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Activity Heatmap</h3>
      </div>
      
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
        {gridData.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((intensity, dIdx) => (
              <motion.div
                key={`${wIdx}-${dIdx}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (wIdx * 7 + dIdx) * 0.002 }}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
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
