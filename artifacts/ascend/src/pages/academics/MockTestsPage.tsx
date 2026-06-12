import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, TrendingDown, Target, Trophy, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell,
} from "recharts";
import { subjectsData, mockTestsData, MockTest } from "@/lib/academics-data";
import { createMockTest, deleteMockTest } from "@/lib/academics-supabase";
import { cn } from "@/lib/utils";

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const SUBJECT_COLOR: Record<string, string> = { blue: '#3b82f6', purple: '#a855f7', cyan: '#06b6d4', green: '#22c55e', orange: '#f97316' };
const SUBJECT_BADGE: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  green: 'text-green-400 bg-green-500/10 border-green-500/30',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
};

function scoreColor(pct: number) {
  if (pct >= 85) return '#22c55e';
  if (pct >= 75) return '#3b82f6';
  if (pct >= 60) return '#f59e0b';
  return '#ef4444';
}

function TestModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (t: MockTest) => void }) {
  const [subjectId, setSubjectId] = useState('__none__');
  const [name, setName] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [obtained, setObtained] = useState('');
  const [timeTaken, setTimeTaken] = useState('180');
  const [weakTopics, setWeakTopics] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const test = await createMockTest({
      subjectId: subjectId === '__none__' ? null : subjectId,
      name: name || `Mock Test ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      totalMarks: parseInt(totalMarks),
      obtainedMarks: parseInt(obtained) || 0,
      timeTakenMins: parseInt(timeTaken),
      weakTopics: weakTopics.split(',').map(s => s.trim()).filter(Boolean),
      notes,
    });
    setSaving(false);
    onSaved(test);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader><DialogTitle>Log Mock Test</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-xs mb-1.5 block">Subject (or Full Syllabus)</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="bg-background/50"><SelectValue placeholder="Full syllabus" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Full syllabus</SelectItem>
                {subjectsData.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Test Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Physics Mock #4" className="bg-background/50" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Total Marks</Label>
              <Input value={totalMarks} onChange={e => setTotalMarks(e.target.value)} type="number" className="bg-background/50" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Obtained</Label>
              <Input value={obtained} onChange={e => setObtained(e.target.value)} type="number" className="bg-background/50" placeholder="e.g. 82" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Time (min)</Label>
              <Input value={timeTaken} onChange={e => setTimeTaken(e.target.value)} type="number" className="bg-background/50" />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Weak Topics (comma-separated)</Label>
            <Input value={weakTopics} onChange={e => setWeakTopics(e.target.value)} placeholder="Wave Optics, Probability..." className="bg-background/50" />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-background/50 resize-none" rows={2} placeholder="What went well? What needs work?" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={save} disabled={saving || !obtained}>{saving ? 'Saving...' : 'Save Test'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MockTestsPage() {
  const [tests, setTests] = useState<MockTest[]>(mockTestsData);
  const [modal, setModal] = useState(false);

  const subjectTests = subjectsData.map(s => ({
    subject: s,
    tests: tests.filter(t => t.subjectId === s.id),
  }));

  const trendData = tests.filter(t => t.subjectId !== null).slice().sort((a, b) => a.date.localeCompare(b.date)).map(t => {
    const sub = subjectsData.find(s => s.id === t.subjectId);
    return { name: t.name.slice(0, 12), pct: Math.round(t.obtainedMarks / t.totalMarks * 100), subject: sub?.name ?? 'Full', color: SUBJECT_COLOR[sub?.color ?? 'blue'] };
  });

  const perSubjectAvg = subjectTests.map(({ subject, tests: ts }) => ({
    name: subject.name.slice(0, 4),
    avg: ts.length ? Math.round(ts.reduce((s, t) => s + t.obtainedMarks / t.totalMarks * 100, 0) / ts.length) : 0,
    color: SUBJECT_COLOR[subject.color],
  })).filter(x => x.avg > 0);

  const bestTest = [...tests].sort((a, b) => (b.obtainedMarks / b.totalMarks) - (a.obtainedMarks / a.totalMarks))[0];
  const avgScore = tests.filter(t => t.subjectId).length
    ? Math.round(tests.filter(t => t.subjectId).reduce((s, t) => s + t.obtainedMarks / t.totalMarks * 100, 0) / tests.filter(t => t.subjectId).length)
    : 0;

  const trend = trendData.length >= 2 ? trendData[trendData.length - 1].pct - trendData[trendData.length - 2].pct : 0;

  function handleDelete(id: string) {
    setTests(prev => prev.filter(t => t.id !== id));
    deleteMockTest(id);
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Mock Test Tracker</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Track performance and identify weak spots</p>
        </div>
        <Button onClick={() => setModal(true)} className="gap-2 self-start">
          <Plus className="w-4 h-4" />Log Test
        </Button>
      </motion.header>

      {/* Stats Row */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Trophy, label: 'Tests Taken', value: tests.length },
          { icon: Target, label: 'Average Score', value: `${avgScore}%` },
          { icon: bestTest ? TrendingUp : Target, label: 'Best Score', value: bestTest ? `${Math.round(bestTest.obtainedMarks / bestTest.totalMarks * 100)}%` : '—' },
          { icon: trend >= 0 ? TrendingUp : TrendingDown, label: 'Trend', value: `${trend >= 0 ? '+' : ''}${trend}%`, color: trend >= 0 ? 'text-green-400' : 'text-red-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div key={label} variants={fadeUp}>
            <Card className="p-5 border-border/50 bg-card/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("text-xl font-bold mt-0.5", color)}>{value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 border-border/50 bg-card/60">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Score Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#888' }} unit="%" />
                <Tooltip contentStyle={{ background: '#111118', border: '1px solid #ffffff15', borderRadius: 8 }} labelStyle={{ color: '#fff', fontSize: 12 }} itemStyle={{ fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'Score']} />
                <Line type="monotone" dataKey="pct" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 border-border/50 bg-card/60">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Avg Score by Subject</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={perSubjectAvg} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#888' }} unit="%" />
                <Tooltip contentStyle={{ background: '#111118', border: '1px solid #ffffff15', borderRadius: 8 }} formatter={(v: any) => [`${v}%`, 'Avg Score']} />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  {perSubjectAvg.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Test Cards */}
      <div>
        <h3 className="text-base font-semibold mb-4">All Tests</h3>
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-3">
          {tests.slice().sort((a, b) => b.date.localeCompare(a.date)).map(test => {
            const subject = subjectsData.find(s => s.id === test.subjectId);
            const pct = Math.round(test.obtainedMarks / test.totalMarks * 100);
            const color = scoreColor(pct);
            return (
              <motion.div key={test.id} variants={fadeUp}>
                <Card className="p-4 border-border/50 bg-card/60 hover:border-primary/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{test.name}</h4>
                        {subject ? (
                          <Badge variant="outline" className={`text-[10px] ${SUBJECT_BADGE[subject.color]}`}>{subject.name}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">Full Syllabus</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{new Date(test.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      {test.weakTopics.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          {test.weakTopics.slice(0, 4).map(t => (
                            <span key={t} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 rounded px-1.5 py-0.5">{t}</span>
                          ))}
                        </div>
                      )}
                      {test.notes && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{test.notes}</p>}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color }}>{test.obtainedMarks}<span className="text-sm text-muted-foreground font-normal">/{test.totalMarks}</span></p>
                        <p className="text-xs font-semibold" style={{ color }}>{pct}%</p>
                        <div className="mt-1 w-24">
                          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(test.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <TestModal open={modal} onClose={() => setModal(false)} onSaved={t => setTests(prev => [t, ...prev])} />
    </div>
  );
}
