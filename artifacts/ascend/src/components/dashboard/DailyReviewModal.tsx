import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Trophy, Zap, CheckCircle2, Plus, X, Crown, Music, Rocket,
  BookOpen, Star, Flame, TrendingUp, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logDailyReview, fetchAcademicsData, fetchChessData, fetchGuitarData } from "@/lib/log-api";
import { useAuth } from "@/providers/AuthProvider";
import { useStreakStore } from "@/stores/streak.store";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😔", label: "Rough" },
  { value: 2, emoji: "😐", label: "Meh" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🔥", label: "On fire" },
];

const ENERGY_OPTIONS = [
  { value: 1, label: "Drained", color: "bg-red-500" },
  { value: 2, label: "Low", color: "bg-orange-500" },
  { value: 3, label: "Normal", color: "bg-yellow-500" },
  { value: 4, label: "High", color: "bg-emerald-500" },
  { value: 5, label: "Peak", color: "bg-cyan-400" },
];

function TagList({
  label, items, placeholder, onChange,
}: {
  label: string; items: string[]; placeholder: string; onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft("");
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <Label className="text-xs mb-2 block text-muted-foreground uppercase tracking-wider">{label}</Label>
      <div className="flex gap-2 mb-2">
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="bg-background/50 text-sm h-8"
        />
        <Button type="button" size="sm" onClick={add} className="h-8 px-3 shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 bg-muted/40 text-xs px-2 py-1 rounded-full border border-border/40">
            {item}
            <button onClick={() => remove(i)} className="text-muted-foreground hover:text-foreground ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function ScorePreview({ mood, energy, chess, guitar, startup, studyMins }: {
  mood: number; energy: number; chess: boolean; guitar: boolean; startup: boolean; studyMins: number;
}) {
  const studyScore = Math.min(Math.round((studyMins / 300) * 400), 400);
  const domainScore = (chess ? 80 : 0) + (guitar ? 60 : 0) + (startup ? 80 : 0);
  const wellnessScore = Math.round(((mood + energy) / 10) * 100);
  const total = studyScore + domainScore + wellnessScore;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Estimated Day Score
        </span>
        <span className="text-2xl font-black text-primary">{total}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="bg-background/60 rounded-lg p-2 text-center">
          <BookOpen className="w-3 h-3 mx-auto mb-1 text-blue-400" />
          <p className="font-bold text-blue-400">{studyScore}</p>
          <p className="text-muted-foreground">Study</p>
        </div>
        <div className="bg-background/60 rounded-lg p-2 text-center">
          <TrendingUp className="w-3 h-3 mx-auto mb-1 text-emerald-400" />
          <p className="font-bold text-emerald-400">{domainScore}</p>
          <p className="text-muted-foreground">Domains</p>
        </div>
        <div className="bg-background/60 rounded-lg p-2 text-center">
          <Flame className="w-3 h-3 mx-auto mb-1 text-amber-400" />
          <p className="font-bold text-amber-400">{wellnessScore}</p>
          <p className="text-muted-foreground">Wellness</p>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ score, onClose }: { score: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4"
      >
        <Trophy className="w-10 h-10 text-primary" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-2xl font-black mb-1"
      >
        Day Logged! 🔥
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-muted-foreground text-sm mb-4"
      >
        Today's review is saved to your record
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-primary/10 border border-primary/30 rounded-xl px-8 py-4 mb-6"
      >
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Day Score</p>
        <p className="text-5xl font-black text-primary tabular-nums">{score}</p>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
        <p className="text-xs text-muted-foreground mb-4">
          Your AI Mentor will use this to sharpen tomorrow's plan.
        </p>
        <Button onClick={onClose} className="px-8">Close</Button>
      </motion.div>
    </motion.div>
  );
}

interface DailyReviewModalProps {
  open: boolean;
  onClose: () => void;
}

