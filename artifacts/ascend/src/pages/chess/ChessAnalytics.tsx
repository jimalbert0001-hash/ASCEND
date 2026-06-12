import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Puzzle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { getChessStats, ratingHistory, puzzleSessions, trainingSessions, openingsData } from "@/lib/chess-data";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const ratingChartData = ratingHistory.map(r => ({ date: r.date.slice(5), rating: r.rating, change: r.change }));
const puzzleChartData = puzzleSessions.slice().reverse().map(p => ({ date: p.date.slice(5), accuracy: p.accuracy, puzzles: p.puzzlesSolved, rating: p.rating }));
const focusMap: Record<string, number> = {};
trainingSessions.forEach(s => { focusMap[s.focus] = (focusMap[s.focus] || 0) + s.durationMins; });
const focusData = Object.entries(focusMap).map(([focus, mins]) => ({ focus: focus.charAt(0).toUpperCase() + focus.slice(1), hours: +(mins / 60).toFixed(1) }));
const openingPerf = openingsData.filter(o => o.gamesPlayed > 0).map(o => ({ name: o.name.split(' ').slice(-1)[0], winRate: o.winRate, games: o.gamesPlayed }));

const COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#06b6d4'];

const tooltipStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' };

export function ChessAnalytics() {
  const stats = getChessStats();

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Chess Analytics</h2>
          <p className="text-muted-foreground text-sm">Performance trends and insights</p>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Current Rating', value: stats.currentRating, sub: `Goal: ${stats.ratingGoal}`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Win Rate', value: `${stats.winRate}%`, sub: `${stats.totalGames} total games`, icon: BarChart2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Puzzle Accuracy', value: `${stats.avgAccuracy}%`, sub: `${stats.totalPuzzles} puzzles`, icon: Puzzle, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Training Hours', value: `${stats.trainingHours}h`, sub: `${stats.trainingDays} sessions`, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        ].map(s => (
          <Card key={s.label} className="p-4 border-border/50 bg-card/60">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', s.bg)}>
              <s.icon className={cn('w-4 h-4', s.color)} />
            </div>
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </motion.div>

      {/* Rating History */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">Rating Growth</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ratingChartData}>
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2} fill="url(#rGrad)" dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* W/D/L Pie */}
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">Win / Draw / Loss</h3>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={[{ name: 'Wins', value: stats.wins }, { name: 'Draws', value: stats.draws }, { name: 'Losses', value: stats.losses }]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {[{ color: '#10b981' }, { color: '#f59e0b' }, { color: '#ef4444' }].map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {[{ label: 'Wins', value: stats.wins, color: 'bg-emerald-400' }, { label: 'Draws', value: stats.draws, color: 'bg-amber-400' }, { label: 'Losses', value: stats.losses, color: 'bg-red-400' }].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', s.color)} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-xs font-bold ml-auto">{s.value}</span>
                </div>
              ))}
              <div className="pt-1 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Win rate</span>
                <span className="text-xs font-bold text-emerald-400 ml-2">{stats.winRate}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Training Focus */}
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-sm">Training by Focus (Hours)</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={focusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="category" dataKey="focus" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                {focusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Puzzle Accuracy */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-4">
            <Puzzle className="w-4 h-4 text-violet-400" />
            <h3 className="font-semibold text-sm">Puzzle Accuracy Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={puzzleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Accuracy']} />
              <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Opening Performance */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">Opening Win Rate</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={openingPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Win Rate']} />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                {openingPerf.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  );
}
