import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Crown, Puzzle, Clock, TrendingUp, Target, ArrowUpRight, ArrowDownRight, ChevronRight, BookOpen, Trophy, Swords } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getChessStats, ratingHistory, trainingSessions, gameNotes, RESULT_COLORS, TRAINING_FOCUS_COLORS } from "@/lib/chess-data";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

export function ChessOverview() {
  const stats = getChessStats();
  const ratingPct = Math.round(((stats.currentRating - 1000) / (stats.ratingGoal - 1000)) * 100);
  const recentSessions = trainingSessions.slice(0, 4);
  const recentGames = gameNotes.slice(0, 3);

  return (
    <motion.div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto" variants={stagger} initial="initial" animate="animate">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase">Chess</h2>
            <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest mt-0.5">Master the 64 squares</p>
          </div>
        </div>
        <Link href="/chess/training">
          <button className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            Log Session <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Rating', value: stats.currentRating, sub: `${stats.ratingChange >= 0 ? '+' : ''}${stats.ratingChange} last game`, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', positive: stats.ratingChange >= 0 },
          { label: 'Puzzles Solved', value: stats.totalPuzzles, sub: `${stats.avgAccuracy}% avg accuracy`, icon: Puzzle, color: 'text-violet-400', bg: 'bg-violet-500/10', positive: true },
          { label: 'Training Hours', value: `${stats.trainingHours}h`, sub: `${stats.trainingDays} sessions`, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10', positive: true },
          { label: 'Win Rate', value: `${stats.winRate}%`, sub: `${stats.wins}W ${stats.draws}D ${stats.losses}L`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', positive: true },
        ].map(s => (
          <Card key={s.label} className="p-4 border-border/50 bg-card/60">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon className={cn('w-4.5 h-4.5', s.color)} />
            </div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            <p className={cn('text-[11px] mt-1', s.positive ? 'text-emerald-400' : 'text-red-400')}>{s.sub}</p>
          </Card>
        ))}
      </motion.div>

      {/* Rating Goal */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-sm">Rating Goal: {stats.ratingGoal}</span>
            </div>
            <span className="text-sm font-bold text-amber-400">{stats.currentRating} / {stats.ratingGoal}</span>
          </div>
          <Progress value={ratingPct} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{ratingPct}% complete</span>
            <span className="text-xs text-amber-400 font-medium">{stats.ratingGoal - stats.currentRating} pts to go</span>
          </div>
          {/* Sparkline from history */}
          <div className="mt-4 flex items-end gap-1 h-12">
            {ratingHistory.slice(-12).map((r, i) => {
              const max = Math.max(...ratingHistory.map(x => x.rating));
              const min = Math.min(...ratingHistory.map(x => x.rating));
              const h = Math.round(((r.rating - min) / (max - min + 1)) * 100);
              return (
                <div key={r.id} className="flex-1 rounded-sm relative group" style={{ height: `${Math.max(h, 10)}%`, background: i === ratingHistory.length - 1 ? '#f59e0b' : 'rgba(245,158,11,0.3)' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-background border border-border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10">{r.rating}</div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Rating history — last 12 entries</p>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Training */}
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-sm">Recent Training</span>
            </div>
            <Link href="/chess/training" className="text-xs text-primary hover:underline">See all</Link>
          </div>
          <div className="space-y-2.5">
            {recentSessions.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-lg">
                <div className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', TRAINING_FOCUS_COLORS[s.focus])}>
                  {s.focus}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{s.notes}</p>
                  <p className="text-[10px] text-muted-foreground">{s.date} · {s.durationMins} mins</p>
                </div>
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded capitalize', s.intensity === 'intense' ? 'text-red-400 bg-red-500/10' : s.intensity === 'medium' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10')}>
                  {s.intensity}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Games */}
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-violet-400" />
              <span className="font-semibold text-sm">Game Notes</span>
            </div>
            <Link href="/chess/training" className="text-xs text-primary hover:underline">See all</Link>
          </div>
          <div className="space-y-2.5">
            {recentGames.map(g => (
              <div key={g.id} className="flex items-start gap-3 p-2.5 bg-muted/20 rounded-lg">
                <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 shrink-0', RESULT_COLORS[g.result])}>
                  {g.result}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">vs {g.opponent} ({g.color})</p>
                  <p className="text-[10px] text-muted-foreground">{g.opening} · {g.platform} · {g.date}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">±{g.ratingAtTime}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Nav */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Training & Games', href: '/chess/training', icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10', stat: `${stats.trainingHours}h trained` },
          { label: 'Openings Library', href: '/chess/openings', icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-500/10', stat: `${stats.openingsMastered} mastered` },
          { label: 'Tournaments', href: '/chess/tournaments', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', stat: `${stats.tournamentsPlayed} played` },
          { label: 'Analytics', href: '/chess/analytics', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', stat: 'View trends' },
        ].map(c => (
          <Link key={c.href} href={c.href}>
            <Card className="p-4 border-border/50 bg-card/60 hover:bg-card transition-colors cursor-pointer group">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', c.bg)}>
                <c.icon className={cn('w-4 h-4', c.color)} />
              </div>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{c.stat}</p>
            </Card>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
