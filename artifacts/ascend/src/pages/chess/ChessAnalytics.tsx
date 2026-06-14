import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Crown, Clock, Swords, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { fetchChessStats, ChessStatsData } from "@/lib/chess-api";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#06b6d4'];
const tooltipStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' };

export function ChessAnalytics() {
  const { user } = useAuth();
  const userId = user?.id || 'mock-user-1';
  const [stats, setStats] = useState<ChessStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchChessStats(userId);
      setStats(data);
    } catch (err) {
      console.error('Failed to load chess stats', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const winData = stats ? [
    { name: 'Wins', value: stats.wins },
    { name: 'Draws', value: stats.draws },
    { name: 'Losses', value: stats.losses },
  ] : [];

  const ratingChartData = stats?.ratingTimeline?.map((r: { date: string; rating: number | null; platform: string }) => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rating: r.rating ?? 0,
  })) ?? [];

  const hourData = stats?.hourPerformance?.map((h: { hour: number; wins: number; losses: number; draws: number; total: number }) => ({
    hour: `${h.hour}:00`,
    wins: h.wins,
    losses: h.losses,
    draws: h.draws,
  })) ?? [];

  const openingData = stats?.topOpenings?.slice(0, 8).map((o: { name: string; count: number }, i: number) => ({
    name: o.name.length > 20 ? o.name.slice(0, 20) + '...' : o.name,
    count: o.count,
    fill: COLORS[i % COLORS.length],
  })) ?? [];

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Chess Analytics</h2>
            <p className="text-muted-foreground text-sm">Loading stats...</p>
          </div>
        </div>
      </div>
    );
  }

  const s = stats || { wins: 0, losses: 0, draws: 0, total: 0, winRate: 0, topOpenings: [], hourPerformance: [], ratingTimeline: [] };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Chess Analytics</h2>
          <p className="text-muted-foreground text-sm">Performance trends from your imported games</p>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Wins', value: s.wins, sub: `${s.winRate}% win rate`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Losses', value: s.losses, sub: `${s.total} total games`, icon: Swords, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Draws', value: s.draws, sub: `${s.total > 0 ? Math.round((s.draws / s.total) * 100) : 0}% draw rate`, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Top Opening', value: s.topOpenings[0]?.count ?? 0, sub: s.topOpenings[0]?.name ?? 'No data', icon: BarChart2, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map((item) => (
          <Card key={item.label} className="p-4 border-border/50 bg-card/60">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', item.bg)}>
              <item.icon className={cn('w-4 h-4', item.color)} />
            </div>
            <p className="text-xl font-black">{item.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{item.sub}</p>
          </Card>
        ))}
      </motion.div>

      {/* Win/Loss/Draw Pie */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">Win / Draw / Loss</h3>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={winData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {[{ color: '#10b981' }, { color: '#f59e0b' }, { color: '#ef4444' }].map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {[{ label: 'Wins', value: s.wins, color: 'bg-emerald-400' }, { label: 'Draws', value: s.draws, color: 'bg-amber-400' }, { label: 'Losses', value: s.losses, color: 'bg-red-400' }].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', item.color)} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-bold ml-auto">{item.value}</span>
                </div>
              ))}
              <div className="pt-1 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Win rate</span>
                <span className="text-xs font-bold text-emerald-400 ml-2">{s.winRate}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Openings */}
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <h3 className="font-semibold text-sm">Top Openings</h3>
          </div>
          {openingData.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No opening data yet — import games first.</div>
          ) : (
            <div className="space-y-2">
              {openingData.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: o.fill }} />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{o.name}</span>
                  <Badge variant="outline" className="text-[10px] h-4">{o.count} games</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Rating Timeline */}
      {ratingChartData.length > 1 && (
        <motion.div variants={fadeUp} initial="initial" animate="animate">
          <Card className="p-5 border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-sm">Rating Timeline</h3>
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
      )}

      {/* Hourly Performance */}
      {hourData.length > 0 && (
        <motion.div variants={fadeUp} initial="initial" animate="animate">
          <Card className="p-5 border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-sky-400" />
              <h3 className="font-semibold text-sm">Performance by Hour</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="wins" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="draws" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
