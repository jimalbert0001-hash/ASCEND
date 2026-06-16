import { motion } from "framer-motion";
import { TrendingUp, Lightbulb, Clock, BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { subjectsData, studySessionsData, mockTestsData, getSubjectStats, getTotalStats } from "@/lib/academics-data";
import { isDataCleared } from "@/lib/data-cleared";
import { cn } from "@/lib/utils";

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const SUBJECT_COLOR: Record<string, string> = { blue: '#3b82f6', purple: '#a855f7', cyan: '#06b6d4', green: '#22c55e', orange: '#f97316' };

function buildDailyHours() {
  if (isDataCleared()) return [];
  const map: Record<string, number> = {};
  studySessionsData.forEach(s => {
    map[s.date] = (map[s.date] ?? 0) + s.durationMins / 60;
  });
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-14).map(([date, hours]) => ({
    day: new Date(date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
    hours: Math.round(hours * 10) / 10,
  }));
}

function buildSubjectHours() {
  return subjectsData.map(s => {
    const stats = getSubjectStats(s);
    return { name: s.name.slice(0, 4), hours: Math.round(stats.totalHours * 10) / 10, color: SUBJECT_COLOR[s.color], full: s.name };
  });
}

function buildMockTrend() {
  if (isDataCleared()) return [];
  return subjectsData.slice(0, 3).map(s => {
    const tests = mockTestsData.filter(t => t.subjectId === s.id).sort((a, b) => a.date.localeCompare(b.date));
    return { name: s.name, color: SUBJECT_COLOR[s.color], data: tests.map((t, i) => ({ test: `Test ${i + 1}`, pct: Math.round(t.obtainedMarks / t.totalMarks * 100) })) };
  });
}

function buildCompletionData() {
  return subjectsData.map(s => {
    const stats = getSubjectStats(s);
    return { name: s.name.slice(0, 4), completion: stats.completionPct, color: SUBJECT_COLOR[s.color], full: s.name };
  });
}

function buildUnderstandingHeatmap() {
  if (isDataCleared()) {
    return subjectsData.map(s => ({
      subject: s,
      chapters: s.chapters.map(c => ({ name: c.name, level: 0, completed: false })),
    }));
  }
  return subjectsData.map(s => ({
    subject: s,
    chapters: s.chapters.map(c => ({ name: c.name, level: c.understandingLevel, completed: c.isCompleted })),
  }));
}

const UNDERSTANDING_COLOR = ['#ffffff10', '#ef444440', '#f5940040', '#f59e0b60', '#3b82f680', '#22c55e'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111118] border border-white/10 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} style={{ color: p.color ?? p.fill }} className="font-semibold">{p.name}: {p.value}{typeof p.value === 'number' && p.name?.includes('pct') ? '%' : ''}</p>)}
    </div>
  );
}

