import { Link } from "wouter";
import { motion } from "framer-motion";
import { Crown, TrendingUp, Puzzle, Clock, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStatsStore } from "@/stores/stats.store";
import { EditableField } from "@/components/ui/EditableField";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function ChessSnapshot() {
  const { chessStats, updateChessStat } = useStatsStore();
  const stats = chessStats;
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
              <p className="text-xs text-muted-foreground">Goal: <EditableField value={stats.ratingGoal} onSave={(v) => updateChessStat('ratingGoal', Number(v))} min={1000} className="text-xs text-muted-foreground" /> rating</p>
            </div>
          </div>
          <Link href="/chess" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Open <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mb-4">
          <div className="flex items-end justify-between mb-1.5">
            <EditableField value={stats.currentRating} onSave={(v) => updateChessStat('currentRating', Number(v))} min={0} className="text-2xl font-black" />
            <span className={`text-xs flex items-center gap-0.5 font-medium ${stats.ratingChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.ratingChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <EditableField value={Math.abs(stats.ratingChange)} onSave={(v) => updateChessStat('ratingChange', Number(v))} className="text-xs font-medium" suffix=" pts" compact />
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-amber-400 transition-all" style={{ width: `${Math.min(ratingPct, 100)}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{ratingPct}% to <EditableField value={stats.ratingGoal} onSave={(v) => updateChessStat('ratingGoal', Number(v))} min={0} className="text-[10px] text-muted-foreground" /> goal</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Puzzle className="w-3 h-3" />
              <span className="text-[10px]">Puzzles</span>
            </div>
            <p className="font-bold text-sm"><EditableField value={stats.totalPuzzles} onSave={(v) => updateChessStat('totalPuzzles', Number(v))} min={0} className="font-bold text-sm" /></p>
            <p className="text-[10px] text-muted-foreground"><EditableField value={stats.avgAccuracy} onSave={(v) => updateChessStat('avgAccuracy', Number(v))} min={0} max={100} className="text-[10px] text-muted-foreground" suffix="% acc" compact /></p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px]">Win Rate</span>
            </div>
            <p className="font-bold text-sm"><EditableField value={stats.winRate} onSave={(v) => updateChessStat('winRate', Number(v))} min={0} max={100} className="font-bold text-sm" suffix="%" /></p>
            <p className="text-[10px] text-muted-foreground"><EditableField value={stats.totalGames} onSave={(v) => updateChessStat('totalGames', Number(v))} min={0} className="text-[10px] text-muted-foreground" suffix=" games" compact /></p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">Training</span>
            </div>
            <p className="font-bold text-sm"><EditableField value={stats.trainingHours} onSave={(v) => updateChessStat('trainingHours', Number(v))} min={0} className="font-bold text-sm" suffix="h" /></p>
            <p className="text-[10px] text-muted-foreground"><EditableField value={stats.trainingDays} onSave={(v) => updateChessStat('trainingDays', Number(v))} min={0} className="text-[10px] text-muted-foreground" suffix=" sessions" compact /></p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
