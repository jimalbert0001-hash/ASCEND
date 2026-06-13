import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Music, Clock, ListMusic, Star, ChevronRight, TrendingUp, Play, Plus, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getGuitarStats, skillAreas } from "@/lib/guitar-data";
import { logGuitarSession, fetchGuitarData } from "@/lib/log-api";
import { useAuthStore } from "@/stores/auth.store";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

const FOCUS_COLORS: Record<string, string> = {
  chords: 'text-emerald-400 bg-emerald-500/10',
  scales: 'text-sky-400 bg-sky-500/10',
  songs: 'text-violet-400 bg-violet-500/10',
  theory: 'text-amber-400 bg-amber-500/10',
  fingerpicking: 'text-rose-400 bg-rose-500/10',
  improvisation: 'text-orange-400 bg-orange-500/10',
  strumming: 'text-cyan-400 bg-cyan-500/10',
  technique: 'text-purple-400 bg-purple-500/10',
};

interface DBSession {
  id: string;
  sessionDate: string;
  durationMins: number;
  focusAreas: string[];
  bpmTarget: number | null;
  bpmAchieved: number | null;
  qualityScore: number | null;
  notes: string | null;
}

interface DBSong {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  difficulty: number | null;
  status: string;
}

interface DBStats {
  totalHours: number;
  totalSessions: number;
  learningSongs: number;
  masteredSongs: number;
}

const FOCUS_OPTIONS = [
  { value: 'chords', label: 'Chords' },
  { value: 'scales', label: 'Scales' },
  { value: 'songs', label: 'Song Practice' },
  { value: 'fingerpicking', label: 'Fingerpicking' },
  { value: 'strumming', label: 'Strumming' },
  { value: 'improvisation', label: 'Improvisation' },
  { value: 'technique', label: 'Technique' },
  { value: 'theory', label: 'Music Theory' },
];

