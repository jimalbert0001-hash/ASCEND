import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Plus, Trash2, Save, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Tournament, TournamentFormat, tournamentsData as initTournaments } from "@/lib/chess-data";
import { createTournament, deleteTournament, getTournaments } from "@/lib/chess-supabase";
import { useAuth } from "@/providers/AuthProvider";
import { isDataCleared } from "@/lib/data-cleared";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const defaultForm = { name: '', date: new Date().toISOString().slice(0, 10), format: 'rapid' as TournamentFormat, result: '', score: '', rounds: 5, ratingBefore: 1450, ratingAfter: 1450, location: '', notes: '' };

export function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => isDataCleared() ? [] : initTournaments);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    getTournaments(userId).then(data => setTournaments(data ?? []));
  }, [userId]);

  async function saveTournament() {
    const t = await createTournament(userId, { ...form, rounds: Number(form.rounds), ratingBefore: Number(form.ratingBefore), ratingAfter: Number(form.ratingAfter) });
    setTournaments(prev => [t, ...prev.sort((a, b) => b.date.localeCompare(a.date))]);
    setDlgOpen(false);
    setForm(defaultForm);
  }

  async function removeTournament(id: string) {
    await deleteTournament(id);
    setTournaments(prev => prev.filter(t => t.id !== id));
  }

  const totalRatingGain = tournaments.reduce((s, t) => s + (t.ratingAfter - t.ratingBefore), 0);
  const avgGain = Math.round(totalRatingGain / (tournaments.length || 1));

  const FORMAT_COLORS: Record<TournamentFormat, string> = {
    classical: 'text-emerald-400 bg-emerald-500/10',
    rapid: 'text-sky-400 bg-sky-500/10',
    blitz: 'text-amber-400 bg-amber-500/10',
    bullet: 'text-orange-400 bg-orange-500/10',
    correspondence: 'text-violet-400 bg-violet-500/10',
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Tournaments</h2>
            <p className="text-muted-foreground text-sm">{tournaments.length} tournaments · Avg rating change: {avgGain >= 0 ? '+' : ''}{avgGain}</p>
          </div>
        </div>
        <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Tournament</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Log Tournament</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label className="text-xs">Tournament Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" placeholder="e.g. District Open" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-1" /></div>
                <div>
                  <Label className="text-xs">Format</Label>
                  <Select value={form.format} onValueChange={v => setForm(p => ({ ...p, format: v as TournamentFormat }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['classical', 'rapid', 'blitz', 'bullet', 'correspondence'] as TournamentFormat[]).map(f => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Result / Placement</Label><Input value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))} className="mt-1" placeholder="e.g. 3rd Place" /></div>
                <div><Label className="text-xs">Score</Label><Input value={form.score} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} className="mt-1" placeholder="e.g. 4.5/7" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">Rounds</Label><Input type="number" value={form.rounds} onChange={e => setForm(p => ({ ...p, rounds: Number(e.target.value) }))} className="mt-1" /></div>
                <div><Label className="text-xs">Rating Before</Label><Input type="number" value={form.ratingBefore} onChange={e => setForm(p => ({ ...p, ratingBefore: Number(e.target.value) }))} className="mt-1" /></div>
                <div><Label className="text-xs">Rating After</Label><Input type="number" value={form.ratingAfter} onChange={e => setForm(p => ({ ...p, ratingAfter: Number(e.target.value) }))} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Location</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="mt-1" placeholder="Chennai / Online" /></div>
              <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="mt-1" rows={2} /></div>
              <Button onClick={saveTournament} className="w-full gap-2"><Save className="w-4 h-4" /> Save Tournament</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Played', value: tournaments.length, color: 'text-amber-400' },
          { label: 'Total Rating Gain', value: `${totalRatingGain >= 0 ? '+' : ''}${totalRatingGain}`, color: totalRatingGain >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Classical', value: tournaments.filter(t => t.format === 'classical').length, color: 'text-emerald-400' },
          { label: 'Online', value: tournaments.filter(t => t.location === 'Online').length, color: 'text-sky-400' },
        ].map(s => (
          <Card key={s.label} className="p-3 border-border/50 bg-card/60 text-center">
            <p className={cn('text-xl font-black', s.color)}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Tournament List */}
      <div className="space-y-3">
        {[...tournaments].sort((a, b) => b.date.localeCompare(a.date)).map((t, i) => {
          const ratingDiff = t.ratingAfter - t.ratingBefore;
          return (
            <motion.div key={t.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.05 }}>
              <Card className="p-5 border-border/50 bg-card/60">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold">{t.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{t.date}</span>
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded capitalize', FORMAT_COLORS[t.format])}>{t.format}</span>
                          <span className="text-xs text-muted-foreground">{t.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold">{t.result}</p>
                          <p className="text-xs text-muted-foreground">{t.score} ({t.rounds} rounds)</p>
                        </div>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-red-400" onClick={() => removeTournament(t.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-3 bg-muted/20 rounded-lg px-3 py-2">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">Before</p>
                          <p className="text-sm font-bold">{t.ratingBefore}</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">After</p>
                          <p className="text-sm font-bold">{t.ratingAfter}</p>
                        </div>
                        <div className={cn('flex items-center gap-0.5 text-sm font-bold ml-2', ratingDiff >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {ratingDiff >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {Math.abs(ratingDiff)}
                        </div>
                      </div>
                    </div>

                    {t.notes && <p className="text-xs text-muted-foreground mt-2">{t.notes}</p>}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
