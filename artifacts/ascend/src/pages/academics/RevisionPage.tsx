import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, AlertTriangle, RotateCcw, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { subjectsData, Chapter, Subject } from "@/lib/academics-data";
import { isDataCleared } from "@/lib/data-cleared";
import { cn } from "@/lib/utils";

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const COLOR_TEXT: Record<string, string> = { blue: 'text-blue-400', purple: 'text-purple-400', cyan: 'text-cyan-400', green: 'text-green-400', orange: 'text-orange-400' };
const COLOR_BG: Record<string, string> = { blue: 'bg-blue-500/10 border-blue-500/20', purple: 'bg-purple-500/10 border-purple-500/20', cyan: 'bg-cyan-500/10 border-cyan-500/20', green: 'bg-green-500/10 border-green-500/20', orange: 'bg-orange-500/10 border-orange-500/20' };

const SM2_INTERVALS = [1, 3, 7, 14, 21, 30];

type RevisionItem = { subject: Subject; chapter: Chapter; status: 'overdue' | 'today' | 'upcoming'; daysUntil: number };

function getRevisionItems(): RevisionItem[] {
  if (isDataCleared()) return [];
  const items: RevisionItem[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  subjectsData.forEach(subject => {
    subject.chapters.filter(c => c.nextRevision).forEach(chapter => {
      const revDate = new Date(chapter.nextRevision!);
      revDate.setHours(0, 0, 0, 0);
      const diff = Math.round((revDate.getTime() - now.getTime()) / 86400000);
      let status: RevisionItem['status'];
      if (diff < 0) status = 'overdue';
      else if (diff === 0) status = 'today';
      else status = 'upcoming';
      items.push({ subject, chapter, status, daysUntil: diff });
    });
  });

  return items.sort((a, b) => a.daysUntil - b.daysUntil);
}

const QUALITY_LABELS = ['Blackout', 'Wrong with hint', 'Wrong but familiar', 'Correct with effort', 'Correct slight hesitation', 'Perfect recall'];
const QUALITY_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#06b6d4', '#22c55e'];

function RevisionModal({ item, open, onClose, onComplete }: { item: RevisionItem | null; open: boolean; onClose: () => void; onComplete: (id: string) => void }) {
  const [quality, setQuality] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  function handleComplete() {
    if (quality === null) return;
    onComplete(item!.chapter.id);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Complete Revision</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <div className="p-3 rounded-xl bg-muted/10 border border-border/30">
            <p className="text-xs text-muted-foreground">Chapter</p>
            <p className="font-semibold mt-0.5">{item.chapter.name}</p>
            <p className={cn("text-xs mt-0.5", COLOR_TEXT[item.subject.color])}>{item.subject.name}</p>
          </div>
          <div>
            <Label className="text-xs font-semibold mb-3 block">Recall Quality</Label>
            <div className="grid grid-cols-3 gap-2">
              {QUALITY_LABELS.map((label, i) => (
                <button key={i} onClick={() => setQuality(i)}
                  className={cn("p-2 rounded-lg border text-xs text-center transition-all", quality === i ? 'border-primary bg-primary/10 text-primary' : 'border-border/40 text-muted-foreground hover:border-border')}
                  style={quality === i ? { borderColor: QUALITY_COLORS[i], background: QUALITY_COLORS[i] + '15', color: QUALITY_COLORS[i] } : {}}>
                  <div className="w-5 h-5 rounded-full mx-auto mb-1.5 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: QUALITY_COLORS[i] }}>{i}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {quality !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-muted/10 border border-border/30 text-xs">
              <p className="text-muted-foreground">Next revision scheduled in:</p>
              <p className="font-bold text-sm mt-0.5 text-primary">{SM2_INTERVALS[Math.min(item.chapter.revisionCount, SM2_INTERVALS.length - 1)]} day{SM2_INTERVALS[Math.min(item.chapter.revisionCount, SM2_INTERVALS.length - 1)] !== 1 ? 's' : ''}</p>
            </motion.div>
          )}
          <div>
            <Label className="text-xs mb-1.5 block">Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any observations from this revision?" className="bg-background/50 resize-none" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleComplete} disabled={quality === null}>Mark Complete</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CalendarStrip() {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const revItems = getRevisionItems();

  return (
    <Card className="p-4 border-border/50 bg-card/60">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">14-Day Schedule</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day, i) => {
          const dayStr = day.toISOString().split('T')[0];
          const revisions = revItems.filter(r => r.chapter.nextRevision === dayStr);
          const isToday = i === 0;
          return (
            <div key={i} className={cn("flex-shrink-0 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border min-w-[52px]",
              isToday ? 'border-primary/50 bg-primary/10' : revisions.length > 0 ? 'border-border/50 bg-muted/10' : 'border-border/20 bg-transparent')}>
              <span className="text-[10px] text-muted-foreground font-medium">{day.toLocaleDateString('en', { weekday: 'short' })}</span>
              <span className={cn("text-sm font-bold", isToday ? 'text-primary' : 'text-foreground')}>{day.getDate()}</span>
              {revisions.length > 0 ? (
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", revisions.length >= 3 ? 'bg-red-500 text-white' : 'bg-amber-500/80 text-white')}>
                  {revisions.length}
                </div>
              ) : (
                <div className="w-5 h-5" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function RevisionPage() {
  const allItems = getRevisionItems();
  const overdue = allItems.filter(r => r.status === 'overdue');
  const today = allItems.filter(r => r.status === 'today');
  const upcoming = allItems.filter(r => r.status === 'upcoming' && r.daysUntil <= 7);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<RevisionItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function handleComplete(chapterId: string) {
    setCompletedIds(prev => new Set([...prev, chapterId]));
  }

  function RevisionCard({ item }: { item: RevisionItem }) {
    const completed = completedIds.has(item.chapter.id);
    return (
      <motion.div variants={fadeUp}>
        <div className={cn("flex items-center gap-3 p-4 rounded-xl border transition-all",
          completed ? 'border-green-500/20 bg-green-500/5 opacity-60' : item.status === 'overdue' ? 'border-red-500/20 bg-red-500/5' : 'border-border/40 bg-card/40')}>
          {completed
            ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            : item.status === 'overdue' ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            : item.status === 'today' ? <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            : <Clock className="w-5 h-5 text-muted-foreground shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium truncate", completed && "line-through")}>{item.chapter.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn("text-xs font-medium", COLOR_TEXT[item.subject.color])}>{item.subject.name}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">Rev #{item.chapter.revisionCount + 1}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">Next: {SM2_INTERVALS[Math.min(item.chapter.revisionCount, SM2_INTERVALS.length - 1)]}d</span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {item.status === 'overdue' && <Badge className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">{Math.abs(item.daysUntil)}d late</Badge>}
            {!completed && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedItem(item); setModalOpen(true); }}>
                <RotateCcw className="w-3 h-3 mr-1" />Review
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <RotateCcw className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Revision Planner</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Spaced repetition schedule — SM-2 algorithm</p>
        </div>
      </motion.header>

      {/* Summary Stats */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-3 gap-3">
        {[
          { label: 'Overdue', value: overdue.length, color: overdue.length > 0 ? 'text-red-400' : 'text-muted-foreground' },
          { label: 'Due Today', value: today.length, color: today.length > 0 ? 'text-amber-400' : 'text-muted-foreground' },
          { label: 'Next 7 Days', value: upcoming.length, color: 'text-muted-foreground' },
        ].map(s => (
          <motion.div key={s.label} variants={fadeUp}>
            <Card className="p-4 text-center border-border/50 bg-card/60">
              <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <CalendarStrip />

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-sm text-red-400">Overdue ({overdue.length})</h3>
          </div>
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
            {overdue.map(item => <RevisionCard key={item.chapter.id} item={item} />)}
          </motion.div>
        </div>
      )}

      {/* Today */}
      {today.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm text-amber-400">Due Today ({today.length})</h3>
          </div>
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
            {today.map(item => <RevisionCard key={item.chapter.id} item={item} />)}
          </motion.div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Upcoming — Next 7 Days ({upcoming.length})</h3>
          </div>
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
            {upcoming.map(item => <RevisionCard key={item.chapter.id} item={item} />)}
          </motion.div>
        </div>
      )}

      {overdue.length === 0 && today.length === 0 && upcoming.length === 0 && (
        <Card className="p-10 text-center border-border/30 bg-card/40">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <h3 className="font-semibold text-lg">All caught up!</h3>
          <p className="text-muted-foreground text-sm mt-1">No revisions due in the next 7 days.</p>
        </Card>
      )}

      <RevisionModal item={selectedItem} open={modalOpen} onClose={() => setModalOpen(false)} onComplete={handleComplete} />
    </div>
  );
}