function LogGuitarModal({ open, onClose, userId, onSaved }: {
  open: boolean; onClose: () => void; userId: string; onSaved: () => void;
}) {
  const [duration, setDuration] = useState('30');
  const [focus, setFocus] = useState('chords');
  const [bpmTarget, setBpmTarget] = useState('');
  const [bpmAchieved, setBpmAchieved] = useState('');
  const [qualityScore, setQualityScore] = useState('4');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await logGuitarSession({
        userId,
        durationMins: parseInt(duration) || 30,
        focusAreas: [focus],
        bpmTarget: bpmTarget ? parseInt(bpmTarget) : undefined,
        bpmAchieved: bpmAchieved ? parseInt(bpmAchieved) : undefined,
        qualityScore: parseInt(qualityScore) || undefined,
        notes,
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved(); onClose(); }, 800);
    } catch (err) {
      console.error('Failed to log guitar session', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader><DialogTitle className="text-lg">Log Practice Session</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Duration (min)</Label>
              <Input value={duration} onChange={e => setDuration(e.target.value)} type="number" min="5" max="300" className="bg-background/50" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Focus Area</Label>
              <Select value={focus} onValueChange={setFocus}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FOCUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">BPM Target (optional)</Label>
              <Input value={bpmTarget} onChange={e => setBpmTarget(e.target.value)} type="number" min="40" max="240" placeholder="e.g. 80" className="bg-background/50" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">BPM Achieved (optional)</Label>
              <Input value={bpmAchieved} onChange={e => setBpmAchieved(e.target.value)} type="number" min="40" max="240" placeholder="e.g. 72" className="bg-background/50" />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Session Quality (1–5)</Label>
            <Select value={qualityScore} onValueChange={setQualityScore}>
              <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} — {['Rough','Below avg','Solid','Good','Peak'][n-1]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What did you work on? Any breakthroughs?" className="bg-background/50 text-sm resize-none" rows={2} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || saved} className="flex-1 gap-2">
              {saved ? <><CheckCircle2 className="w-4 h-4" />Logged!</> : saving ? 'Saving…' : 'Log Practice'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GuitarOverview() {
  const [logModal, setLogModal] = useState(false);
  const [dbSessions, setDbSessions] = useState<DBSession[]>([]);
  const [dbSongs, setDbSongs] = useState<DBSong[]>([]);
  const [dbStats, setDbStats] = useState<DBStats | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = useAuthStore(s => s.user?.id) ?? 'mock-user-1';
  const staticStats = getGuitarStats();

  async function loadData() {
    try {
      const data = await fetchGuitarData(userId);
      setDbSessions(data.sessions ?? []);
      setDbSongs(data.songs ?? []);
      setDbStats(data.stats ?? null);
    } catch (err) {
      console.error('Failed to load guitar data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [userId]);

  const stats = dbStats ?? {
    totalHours: staticStats.totalHours,
    totalSessions: staticStats.totalSessions,
    learningSongs: staticStats.songsLearned,
    masteredSongs: staticStats.songsRepertoire,
  };

  const activeSongs = dbSongs.filter(s => s.status === 'learning').slice(0, 3);
  const recentSessions = dbSessions.slice(0, 4);

  return (
    <motion.div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto" variants={stagger} initial="initial" animate="animate">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Music className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase">Guitar</h2>
            <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest mt-0.5">Strings, scales & soul</p>
          </div>
        </div>
        <Button onClick={() => setLogModal(true)} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-0 gap-2">
          <Plus className="w-4 h-4" /> Log Practice
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Practice', value: `${stats.totalHours}h`, sub: `${stats.totalSessions} sessions`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Songs Learning', value: stats.learningSongs, sub: `${stats.masteredSongs} mastered`, icon: ListMusic, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Skill Level', value: `${staticStats.currentLevel}/10`, sub: 'Current level', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Progress', value: `${Math.round((stats.masteredSongs / Math.max(stats.masteredSongs + stats.learningSongs, 1)) * 100)}%`, sub: 'songs mastered', icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map(s => (
          <Card key={s.label} className="p-4 border-border/50 bg-card/60">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon className={cn('w-4 h-4', s.color)} />
            </div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            <p className="text-[11px] text-emerald-400 mt-1">{s.sub}</p>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">Skill Progression</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skillAreas.map(skill => (
              <div key={skill.id} className="flex items-center gap-3">
                <span className="text-xs font-medium w-36 shrink-0">{skill.name}</span>
                <div className="flex-1">
                  <Progress value={skill.level * 10} className="h-2" />
                </div>
                <span className={cn('text-xs font-bold w-8 text-right', skill.color)}>{skill.level}/10</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">Recent Practice</span>
            </div>
            <Link href="/guitar/practice" className="text-xs text-primary hover:underline">See all</Link>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground p-4 text-center">Loading…</p>
          ) : recentSessions.length === 0 ? (
            <div className="p-6 text-center">
              <Music className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No sessions yet — log your first above.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentSessions.map(s => {
                const primaryFocus = s.focusAreas?.[0] ?? 'practice';
                const colorClass = FOCUS_COLORS[primaryFocus] ?? 'text-muted-foreground bg-muted/20';
                return (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-lg">
                    <div className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0', colorClass)}>
                      {primaryFocus}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{s.notes || s.focusAreas.join(', ')}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.sessionDate} · {s.durationMins} mins
                        {s.bpmAchieved ? ` · ${s.bpmAchieved} BPM` : ''}
                        {s.qualityScore ? ` · Quality ${s.qualityScore}/5` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-sm">Currently Learning</span>
            </div>
            <Link href="/guitar/songs" className="text-xs text-primary hover:underline">See all</Link>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground p-4 text-center">Loading…</p>
          ) : activeSongs.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground">No songs in progress. Add songs in Song Library.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeSongs.map(s => (
                <div key={s.id} className="flex items-start gap-3 p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground">{s.artist}{s.genre ? ` · ${s.genre}` : ''}</p>
                  </div>
                  {s.difficulty != null && (
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(n => <div key={n} className={cn('w-1.5 h-1.5 rounded-full', n <= s.difficulty! ? 'bg-amber-400' : 'bg-muted/40')} />)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Practice Log', href: '/guitar/practice', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', stat: `${stats.totalHours}h total` },
          { label: 'Song Library', href: '/guitar/songs', icon: ListMusic, color: 'text-sky-400', bg: 'bg-sky-500/10', stat: `${stats.learningSongs} learning` },
          { label: 'Progress', href: '/guitar/progress', icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10', stat: `Level ${staticStats.currentLevel}/10` },
        ].map(c => (
          <Link key={c.href} href={c.href}>
            <Card className="p-4 border-border/50 bg-card/60 hover:bg-card transition-colors cursor-pointer">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', c.bg)}>
                <c.icon className={cn('w-4 h-4', c.color)} />
              </div>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{c.stat}</p>
            </Card>
          </Link>
        ))}
      </motion.div>

      <LogGuitarModal open={logModal} onClose={() => setLogModal(false)} userId={userId} onSaved={loadData} />
    </motion.div>
  );
}