export function AnalyticsPage() {
  const totalStats = getTotalStats();
  const dailyHours = buildDailyHours();
  const subjectHours = buildSubjectHours();
  const mockTrend = buildMockTrend();
  const completionData = buildCompletionData();
  const heatmap = buildUnderstandingHeatmap();

  const cleared = isDataCleared();
  const totalDailyHours = dailyHours.reduce((s, d) => s + d.hours, 0);
  const avgPerDay = totalDailyHours / (dailyHours.length || 1);
  const bestSubject = cleared ? subjectsData[0] : subjectsData.reduce((best, s) => {
    const stats = getSubjectStats(s);
    const bestStats = getSubjectStats(best);
    return stats.completionPct > bestStats.completionPct ? s : best;
  });
  const weakestSubject = cleared ? subjectsData[0] : subjectsData.reduce((weak, s) => {
    const tests = mockTestsData.filter(t => t.subjectId === s.id);
    const avg = tests.length ? tests.reduce((a, t) => a + t.obtainedMarks / t.totalMarks * 100, 0) / tests.length : 100;
    const weakTests = mockTestsData.filter(t => t.subjectId === weak.id);
    const weakAvg = weakTests.length ? weakTests.reduce((a, t) => a + t.obtainedMarks / t.totalMarks * 100, 0) / weakTests.length : 100;
    return avg < weakAvg ? s : weak;
  });
  const mostStudied = subjectHours.sort((a, b) => b.hours - a.hours)[0];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <BarChart2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Progress Analytics</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Data-driven insights for your board prep</p>
        </div>
      </motion.header>

      {/* Key Insights */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', title: 'Weakest in Mock Tests', value: weakestSubject.name, sub: 'Focus here next' },
          { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Daily Study Avg', value: `${Math.round(avgPerDay * 10) / 10}h`, sub: 'Last 14 days' },
          { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', title: 'Predicted Board Score', value: `${Math.round((totalStats.avgCompletion * 0.4 + totalStats.avgMockScore * 0.6) / 100 * 500)}/500`, sub: `${Math.round(totalStats.avgCompletion * 0.4 + totalStats.avgMockScore * 0.6)}%` },
        ].map(({ icon: Icon, color, bg, title, value, sub }) => (
          <motion.div key={title} variants={fadeUp}>
            <Card className={cn("p-5 border flex items-center gap-4", bg)}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                <Icon className={cn("w-5 h-5", color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{title}</p>
                <p className="text-xl font-bold mt-0.5">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 border-border/50 bg-card/60">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Study Hours — Last 14 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyHours} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#888' }} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} unit="h" />
                <Tooltip content={<CustomTooltip />} formatter={(v: any) => [`${v}h`, 'Hours']} />
                <Bar dataKey="hours" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 border-border/50 bg-card/60">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Hours by Subject</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={subjectHours} dataKey="hours" nameKey="full" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {subjectHours.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid #ffffff15', borderRadius: 8, fontSize: 12 }} formatter={(v: any, n: any) => [`${v}h`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {subjectHours.map(s => (
                  <div key={s.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-xs text-muted-foreground">{s.full}</span>
                    </div>
                    <span className="text-xs font-semibold">{s.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 border-border/50 bg-card/60">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Syllabus Completion</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={completionData} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#888' }} unit="%" />
                <YAxis type="category" dataKey="full" tick={{ fontSize: 11, fill: '#ccc' }} width={90} />
                <Tooltip contentStyle={{ background: '#111118', border: '1px solid #ffffff15', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'Complete']} />
                <Bar dataKey="completion" radius={[0, 4, 4, 0]}>
                  {completionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5 border-border/50 bg-card/60">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Mock Test Score Trend</h3>
            {(() => {
              const allTests = mockTestsData.filter(t => t.subjectId).sort((a, b) => a.date.localeCompare(b.date));
              const chartData = allTests.map((t, i) => {
                const row: Record<string, any> = { name: `T${i + 1}`, date: t.date };
                const sub = subjectsData.find(s => s.id === t.subjectId);
                if (sub) row[sub.name.slice(0, 4)] = Math.round(t.obtainedMarks / t.totalMarks * 100);
                return row;
              });
              const mergedData: Record<string, any>[] = [];
              const subjKeys: string[] = [];
              allTests.forEach((t, i) => {
                const sub = subjectsData.find(s => s.id === t.subjectId);
                if (!sub) return;
                const key = sub.name.slice(0, 4);
                if (!subjKeys.includes(key)) subjKeys.push(key);
                const existingIdx = mergedData.findIndex(d => d.date === t.date);
                const pct = Math.round(t.obtainedMarks / t.totalMarks * 100);
                if (existingIdx >= 0) mergedData[existingIdx][key] = pct;
                else mergedData.push({ date: t.date, name: new Date(t.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }), [key]: pct });
              });
              return (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={mergedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#888' }} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#888' }} unit="%" />
                    <Tooltip contentStyle={{ background: '#111118', border: '1px solid #ffffff15', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {subjKeys.map((key, i) => {
                      const sub = subjectsData.find(s => s.name.slice(0, 4) === key);
                      return <Line key={key} type="monotone" dataKey={key} stroke={sub ? SUBJECT_COLOR[sub.color] : '#888'} strokeWidth={2} dot={{ r: 4 }} connectNulls />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              );
            })()}
          </Card>
        </motion.div>
      </div>

      {/* Understanding Heatmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Understanding Level Heatmap</h3>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {['None','Weak','Fair','Good','Strong','Master'].map((l, i) => (
                <div key={l} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: UNDERSTANDING_COLOR[i] || '#22c55e' }} />
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {heatmap.map(({ subject, chapters }) => (
              <div key={subject.id}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: SUBJECT_COLOR[subject.color] }}>{subject.name}</p>
                <div className="flex flex-wrap gap-1">
                  {chapters.map(c => (
                    <div key={c.name} className="group relative">
                      <div className="w-6 h-6 rounded-sm cursor-default transition-transform hover:scale-125"
                        style={{ backgroundColor: c.completed ? UNDERSTANDING_COLOR[c.level] : '#ffffff08', border: c.completed ? `1px solid ${SUBJECT_COLOR[subject.color]}30` : '1px solid #ffffff08' }} />
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#111118] border border-white/10 rounded px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-xl">
                        {c.name} — {c.completed ? `Level ${c.level}` : 'Not started'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
