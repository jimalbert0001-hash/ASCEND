import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Clock, TrendingUp, Target, ChevronRight, Plus, Calendar, Zap, Award, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { subjectsData, getSubjectStats, getTotalStats } from "@/lib/academics-data";
import { logStudySession, fetchAcademicsData } from "@/lib/log-api";
import { useAuth } from "@/providers/AuthProvider";

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const SUBJECT_COLORS: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
};
const SUBJECT_RING: Record<string, string> = {
  blue: '#3b82f6', purple: '#a855f7', cyan: '#06b6d4', green: '#22c55e', orange: '#f97316',
};
const SESSION_LABEL: Record<string, string> = { study: 'Study', revision: 'Revision', mock_prep: 'Mock Prep' };

function ProgressRing({ pct, color, size = 72 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff08" strokeWidth={8} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="p-5 border-border/50 bg-card/60 backdrop-blur flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </Card>
    </motion.div>
  );
}

interface DBSession {
  id: string;
  subjectId: string | null;
  chapterId: string | null;
  durationMins: number | null;
  sessionType: string;
  focusScore: number | null;
  notes: string | null;
  startedAt: string;
}

function LogSessionModal({
  open, onClose, defaultSubjectId, userId, onSaved,
}: {
  open: boolean; onClose: () => void; defaultSubjectId?: string; userId: string; onSaved: () => void;
}) {
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? 'phy');
  const [chapterId, setChapterId] = useState('__all__');
  const [duration, setDuration] = useState('60');
  const [type, setType] = useState<'study' | 'revision' | 'mock_prep'>('study');
  const [focus, setFocus] = useState('4');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const subject = subjectsData.find(s => s.id === subjectId);

  async function handleSave() {
    setSaving(true);
    try {
      await logStudySession({
        userId,
        subjectId: subjectId || undefined,
        chapterId: chapterId === '__all__' ? undefined : chapterId,
        durationMins: parseInt(duration) || 60,
        sessionType: type,
        focusScore: parseInt(focus) as 1 | 2 | 3 | 4 | 5,
        notes,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onSaved();
        onClose();
      }, 800);
    } catch (err) {
      console.error('Failed to save session', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader><DialogTitle className="text-lg">Log Study Session</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Subject</Label>
              <Select value={subjectId} onValueChange={v => { setSubjectId(v); setChapterId('__all__'); }}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjectsData.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Chapter (optional)</Label>
              <Select value={chapterId} onValueChange={setChapterId}>
                <SelectTrigger className="bg-background/50"><SelectValue placeholder="All chapters" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All chapters</SelectItem>
                  {subject?.chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Duration (min)</Label>
              <Input value={duration} onChange={e => setDuration(e.target.value)} type="number" min="5" max="300" className="bg-background/50" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Session Type</Label>
              <Select value={type} onValueChange={v => setType(v as any)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="revision">Revision</SelectItem>
                  <SelectItem value="mock_prep">Mock Prep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Focus (1–5)</Label>
              <Select value={focus} onValueChange={setFocus}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} — {['Very Low','Low','Medium','High','Peak'][n-1]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What did you cover?" className="bg-background/50 text-sm resize-none" rows={2} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || saved} className="flex-1 gap-2">
              {saved ? <><CheckCircle2 className="w-4 h-4" />Saved!</> : saving ? 'Saving…' : 'Log Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AcademicsOverview() {
  const [logModal, setLogModal] = useState(false);
  const [logSubject, setLogSubject] = useState<string | undefined>();
  const [dbSessions, setDbSessions] = useState<DBSession[]>([]);
  const [dbTotalHours, setDbTotalHours] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  const stats = getTotalStats();
  const boardScore500 = Math.round((stats.avgCompletion * 0.4 + stats.avgMockScore * 0.6) / 100 * 500);
  const boardPct = Math.round(boardScore500 / 5);
  const boardColor = boardPct >= 80 ? '#22c55e' : boardPct >= 70 ? '#f59e0b' : '#ef4444';

  async function loadData() {
    try {
      const data = await fetchAcademicsData(userId);
      setDbSessions(data.sessions ?? []);
      setDbTotalHours(data.totalHours ?? null);
    } catch (err) {
      console.error('Failed to load academics data', err);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => { loadData(); }, [userId]);

  const displayHours = dbTotalHours !== null ? dbTotalHours : stats.totalHours;
  const recentSessions = dbSessions.slice(0, 6);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <motion.header variants={fadeUp} initial="initial" animate="animate" className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <BookOpen className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Academics</h2>
            <p className="text-muted-foreground text-sm mt-0.5">CBSE Class 12 — Mission: 95%+</p>
          </div>
        </div>
        <Button onClick={() => setLogModal(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />Log Session
        </Button>
      </motion.header>

      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Hours Studied" value={`${displayHours}h`} sub="All sessions" />
        <StatCard icon={Target} label="Completion" value={`${stats.avgCompletion}%`} sub="Avg across subjects" />
        <StatCard icon={TrendingUp} label="Mock Average" value={`${stats.avgMockScore}%`} sub="Last 7 tests" />
        <StatCard icon={Calendar} label="Days to Boards" value={stats.daysUntilBoards} sub="March 2027" />
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <Card className="p-6 border-border/50 bg-card/60 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Predicted Board Score</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-bold" style={{ color: boardColor }}>{boardScore500}</span>
                  <span className="text-muted-foreground text-sm">/ 500</span>
                  <span className="text-sm font-semibold" style={{ color: boardColor }}>({boardPct}%)</span>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-sm">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Current trajectory</span>
                <span className="font-semibold" style={{ color: boardColor }}>{boardPct}%</span>
              </div>
              <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: boardColor }}
                  initial={{ width: 0 }} animate={{ width: `${boardPct}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted-foreground">0%</span>
                <span className="text-green-400 font-medium">Target: 95%</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Subjects</h3>
          <Link href="/academics/subjects" className="text-sm text-primary hover:underline flex items-center gap-1">
            View chapters <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectsData.map(subject => {
            const s = getSubjectStats(subject);
            const colorClass = SUBJECT_COLORS[subject.color];
            const ringColor = SUBJECT_RING[subject.color];
            return (
              <motion.div key={subject.id} variants={fadeUp}>
                <Card className={`p-5 border bg-card/60 backdrop-blur hover:border-${subject.color}-500/40 transition-all hover:shadow-lg hover:shadow-${subject.color}-500/5 group cursor-pointer`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${colorClass}`}>{subject.code}</span>
                      <h4 className="font-bold mt-2 text-base">{subject.name}</h4>
                      <p className="text-xs text-muted-foreground">{s.completed}/{s.total} chapters</p>
                    </div>
                    <div className="relative shrink-0">
                      <ProgressRing pct={s.completionPct} color={ringColor} size={68} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{s.completionPct}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-muted/20 rounded-lg p-2">
                      <p className="text-muted-foreground">Hours</p>
                      <p className="font-bold mt-0.5">{Math.round(s.totalHours)}h</p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-2">
                      <p className="text-muted-foreground">Understanding</p>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(n => (
                          <div key={n} className="h-1.5 w-full rounded-full" style={{ backgroundColor: n <= Math.round(s.avgUnderstanding) ? ringColor : '#ffffff15' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {s.dueRevisions > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-amber-400 font-medium">{s.dueRevisions} revision{s.dueRevisions > 1 ? 's' : ''} due</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8"
                      onClick={e => { e.stopPropagation(); setLogSubject(subject.id); setLogModal(true); }}>
                      <Plus className="w-3 h-3 mr-1" />Log
                    </Button>
                    <Link href={`/academics/subjects?subject=${subject.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                        Chapters <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Recent Sessions
            {!loadingData && dbSessions.length > 0 && (
              <span className="ml-2 text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">
                {dbSessions.length} logged
              </span>
            )}
          </h3>
          <Link href="/academics/analytics" className="text-sm text-primary hover:underline flex items-center gap-1">
            Analytics <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Card className="border-border/50 bg-card/60 backdrop-blur divide-y divide-border/30">
          {loadingData ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading sessions…</div>
          ) : recentSessions.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No sessions yet. Log your first study session above.</p>
            </div>
          ) : recentSessions.map((session) => {
            const subjectEntry = subjectsData.find(s => s.id === session.subjectId);
            const chapter = subjectEntry?.chapters.find(c => c.id === session.chapterId);
            const colorClass = SUBJECT_COLORS[subjectEntry?.color ?? 'blue'];
            const sessionDate = new Date(session.startedAt);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / 86400000);
            const dateLabel = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays}d ago`;
            return (
              <div key={session.id} className="flex items-center gap-4 p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chapter?.name ?? subjectEntry?.name ?? 'Study session'}</p>
                  <p className="text-xs text-muted-foreground">
                    {SESSION_LABEL[session.sessionType] ?? session.sessionType} · {session.durationMins ?? '?'} min
                    {session.focusScore ? ` · Focus ${session.focusScore}/5` : ''}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{dateLabel}</div>
              </div>
            );
          })}
        </Card>
      </motion.div>

      <LogSessionModal
        open={logModal}
        onClose={() => { setLogModal(false); setLogSubject(undefined); }}
        defaultSubjectId={logSubject}
        userId={userId}
        onSaved={loadData}
      />
    </div>
  );
}