export function DailyReviewModal({ open, onClose }: DailyReviewModalProps) {
  const { user } = useAuth();
  const userId = user?.id ?? "mock-user-1";
  const recordActivity = useStreakStore((s) => s.recordActivity);

  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(3);
  const [studyMins, setStudyMins] = useState(0);
  const [chessSessionDone, setChessSessionDone] = useState(false);
  const [guitarSessionDone, setGuitarSessionDone] = useState(false);
  const [startupTaskDone, setStartupTaskDone] = useState(false);
  const [wins, setWins] = useState<string[]>([]);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [tomorrowPriorities, setTomorrowPriorities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [preloaded, setPreloaded] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!open || preloaded) return;
    (async () => {
      try {
        const [acad, chess, guitar] = await Promise.all([
          fetchAcademicsData(userId),
          fetchChessData(userId),
          fetchGuitarData(userId),
        ]);

        const todayStudy = (acad.sessions ?? []).filter((s: any) => {
          const d = (s.startedAt ?? "").slice(0, 10);
          return d === today;
        });
        const totalStudyMins = todayStudy.reduce((a: number, s: any) => a + (s.durationMins ?? 0), 0);
        if (totalStudyMins > 0) setStudyMins(totalStudyMins);

        const todayChess = (chess.sessions ?? []).some((s: any) => s.sessionDate === today);
        if (todayChess) setChessSessionDone(true);

        const todayGuitar = (guitar.sessions ?? []).some((s: any) => s.sessionDate === today);
        if (todayGuitar) setGuitarSessionDone(true);

        setPreloaded(true);
      } catch { setPreloaded(true); }
    })();
  }, [open]);

  const studyScore = Math.min(Math.round((studyMins / 300) * 400), 400);
  const domainScore = (chessSessionDone ? 80 : 0) + (guitarSessionDone ? 60 : 0) + (startupTaskDone ? 80 : 0);
  const wellnessScore = Math.round(((mood + energy) / 10) * 100);
  const estimatedScore = studyScore + domainScore + wellnessScore;

  async function handleSave() {
    setSaving(true);
    try {
      await logDailyReview({
        userId,
        moodScore: mood,
        energyLevel: energy,
        overallScore: estimatedScore,
        wins,
        blockers,
        tomorrowPriorities,
        studyMins,
        chessSessionDone,
        guitarSessionDone,
        startupTaskDone,
        notes,
      });
      recordActivity(estimatedScore);
      setSavedScore(estimatedScore);
    } catch (err) {
      console.error("Failed to save review", err);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setSavedScore(null);
    setPreloaded(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border/60 max-w-lg max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {savedScore !== null ? (
            <SuccessScreen key="success" score={savedScore} onClose={handleClose} />
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 text-primary" />
                  End of Day Review
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <Label className="text-xs mb-3 block text-muted-foreground uppercase tracking-wider">How did today feel?</Label>
                  <div className="flex gap-2">
                    {MOOD_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => setMood(o.value)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all",
                          mood === o.value
                            ? "border-primary bg-primary/10 scale-105"
                            : "border-border/40 hover:border-border hover:bg-muted/20"
                        )}
                      >
                        <span className="text-xl">{o.emoji}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-3 block text-muted-foreground uppercase tracking-wider">Energy Level</Label>
                  <div className="flex gap-2">
                    {ENERGY_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => setEnergy(o.value)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-2 py-2.5 rounded-xl border-2 transition-all",
                          energy === o.value
                            ? "border-primary bg-primary/10 scale-105"
                            : "border-border/40 hover:border-border hover:bg-muted/20"
                        )}
                      >
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <div key={n} className={cn("w-1 h-3 rounded-full", n <= o.value ? o.color : "bg-muted/30")} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-3 block text-muted-foreground uppercase tracking-wider">Domain Check-In</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "chess", label: "Chess", icon: Crown, color: "text-amber-400 border-amber-500/30 bg-amber-500/5", activeColor: "border-amber-400 bg-amber-500/15", checked: chessSessionDone, set: setChessSessionDone },
                      { key: "guitar", label: "Guitar", icon: Music, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5", activeColor: "border-emerald-400 bg-emerald-500/15", checked: guitarSessionDone, set: setGuitarSessionDone },
                      { key: "startup", label: "Startup", icon: Rocket, color: "text-violet-400 border-violet-500/30 bg-violet-500/5", activeColor: "border-violet-400 bg-violet-500/15", checked: startupTaskDone, set: setStartupTaskDone },
                    ].map(d => (
                      <button
                        key={d.key}
                        onClick={() => d.set(!d.checked)}
                        className={cn(
                          "flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all",
                          d.checked ? d.activeColor : d.color
                        )}
                      >
                        <div className="relative">
                          <d.icon className={cn("w-5 h-5", d.color.split(" ")[0])} />
                          {d.checked && (
                            <CheckCircle2 className="w-3 h-3 text-primary absolute -top-1 -right-1.5" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Study Time Today</Label>
                    {studyMins > 0 && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Auto-detected</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="0"
                      max="600"
                      value={studyMins}
                      onChange={e => setStudyMins(parseInt(e.target.value) || 0)}
                      className="bg-background/50 w-28"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                    <span className="text-xs text-muted-foreground ml-auto">= {Math.round(studyMins / 6) / 10}h</span>
                  </div>
                </div>

                <TagList
                  label="Today's Wins"
                  items={wins}
                  placeholder="What went well?"
                  onChange={setWins}
                />

                <TagList
                  label="Blockers / Challenges"
                  items={blockers}
                  placeholder="What got in the way?"
                  onChange={setBlockers}
                />

                <TagList
                  label="Tomorrow's Top Priorities"
                  items={tomorrowPriorities}
                  placeholder="What must get done?"
                  onChange={setTomorrowPriorities}
                />

                <div>
                  <Label className="text-xs mb-2 block text-muted-foreground uppercase tracking-wider">Reflection (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any thoughts on the day? Lessons learned?"
                    className="bg-background/50 text-sm resize-none"
                    rows={2}
                  />
                </div>

                <ScorePreview
                  mood={mood}
                  energy={energy}
                  chess={chessSessionDone}
                  guitar={guitarSessionDone}
                  startup={startupTaskDone}
                  studyMins={studyMins}
                />

                <div className="flex gap-3 pt-1">
                  <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 gap-2"
                  >
                    {saving ? (
                      <>Saving…</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Save Review</>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
