import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Trash2, Swords, Save, X } from "lucide-react";
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
  TrainingSession, GameNote, trainingSessions as initTraining, gameNotes as initGames,
  TRAINING_FOCUS_COLORS, INTENSITY_COLORS, RESULT_COLORS, TrainingFocus, TrainingIntensity, ChessPlatform, ChessResult,
} from "@/lib/chess-data";
import { createTrainingSession, deleteTrainingSession, createGameNote, deleteGameNote, getTrainingSessions, getGameNotes } from "@/lib/chess-supabase";
import { useAuth } from "@/providers/AuthProvider";
import { isDataCleared } from "@/lib/data-cleared";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function TrainingPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>(() => isDataCleared() ? [] : initTraining);
  const [games, setGames] = useState<GameNote[]>(() => isDataCleared() ? [] : initGames);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    getTrainingSessions(userId).then(data => setSessions(data ?? []));
    getGameNotes(userId).then(data => setGames(data ?? []));
  }, [userId]);

  const [sf, setSf] = useState({ date: new Date().toISOString().slice(0, 10), durationMins: 60, focus: 'tactics' as TrainingFocus, intensity: 'medium' as TrainingIntensity, notes: '', puzzlesSolved: '', gamesPlayed: '' });
  const [gf, setGf] = useState({ date: new Date().toISOString().slice(0, 10), platform: 'lichess' as ChessPlatform, opponent: '', result: 'win' as ChessResult, color: 'white' as 'white' | 'black', opening: '', analysis: '', ratingAtTime: '' });

  async function saveSession() {
    const s = await createTrainingSession(userId, { ...sf, durationMins: Number(sf.durationMins), puzzlesSolved: sf.puzzlesSolved ? Number(sf.puzzlesSolved) : undefined, gamesPlayed: sf.gamesPlayed ? Number(sf.gamesPlayed) : undefined });
    setSessions(prev => [s, ...prev]);
    setSessionOpen(false);
    setSf({ date: new Date().toISOString().slice(0, 10), durationMins: 60, focus: 'tactics', intensity: 'medium', notes: '', puzzlesSolved: '', gamesPlayed: '' });
  }

  async function saveGame() {
    const g = await createGameNote(userId, { ...gf, ratingAtTime: Number(gf.ratingAtTime), lessons: [] });
    setGames(prev => [g, ...prev]);
    setGameOpen(false);
    setGf({ date: new Date().toISOString().slice(0, 10), platform: 'lichess', opponent: '', result: 'win', color: 'white', opening: '', analysis: '', ratingAtTime: '' });
  }

  async function removeSession(id: string) {
    await deleteTrainingSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  async function removeGame(id: string) {
    await deleteGameNote(id);
    setGames(prev => prev.filter(g => g.id !== id));
  }

  const totalMins = sessions.reduce((s, t) => s + t.durationMins, 0);
  const totalPuzzles = sessions.reduce((s, t) => s + (t.puzzlesSolved ?? 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Training & Games</h2>
            <p className="text-muted-foreground text-sm">{Math.round(totalMins / 60)}h trained · {totalPuzzles} puzzles · {sessions.length} sessions</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="sessions">Training Sessions ({sessions.length})</TabsTrigger>
          <TabsTrigger value="games">Game Notes ({games.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Log Session</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Log Training Session</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Date</Label><Input type="date" value={sf.date} onChange={e => setSf(p => ({ ...p, date: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Duration (mins)</Label><Input type="number" value={sf.durationMins} onChange={e => setSf(p => ({ ...p, durationMins: Number(e.target.value) }))} className="mt-1" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Focus</Label>
                      <Select value={sf.focus} onValueChange={v => setSf(p => ({ ...p, focus: v as TrainingFocus }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(['tactics', 'openings', 'endgames', 'analysis', 'blitz', 'strategy'] as TrainingFocus[]).map(f => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Intensity</Label>
                      <Select value={sf.intensity} onValueChange={v => setSf(p => ({ ...p, intensity: v as TrainingIntensity }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(['light', 'medium', 'intense'] as TrainingIntensity[]).map(i => <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Puzzles Solved</Label><Input type="number" placeholder="0" value={sf.puzzlesSolved} onChange={e => setSf(p => ({ ...p, puzzlesSolved: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Games Played</Label><Input type="number" placeholder="0" value={sf.gamesPlayed} onChange={e => setSf(p => ({ ...p, gamesPlayed: e.target.value }))} className="mt-1" /></div>
                  </div>
                  <div><Label className="text-xs">Notes</Label><Textarea value={sf.notes} onChange={e => setSf(p => ({ ...p, notes: e.target.value }))} className="mt-1" rows={2} placeholder="What did you work on?" /></div>
                  <Button onClick={saveSession} className="w-full gap-2"><Save className="w-4 h-4" /> Save Session</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {sessions.map((s, i) => (
            <motion.div key={s.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.04 }}>
              <Card className="p-4 border-border/50 bg-card/60 flex items-start gap-3">
                <div className={cn('px-2.5 py-1 rounded text-xs font-bold uppercase mt-0.5 shrink-0', TRAINING_FOCUS_COLORS[s.focus])}>
                  {s.focus}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground leading-snug">{s.notes || 'No notes'}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs text-muted-foreground">{s.date}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{s.durationMins} mins</span>
                    {s.puzzlesSolved && <Badge variant="outline" className="text-[10px] h-4">{s.puzzlesSolved} puzzles</Badge>}
                    {s.gamesPlayed && <Badge variant="outline" className="text-[10px] h-4">{s.gamesPlayed} games</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded capitalize', INTENSITY_COLORS[s.intensity])}>
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

        <TabsContent value="games" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Dialog open={gameOpen} onOpenChange={setGameOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Log Game</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Log Game Note</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Date</Label><Input type="date" value={gf.date} onChange={e => setGf(p => ({ ...p, date: e.target.value }))} className="mt-1" /></div>
                    <div>
                      <Label className="text-xs">Platform</Label>
                      <Select value={gf.platform} onValueChange={v => setGf(p => ({ ...p, platform: v as ChessPlatform }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lichess">Lichess</SelectItem>
                          <SelectItem value="chess.com">Chess.com</SelectItem>
                          <SelectItem value="otb">OTB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Opponent</Label><Input value={gf.opponent} onChange={e => setGf(p => ({ ...p, opponent: e.target.value }))} className="mt-1" placeholder="Username or name" /></div>
                    <div><Label className="text-xs">Rating at Time</Label><Input type="number" value={gf.ratingAtTime} onChange={e => setGf(p => ({ ...p, ratingAtTime: e.target.value }))} className="mt-1" placeholder="e.g. 1450" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Result</Label>
                      <Select value={gf.result} onValueChange={v => setGf(p => ({ ...p, result: v as ChessResult }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="win">Win</SelectItem>
                          <SelectItem value="loss">Loss</SelectItem>
                          <SelectItem value="draw">Draw</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <Select value={gf.color} onValueChange={v => setGf(p => ({ ...p, color: v as 'white' | 'black' }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label className="text-xs">Opening</Label><Input value={gf.opening} onChange={e => setGf(p => ({ ...p, opening: e.target.value }))} className="mt-1" placeholder="e.g. King's Indian Defense" /></div>
                  <div><Label className="text-xs">Analysis / Notes</Label><Textarea value={gf.analysis} onChange={e => setGf(p => ({ ...p, analysis: e.target.value }))} className="mt-1" rows={2} placeholder="Key moments, mistakes, lessons learned..." /></div>
                  <Button onClick={saveGame} className="w-full gap-2"><Save className="w-4 h-4" /> Save Game Note</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {games.map((g, i) => (
            <motion.div key={g.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.04 }}>
              <Card className="p-4 border-border/50 bg-card/60">
                <div className="flex items-start gap-3">
                  <span className={cn('px-2.5 py-1 rounded text-xs font-bold uppercase mt-0.5 shrink-0', RESULT_COLORS[g.result])}>
                    {g.result}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">vs {g.opponent}</p>
                      <Badge variant="outline" className="text-[10px] h-4 capitalize">{g.color}</Badge>
                      <Badge variant="outline" className="text-[10px] h-4">{g.platform}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{g.opening} · {g.date} · Rating: {g.ratingAtTime}</p>
                    {g.analysis && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{g.analysis}</p>}
                    {(g.lessons ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(g.lessons ?? []).map((l, j) => <span key={j} className="text-[10px] bg-muted/30 px-2 py-0.5 rounded text-muted-foreground">💡 {l}</span>)}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-red-400 shrink-0" onClick={() => removeGame(g.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
