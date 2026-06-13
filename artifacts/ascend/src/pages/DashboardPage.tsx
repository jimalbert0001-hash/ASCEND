import { useState, useEffect } from "react";
import { DailyScoreCard } from "@/components/dashboard/DailyScoreCard";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MotivationalCard } from "@/components/dashboard/MotivationalCard";
import { StartupSnapshot } from "@/components/dashboard/StartupSnapshot";
import { ChessSnapshot } from "@/components/dashboard/ChessSnapshot";
import { GuitarSnapshot } from "@/components/dashboard/GuitarSnapshot";
import { DailyReviewModal } from "@/components/dashboard/DailyReviewModal";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { useStatsStore } from "@/stores/stats.store";
import { fetchGoals, parseGoalProgress } from "@/lib/goals-api";

export function DashboardPage() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const { user } = useAuth();
  const loadGoalsFromServer = useStatsStore((s) => s.loadGoalsFromServer);

  useEffect(() => {
    if (!user?.id) return;
    fetchGoals(user.id).then((serverGoals) => {
      const mapped = serverGoals.map((g) => ({
        id: g.id,
        title: g.title,
        domain: g.domain,
        progress: parseGoalProgress(g.progress),
        targetValue: g.targetValue ?? undefined,
        description: g.description ?? undefined,
        status: g.status ?? 'in_progress',
      }));
      loadGoalsFromServer(mapped);
    }).catch((err) => {
      console.warn('Failed to load goals from server:', err);
    });
  }, [user?.id]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <>
      <motion.div
        className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.header variants={item} className="mb-8">
          <h2 className="text-3xl font-black tracking-tight uppercase">Mission Control</h2>
          <p className="text-muted-foreground mt-1 font-mono text-sm uppercase tracking-widest">Focus. Execute. Ascend.</p>
        </motion.header>

        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DailyScoreCard onReviewClick={() => setReviewOpen(true)} />
          <StreakCounter />
          <GoalProgress />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <WeeklyProgress />
            <ActivityHeatmap />
          </div>
          <div className="lg:col-span-1">
            <UpcomingTasks />
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ChessSnapshot />
          <GuitarSnapshot />
          <StartupSnapshot />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuickActions onReviewClick={() => setReviewOpen(true)} />
          <MotivationalCard />
        </motion.div>
      </motion.div>

      <DailyReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </>
  );
}
