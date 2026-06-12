import { Link } from "wouter";
import { motion } from "framer-motion";
import { Crown, TrendingUp, Puzzle, Clock, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getChessStats } from "@/lib/chess-data";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function ChessSnapshot() {
  const stats = getChessStats();
  const ratingPct = Math.round(((stats.currentRating - 1000) / (stats.ratingGoal - 1000)) * 100);

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate">
      <Card className="p-5 border-border/50 bg-card/60 backdrop-blur h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Crown className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Chess</h3>
              <p className="text-xs text-muted-foreground">Goal: {stats.ratingGoal} rating</p>
            </div>
          </div>
          <Link href="/chess" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Open <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mb-4">
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-2xl font-black">{stats.currentRating}</span>
            <span className={`text-xs flex items-center gap-0.5 font-medium ${stats.ratingChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.ratingChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(stats.ratingChange)} pts
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-amber-400 transition-all" style={{ width: `${Math.min(ratingPct, 100)}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{ratingPct}% to {stats.ratingGoal} goal</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Puzzle className="w-3 h-3" />
              <span className="text-[10px]">Puzzles</span>
            </div>
            <p className="font-bold text-sm">{stats.totalPuzzles}</p>
            <p className="text-[10px] text-muted-foreground">{stats.avgAccuracy}% acc</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px]">Win Rate</span>
            </div>
            <p className="font-bold text-sm">{stats.winRate}%</p>
            <p className="text-[10px] text-muted-foreground">{stats.totalGames} games</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">Training</span>
            </div>
            <p className="font-bold text-sm">{stats.trainingHours}h</p>
            <p className="text-[10px] text-muted-foreground">{stats.trainingDays} sessions</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
