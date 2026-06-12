import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { sampleData } from "@/lib/sample-data";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function DailyScoreCard() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const target = sampleData.dailyScore;
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        setScore(target);
        clearInterval(timer);
      } else {
        setScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="p-6 bg-card border-border shadow-sm flex flex-col justify-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2 relative z-10">
        <Trophy className="w-4 h-4 text-primary" /> Daily Score
      </p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-black text-foreground tracking-tighter tabular-nums relative z-10"
      >
        {score}
      </motion.div>
      <div className="flex gap-2 mt-4 relative z-10">
        <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
          Academics +320
        </span>
        <span className="text-[10px] font-bold bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded uppercase tracking-wider">
          Chess +527
        </span>
      </div>
    </Card>
  );
}
