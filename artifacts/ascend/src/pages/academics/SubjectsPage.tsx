import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Circle, Star, Plus, BookOpen, Clock, FlaskConical, Calculator, Book, Terminal, Atom } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { subjectsData, getClearedSubjectsData, Chapter, Formula, getSubjectStats } from "@/lib/academics-data";
import { createStudySession, getSubjects } from "@/lib/academics-supabase";
import { useAuth } from "@/providers/AuthProvider";
import { isDataCleared } from "@/lib/data-cleared";
import { cn } from "@/lib/utils";

const ICONS: Record<string, any> = { Atom, FlaskConical, Calculator, Book, Terminal, BookOpen };
const RING: Record<string, string> = { blue: '#3b82f6', purple: '#a855f7', cyan: '#06b6d4', green: '#22c55e', orange: '#f97316' };
const COLOR_TEXT: Record<string, string> = { blue: 'text-blue-400', purple: 'text-purple-400', cyan: 'text-cyan-400', green: 'text-green-400', orange: 'text-orange-400' };
const COLOR_BG: Record<string, string> = { blue: 'bg-blue-500/10 border-blue-500/20', purple: 'bg-purple-500/10 border-purple-500/20', cyan: 'bg-cyan-500/10 border-cyan-500/20', green: 'bg-green-500/10 border-green-500/20', orange: 'bg-orange-500/10 border-orange-500/20' };
const COLOR_TAB_ACTIVE: Record<string, string> = { blue: 'border-b-blue-400 text-blue-400', purple: 'border-b-purple-400 text-purple-400', cyan: 'border-b-cyan-400 text-cyan-400', green: 'border-b-green-400 text-green-400', orange: 'border-b-orange-400 text-orange-400' };

function UnderstandingStars({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={cn("w-3 h-3", n <= level ? COLOR_TEXT[color] : 'text-muted-foreground/30')}
          fill={n <= level ? RING[color] : 'none'} />
      ))}
    </div>
  );
}

function FormulaRow({ formula }: { formula: Formula }) {
  const [memorized, setMemorized] = useState(formula.memorized);
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
      <Checkbox checked={memorized} onCheckedChange={v => setMemorized(!!v)} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground/80">{formula.title}</p>
        <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">{formula.content}</p>
      </div>
      {memorized && <Badge variant="outline" className="text-[10px] text-green-400 border-green-500/30 shrink-0">Memorized</Badge>}
    </div>
  );
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div className={cn("flex items-center gap-3 pt-2 pb-1 px-1")}>
      <span className={cn("text-xs font-semibold uppercase tracking-widest", COLOR_TEXT[color])}>{label}</span>
      <div className="flex-1 h-px bg-border/30" />
    </div>
  );
}

