import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Crown, Puzzle, Clock, TrendingUp, Target, ChevronRight, BookOpen, Trophy, Swords, Plus, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getChessStats } from "@/lib/chess-data";
import { logChessSession, fetchChessData } from "@/lib/log-api";
import { useAuth } from "@/providers/AuthProvider";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

const FOCUS_COLORS: Record<string, string> = {
  tactics: 'text-violet-400 bg-violet-500/10',
  openings: 'text-sky-400 bg-sky-500/10',
  endgames: 'text-amber-400 bg-amber-500/10',
  analysis: 'text-emerald-400 bg-emerald-500/10',
  game: 'text-rose-400 bg-rose-500/10',
  blitz: 'text-orange-400 bg-orange-500/10',
  strategy: 'text-cyan-400 bg-cyan-500/10',
};

interface DBSession {
  id: string;
  sessionDate: string;
  sessionType: string;
  durationMins: number | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  tacticsSolved: number | null;
  accuracy: string | null;
  focusArea: string | null;
  notes: string | null;
}

interface DBStats {
  currentRating: number;
  ratingChange: number;
  winRate: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  trainingHours: number;
  sessions: number;
}

function LogChessModal({ open, onClose, userId, onSaved }: {
  open: boolean; onClose: () => void; userId: string; onSaved: () => void;
}) {
  const [sessionType, setSessionType] = useState<'game' | 'tactics' | 'analysis' | 'openings' | 'endgames'>('game');
  const [platform, setPlatform] = useState<'lichess' | 'chess.com' | 'otb'>('lichess');
  const [timeControl, setTimeControl] = useState('rapid');
  const [duration, setDuration] = useState('60');
  const [wins, setWins] = useState('0');
  const [losses, setLosses] = useState('0');
  const [draws, setDraws] = useState('0');
  const [tacticsSolved, setTacticsSolved] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [newRating, setNewRating] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await logChessSession({
        userId,
        sessionType,
        platform,
        timeControl,
        durationMins: parseInt(duration) || undefined,
        gamesPlayed: sessionType === 'game' ? (parseInt(wins) || 0) + (parseInt(losses) || 0) + (parseInt(draws) || 0) : 0,
        wins: sessionType === 'game' ? parseInt(wins) || 0 : undefined,
        losses: sessionType === 'game' ? parseInt(losses) || 0 : undefined,
        draws: sessionType === 'game' ? parseInt(draws) || 0 : undefined,
        tacticsSolved: tacticsSolved ? parseInt(tacticsSolved) : undefined,
        accuracy: accuracy ? parseFloat(accuracy) : undefined,
        focusArea: sessionType,
        notes,
        newRating: newRating ? parseInt(newRating) : undefined,
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved(); onClose(); }, 800);
    } catch (err) {
      console.error('Failed to log chess session', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader><DialogTitle className="text-lg">Log Chess Session</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Session Type</Label>
              <Select value={sessionType} onValueChange={v => setSessionType(v as any)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="game">Game</SelectItem>
                  <SelectItem value="tactics">Tactics</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="openings">Openings</SelectItem>
                  <SelectItem value="endgames">Endgames</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Platform</Label>
              <Select value={platform} onValueChange={v => setPlatform(v as any)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lichess">Lichess</SelectItem>
                  <SelectItem value="chess.com">Chess.com</SelectItem>
                  <SelectItem value="otb">OTB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Time Control</Label>
              <Select value={timeControl} onValueChange={setTimeControl}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullet">Bullet (1-2 min)</SelectItem>
                  <SelectItem value="blitz">Blitz (3-5 min)</SelectItem>
                  <SelectItem value="rapid">Rapid (10-15 min)</SelectItem>
                  <SelectItem value="classical">Classical (30+ min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Duration (min)</Label>
              <Input value={duration} onChange={e => setDuration(e.target.value)} type="number" min="5" className="bg-background/50" />
            </div>
          </div>

          {sessionType === 'game' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block text-emerald-400">Wins</Label>
                <Input value={wins} onChange={e => setWins(e.target.value)} type="number" min="0" className="bg-background/50" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block text-red-400">Losses</Label>
                <Input value={losses} onChange={e => setLosses(e.target.value)} type="number" min="0" className="bg-background/50" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block text-muted-foreground">Draws</Label>
                <Input value={draws} onChange={e => setDraws(e.target.value)} type="number" min="0" className="bg-background/50" />
              </div>
            </div>
          )}

          {sessionType === 'tactics' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">Puzzles Solved</Label>
                <Input value={tacticsSolved} onChange={e => setTacticsSolved(e.target.value)} type="number" min="0" placeholder="30" className="bg-background/50" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Accuracy %</Label>
                <Input value={accuracy} onChange={e => setAccuracy(e.target.value)} type="number" min="0" max="100" placeholder="75" className="bg-background/50" />
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs mb-1.5 block">New Rating (optional)</Label>
            <Input value={newRating} onChange={e => setNewRating(e.target.value)} type="number" placeholder="e.g. 1480" className="bg-background/50" />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Key moments, openings tried, areas to improve…" className="bg-background/50 text-sm resize-none" rows={2} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || saved} className="flex-1 gap-2">
              {saved ? <><CheckCircle2 className="w-4 h-4" />Logged!</> : saving ? 'Saving…' : 'Log Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ChessOverview() {
  const [logModal, setLogModal] = useState(false);
  const [dbSessions, setDbSessions] = useState<DBSession[]>([]);
  const [dbRatings, setDbRatings] = useState<{ rating: number; recordedAt: string }[]>([]);
  const [dbStats, setDbStats] = useState<DBStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  const staticStats = getChessStats();

  async function loadData() {
    try {
      const data = await fetchChessData(userId);
      setDbSessions(data.sessions ?? []);
      setDbRatings(data.ratings ?? []);
      setDbStats(data.stats ?? null);
    } catch (err) {
      console.error('Failed to load chess data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [userId]);

  const stats = dbStats ?? {
    currentRating: staticStats.currentRating,
    ratingChange: staticStats.ratingChange,
    winRate: staticStats.winRate,
    totalWins: staticStats.wins,
    totalLosses: staticStats.losses,
    totalDraws: staticStats.draws,
    trainingHours: staticStats.trainingHours,
    sessions: staticStats.trainingDays,
    totalGames: staticStats.wins + staticStats.losses + staticStats.draws,
  };

  const ratingGoal = staticStats.ratingGoal;
  const ratingPct = Math.round(((stats.currentRating - 1000) / (ratingGoal - 1000)) * 100);
  const chartRatings = dbRatings.length > 0 ? dbRatings : [];
  const recentSessions = dbSessions.slice(0, 4);

  return (
    <motion.div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto" variants={stagger} initial="initial" animate="animate">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase">Chess</h2>
            <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest mt-0.5">Master the 64 squares</p>
          </div>
        </div>
        <Button onClick={() => setLogModal(true)} className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-0 gap-2">
          <Plus className="w-4 h-4" /> Log Session
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Rating', value: stats.currentRating, sub: `${stats.ratingChange >= 0 ? '+' : ''}${stats.ratingChange} last entry`, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', positive: stats.ratingChange >= 0 },
          { label: 'Total Games', value: stats.totalGames, sub: `${stats.totalWins}W ${stats.totalDraws}D ${stats.totalLosses}L`, icon: Swords, color: 'text-violet-400', bg: 'bg-violet-500/10', positive: true },
          { label: 'Training Hours', value: `${stats.trainingHours}h`, sub: `${stats.sessions} sessions`, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10', positive: true },
          { label: 'Win Rate', value: `${stats.winRate}%`, sub: 'All logged games', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', positive: stats.winRate >= 50 },
        ].map(s => (
          <Card key={s.label} className="p-4 border-border/50 bg-card/60">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon className={cn('w-4 h-4', s.color)} />
            </div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            <p className={cn('text-[11px] mt-1', s.positive ? 'text-emerald-400' : 'text-red-400')}>{s.sub}</p>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-sm">Rating Goal: {ratingGoal}</span>
            </div>
            <span className="text-sm font-bold text-amber-400">{stats.currentRating} / {ratingGoal}</span>
          </div>
          <Progress value={ratingPct} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{ratingPct}% complete</span>
            <span className="text-xs text-amber-400 font-medium">{ratingGoal - stats.currentRating} pts to go</span>
          </div>
          {chartRatings.length > 1 && (
            <div className="mt-4 flex items-end gap-1 h-12">
              {chartRatings.slice(-12).map((r, i, arr) => {
                const max = Math.max(...arr.map(x => x.rating));
                const min = Math.min(...arr.map(x => x.rating));
                const h = Math.round(((r.rating - min) / (max - min + 1)) * 100);
                return (
                  <div key={i} className="flex-1 rounded-sm relative group" style={{ height: `${Math.max(h, 10)}%`, background: i === arr.length - 1 ? '#f59e0b' : 'rgba(245,158,11,0.3)' }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-background border border-border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10">{r.rating}</div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">
            {chartRatings.length > 1 ? `Rating history — ${chartRatings.length} entries` : 'Log sessions with a new rating to see your progress chart'}
          </p>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-sm">Recent Sessions</span>
            </div>
            <Link href="/chess/training" className="text-xs text-primary hover:underline">See all</Link>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground p-4 text-center">Loading…</p>
          ) : recentSessions.length === 0 ? (
            <div className="p-6 text-center">
              <Crown className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No sessions yet — log your first above.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentSessions.map(s => {
                const focusKey = s.focusArea ?? s.sessionType;
                const colorClass = FOCUS_COLORS[focusKey] ?? 'text-muted-foreground bg-muted/20';
                const gameResult = s.gamesPlayed > 0 ? `${s.wins}W/${s.losses}L/${s.draws}D` : '';
                const tacticsSummary = s.tacticsSolved ? `${s.tacticsSolved} puzzles` : '';
                return (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-lg">
                    <div className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0', colorClass)}>
                      {focusKey}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {gameResult || tacticsSummary || s.notes || s.sessionType}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{s.sessionDate} · {s.durationMins ?? '?'} mins</p>
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
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">Session Breakdown</span>
            </div>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground p-4 text-center">Loading…</p>
          ) : dbSessions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground">Log sessions to see your breakdown.</p>
            </div>
          ) : (() => {
            const byType: Record<string, number> = {};
            for (const s of dbSessions) {
              const key = s.focusArea ?? s.sessionType;
              byType[key] = (byType[key] ?? 0) + 1;
            }
            const total = dbSessions.length;
            return (
              <div className="space-y-2.5">
                {Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([type, count]) => {
                  const pct = Math.round((count / total) * 100);
                  const colorClass = FOCUS_COLORS[type] ?? 'text-muted-foreground bg-muted/20';
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase w-20 text-center shrink-0', colorClass)}>
                        {type}
                      </div>
                      <div className="flex-1">
                        <Progress value={pct} className="h-1.5" />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{count}×</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Training & Games', href: '/chess/training', icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10', stat: `${stats.trainingHours}h trained` },
          { label: 'Openings Library', href: '/chess/openings', icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-500/10', stat: 'View repertoire' },
          { label: 'Tournaments', href: '/chess/tournaments', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', stat: 'View schedule' },
          { label: 'Analytics', href: '/chess/analytics', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', stat: 'View trends' },
        ].map(c => (
          <Link key={c.href} href={c.href}>
            <Card className="p-4 border-border/50 bg-card/60 hover:bg-card transition-colors cursor-pointer group">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', c.bg)}>
                <c.icon className={cn('w-4 h-4', c.color)} />
              </div>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{c.stat}</p>
            </Card>
          </Link>
        ))}
      </motion.div>

      <LogChessModal open={logModal} onClose={() => setLogModal(false)} userId={userId} onSaved={loadData} />
    </motion.div>
  );
}
