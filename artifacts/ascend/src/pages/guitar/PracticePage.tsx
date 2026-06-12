import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Trash2, Save, Mic, BookOpen, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  PracticeSession, RecordingEntry, TheoryLesson,
  practiceSessions as initSessions, recordings as initRecordings, theoryLessons as initLessons,
  PracticeFocus, PracticeIntensity, PRACTICE_FOCUS_COLORS, PRACTICE_INTENSITY_COLORS,
} from "@/lib/guitar-data";
import { createPracticeSession, deletePracticeSession, createRecording, deleteRecording, updateTheoryLesson } from "@/lib/guitar-supabase";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const THEORY_STATUS_NEXT: Record<string, 'not_started' | 'in_progress' | 'completed'> = { not_started: 'in_progress', in_progress: 'completed', completed: 'not_started' };

export function PracticePage() {
  const [sessions, setSessions] = useState<PracticeSession[]>(initSessions);
  const [recs, setRecs] = useState<RecordingEntry[]>(initRecordings);
  const [lessons, setLessons] = useState<TheoryLesson[]>(initLessons);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [recOpen, setRecOpen] = useState(false);

  const [sf, setSf] = useState({ date: new Date().toISOString().slice(0, 10), durationMins: 30, focus: 'songs' as PracticeFocus, intensity: 'focused' as PracticeIntensity, notes: '', bpm: '' });
  const [rf, setRf] = useState({ date: new Date().toISOString().slice(0, 10), title: '', durationSecs: 120, type: 'cover' as 'cover' | 'original' | 'exercise', notes: '' });

  const totalMins = sessions.reduce((s, p) => s + p.durationMins, 0);
  const thisMonthMins = sessions.filter(s => s.date.startsWith('2026-06')).reduce((s, p) => s + p.durationMins, 0);

  async function saveSession() {
    const s = await createPracticeSession({ ...sf, durationMins: Number(sf.durationMins), bpm: sf.bpm ? Number(sf.bpm) : undefined });
    setSessions(prev => [s, ...prev]);
    setSessionOpen(false);
    setSf({ date: new Date().toISOString().slice(0, 10), durationMins: 30, focus: 'songs', intensity: 'focused', notes: '', bpm: '' });
  }

  async function removeSession(id: string) {
    await deletePracticeSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  async function saveRecording() {
    const r = await createRecording({ ...rf, durationSecs: Number(rf.durationSecs) });
    setRecs(prev => [r, ...prev]);
    setRecOpen(false);
    setRf({ date: new Date().toISOString().slice(0, 10), title: '', durationSecs: 120, type: 'cover', notes: '' });
  }

  async function removeRec(id: string) {
    await deleteRecording(id);
    setRecs(prev => prev.filter(r => r.id !== id));
  }

  async function cycleLesson(lesson: TheoryLesson) {
    const next = THEORY_STATUS_NEXT[lesson.status];
    await updateTheoryLesson(lesson.id, { status: next, completedAt: next === 'completed' ? new Date().toISOString().slice(0, 10) : undefined });
    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, status: next } : l));
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Practice Log</h2>
            <p className="text-muted-foreground text-sm">{Math.round(totalMins / 60)}h total · {Math.round(thisMonthMins / 60)}h this month · {sessions.length} sessions</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
          <TabsTrigger value="theory">Theory ({lessons.filter(l => l.status === 'completed').length}/{lessons.length})</TabsTrigger>
          <TabsTrigger value="recordings">Recordings ({recs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Log Practice</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Log Practice Session</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Date</Label><Input type="date" value={sf.date} onChange={e => setSf(p => ({ ...p, date: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Duration (mins)</Label><Input type="number" value={sf.durationMins} onChange={e => setSf(p => ({ ...p, durationMins: Number(e.target.value) }))} className="mt-1" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Focus</Label>
                      <Select value={sf.focus} onValueChange={v => setSf(p => ({ ...p, focus: v as PracticeFocus }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(['chords', 'scales', 'songs', 'theory', 'fingerpicking', 'improvisation', 'strumming', 'technique'] as PracticeFocus[]).map(f => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Intensity</Label>
                      <Select value={sf.intensity} onValueChange={v => setSf(p => ({ ...p, intensity: v as PracticeIntensity }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(['casual', 'focused', 'intensive'] as PracticeIntensity[]).map(i => <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label className="text-xs">Target BPM (optional)</Label><Input type="number" value={sf.bpm} onChange={e => setSf(p => ({ ...p, bpm: e.target.value }))} className="mt-1" placeholder="e.g. 80" /></div>
                  <div><Label className="text-xs">Notes</Label><Textarea value={sf.notes} onChange={e => setSf(p => ({ ...p, notes: e.target.value }))} className="mt-1" rows={2} placeholder="What did you practice?" /></div>
                  <Button onClick={saveSession} className="w-full gap-2"><Save className="w-4 h-4" /> Save Session</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {sessions.map((s, i) => (
            <motion.div key={s.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.04 }}>
              <Card className="p-4 border-border/50 bg-card/60 flex items-start gap-3">
                <div className={cn('px-2.5 py-1 rounded text-xs font-bold uppercase mt-0.5 shrink-0', PRACTICE_FOCUS_COLORS[s.focus])}>
                  {s.focus}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground leading-snug">{s.notes || 'No notes'}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs text-muted-foreground">{s.date}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{s.durationMins} mins</span>
                    {s.bpm && <Badge variant="outline" className="text-[10px] h-4">{s.bpm} BPM</Badge>}
                    {s.songsWorked && s.songsWorked.map(sg => <Badge key={sg} variant="outline" className="text-[10px] h-4">{sg}</Badge>)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded capitalize', PRACTICE_INTENSITY_COLORS[s.intensity])}>
                    {s.intensity}
                  </span>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-red-400" onClick={() => removeSession(s.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="theory" className="mt-4 space-y-2.5">
          {lessons.map((l, i) => (
            <motion.div key={l.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.04 }}>
              <Card className="p-4 border-border/50 bg-card/60 flex items-center gap-3">
                <button onClick={() => cycleLesson(l)} className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors', l.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : l.status === 'in_progress' ? 'border-amber-400' : 'border-muted')}>
                  {l.status === 'completed' && <Check className="w-4 h-4 text-white" />}
                  {l.status === 'in_progress' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{l.title}</p>
                  {l.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{l.notes}</p>}
                </div>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded capitalize shrink-0', l.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' : l.status === 'in_progress' ? 'text-amber-400 bg-amber-500/10' : 'text-muted-foreground bg-muted/40')}>
                  {l.status.replace('_', ' ')}
                </span>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="recordings" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Dialog open={recOpen} onOpenChange={setRecOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Log Recording</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Log Recording</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div><Label className="text-xs">Title</Label><Input value={rf.title} onChange={e => setRf(p => ({ ...p, title: e.target.value }))} className="mt-1" placeholder="e.g. Wish You Were Here - Take 2" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Date</Label><Input type="date" value={rf.date} onChange={e => setRf(p => ({ ...p, date: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Duration (seconds)</Label><Input type="number" value={rf.durationSecs} onChange={e => setRf(p => ({ ...p, durationSecs: Number(e.target.value) }))} className="mt-1" /></div>
                  </div>
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={rf.type} onValueChange={v => setRf(p => ({ ...p, type: v as 'cover' | 'original' | 'exercise' }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Notes</Label><Textarea value={rf.notes} onChange={e => setRf(p => ({ ...p, notes: e.target.value }))} className="mt-1" rows={2} /></div>
                  <Button onClick={saveRecording} className="w-full gap-2"><Save className="w-4 h-4" /> Save Recording</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {recs.map((r, i) => (
            <motion.div key={r.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50 bg-card/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.date} · {Math.round(r.durationSecs / 60)}:{String(r.durationSecs % 60).padStart(2, '0')} · <span className="capitalize">{r.type}</span></p>
                  {r.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.notes}</p>}
                </div>
                <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-red-400 shrink-0" onClick={() => removeRec(r.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