function ChapterRow({ chapter, color, displayName }: { chapter: Chapter; color: string; displayName?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [completed, setCompleted] = useState(chapter.isCompleted);
  const dueToday = chapter.nextRevision && new Date(chapter.nextRevision) <= new Date();
  const overdue = chapter.nextRevision && new Date(chapter.nextRevision) < new Date();

  return (
    <div className={cn("border rounded-xl transition-all", completed ? 'border-border/30 bg-muted/5' : 'border-border/50 bg-card/40')}>
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(!expanded)}>
        <div role="button" tabIndex={0} className="shrink-0 cursor-pointer"
          onClick={e => { e.stopPropagation(); setCompleted(!completed); }}
          onKeyDown={e => e.key === 'Enter' && setCompleted(!completed)}>
          {completed
            ? <CheckCircle2 className={cn("w-5 h-5", COLOR_TEXT[color])} />
            : <Circle className="w-5 h-5 text-muted-foreground/40" />}
        </div>
        <span className="w-7 h-7 rounded-lg bg-muted/20 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
          {chapter.chapterNumber}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium truncate", completed && "line-through text-muted-foreground/60")}>{displayName ?? chapter.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <UnderstandingStars level={chapter.understandingLevel} color={color} />
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{chapter.actualHours}h studied</span>
            {chapter.revisionCount > 0 && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{chapter.revisionCount} revisions</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {chapter.nextRevision && (
            <Badge variant="outline" className={cn("text-[10px]", overdue ? 'text-red-400 border-red-500/30' : dueToday ? 'text-amber-400 border-amber-500/30' : 'text-muted-foreground border-border/40')}>
              {overdue ? 'Overdue' : dueToday ? 'Due today' : `Rev in ${Math.ceil((new Date(chapter.nextRevision).getTime() - new Date().getTime()) / 86400000)}d`}
            </Badge>
          )}
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-4 pb-4 pt-0 border-t border-border/20">
              {chapter.formulas.length > 0 ? (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Formulas</p>
                  {chapter.formulas.map(f => <FormulaRow key={f.id} formula={f} />)}
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>No formulas added yet.</span>
                  <button className="text-primary hover:underline flex items-center gap-0.5"><Plus className="w-3 h-3" />Add formula</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogSessionModal({ open, onClose, subjectId }: { open: boolean; onClose: () => void; subjectId: string }) {
  const subject = subjectsData.find(s => s.id === subjectId);
  const [chapterId, setChapterId] = useState('');
  const [duration, setDuration] = useState('60');
  const [type, setType] = useState<'study' | 'revision' | 'mock_prep'>('study');
  const [focus, setFocus] = useState('4');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  async function save() {
    setSaving(true);
    await createStudySession(userId, { subjectId, chapterId: chapterId || null, date: new Date().toISOString().split('T')[0], durationMins: parseInt(duration), sessionType: type, focusScore: parseInt(focus) as 1|2|3|4|5, notes });
    setSaving(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader><DialogTitle>Log Session — {subject?.name}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Chapter</Label>
              <Select value={chapterId} onValueChange={setChapterId}>
                <SelectTrigger className="bg-background/50"><SelectValue placeholder="All chapters" /></SelectTrigger>
                <SelectContent>{subject?.chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Duration (min)</Label>
              <Input value={duration} onChange={e => setDuration(e.target.value)} type="number" min="5" className="bg-background/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Type</Label>
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
              <Label className="text-xs mb-1.5 block">Focus Score</Label>
              <Select value={focus} onValueChange={setFocus}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}/5</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Topics covered..." className="bg-background/50 resize-none" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SubjectsPage() {
  const search = useSearch();
  const initialSubject = new URLSearchParams(search).get('subject') ?? subjectsData[0].id;
  const [activeId, setActiveId] = useState(initialSubject);

  useEffect(() => {
    const subjectFromUrl = new URLSearchParams(search).get('subject');
    if (subjectFromUrl) setActiveId(subjectFromUrl);
  }, [search]);
  const [logModal, setLogModal] = useState(false);
  const [subjects, setSubjects] = useState(() => isDataCleared() ? getClearedSubjectsData() : subjectsData);
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    getSubjects(userId).then(data => setSubjects(data));
  }, [userId]);

  const subject = subjects.find(s => s.id === activeId) ?? subjects[0] ?? getClearedSubjectsData()[0];
  const stats = getSubjectStats(subject);
  const SubjectIcon = ICONS[subject.icon] ?? BookOpen;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Chapter Tracker</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Track progress chapter by chapter</p>
        </div>
        <Button onClick={() => setLogModal(true)} className="gap-2 self-start">
          <Plus className="w-4 h-4" />Log Session
        </Button>
      </motion.header>

      {/* Subject Tabs */}
      <div className="flex border-b border-border/40 overflow-x-auto">
        {subjects.map(s => {
          const Icon = ICONS[s.icon] ?? BookOpen;
          const isActive = s.id === activeId;
          return (
            <button key={s.id} onClick={() => setActiveId(s.id)}
              className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all shrink-0",
                isActive ? `border-b-2 ${COLOR_TAB_ACTIVE[s.color]}` : 'border-b-transparent text-muted-foreground hover:text-foreground')}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.name}</span>
              <span className="sm:hidden">{s.code.split('/')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Subject Stats Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={activeId}>
        <Card className={cn("p-5 border bg-card/60", COLOR_BG[subject.color])}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl border", COLOR_BG[subject.color])}>
                <SubjectIcon className={cn("w-5 h-5", COLOR_TEXT[subject.color])} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{subject.name}</h3>
                <p className="text-xs text-muted-foreground">{stats.completed} of {stats.total} chapters complete</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: RING[subject.color] }}>{stats.completionPct}%</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{Math.round(stats.totalHours)}h</p>
                <p className="text-xs text-muted-foreground">Studied</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{stats.dueRevisions}</p>
                <p className="text-xs text-muted-foreground">Due</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={stats.completionPct} className="h-2" style={{ '--progress-color': RING[subject.color] } as any} />
          </div>
        </Card>

        {/* Chapter List */}
        <div className="mt-4 space-y-2">
          {(subject.id === 'eng' || subject.id === 'cs' || subject.id === 'chem') ? (() => {
            const SEP = ' — ';
            type Group = { label: string; chapters: { chapter: Chapter; displayName: string }[] };
            const groups: Group[] = [];
            subject.chapters.forEach((chapter, _i) => {
              const sepIdx = chapter.name.indexOf(SEP);
              const label = sepIdx !== -1 ? chapter.name.slice(0, sepIdx) : 'General';
              const displayName = sepIdx !== -1 ? chapter.name.slice(sepIdx + SEP.length) : chapter.name;
              const last = groups[groups.length - 1];
              if (last && last.label === label) {
                last.chapters.push({ chapter, displayName });
              } else {
                groups.push({ label, chapters: [{ chapter, displayName }] });
              }
            });
            let globalIdx = 0;
            return groups.map(group => (
              <div key={group.label}>
                <SectionHeader label={group.label} color={subject.color} />
                <div className="space-y-2">
                  {group.chapters.map(({ chapter, displayName }) => {
                    const i = globalIdx++;
                    return (
                      <motion.div key={chapter.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                        <ChapterRow chapter={chapter} color={subject.color} displayName={displayName} />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ));
          })() : subject.chapters.map((chapter, i) => (
            <motion.div key={chapter.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <ChapterRow chapter={chapter} color={subject.color} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <LogSessionModal open={logModal} onClose={() => setLogModal(false)} subjectId={activeId} />
    </div>
  );
}
