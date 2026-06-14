import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ListMusic, Plus, Trash2, Save, Star, Check } from "lucide-react";
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
  Song, ChordProgress, SongStatus,
  songsData as initSongs, chordsData as initChords,
  SONG_STATUS_COLORS,
} from "@/lib/guitar-data";
import { createSong, deleteSong, updateSong, updateChord, getSongs, getChords } from "@/lib/guitar-supabase";
import { useAuth } from "@/providers/AuthProvider";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const STATUS_LIST: SongStatus[] = ['wish_list', 'learning', 'repertoire', 'polished', 'on_hold'];
const STATUS_LABELS: Record<SongStatus, string> = { wish_list: 'Wish List', learning: 'Learning', repertoire: 'Repertoire', polished: 'Polished', on_hold: 'On Hold' };
const defaultSong = { title: '', artist: '', genre: '', status: 'learning' as SongStatus, difficulty: 2 as 1 | 2 | 3 | 4 | 5, tempo: 80, chords: [] as string[], startDate: new Date().toISOString().slice(0, 10), notes: '' };

export function SongsPage() {
  const [songs, setSongs] = useState<Song[]>(initSongs);
  const [chords, setChords] = useState<ChordProgress[]>(initChords);
  const [filter, setFilter] = useState<SongStatus | 'all'>('all');
  const [dlgOpen, setDlgOpen] = useState(false);
  const [form, setForm] = useState(defaultSong);
  const [chordsInput, setChordsInput] = useState('');
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    getSongs(userId).then(data => setSongs(data));
    getChords(userId).then(data => setChords(data));
  }, [userId]);

  async function saveSong() {
    const chordList = chordsInput ? chordsInput.split(',').map(c => c.trim()).filter(Boolean) : form.chords;
    const s = await createSong(userId, { ...form, chords: chordList });
    setSongs(prev => [s, ...prev]);
    setDlgOpen(false);
    setForm(defaultSong);
    setChordsInput('');
  }

  async function removeSong(id: string) {
    await deleteSong(id);
    setSongs(prev => prev.filter(s => s.id !== id));
  }

  async function cycleStatus(song: Song) {
    const next = STATUS_LIST[(STATUS_LIST.indexOf(song.status) + 1) % STATUS_LIST.length];
    await updateSong(song.id, { status: next, masteredDate: next === 'polished' ? new Date().toISOString().slice(0, 10) : undefined });
    setSongs(prev => prev.map(s => s.id === song.id ? { ...s, status: next } : s));
  }

  async function toggleChord(chord: ChordProgress) {
    const now = new Date().toISOString().slice(0, 10);
    await updateChord(chord.id, { mastered: !chord.mastered, dateMastered: !chord.mastered ? now : undefined });
    setChords(prev => prev.map(c => c.id === chord.id ? { ...c, mastered: !c.mastered } : c));
  }

  const filtered = filter === 'all' ? songs : songs.filter(s => s.status === filter);

  const CHORD_CATS = ['open', 'barre', 'power', 'jazz', 'sus'] as const;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <ListMusic className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Song Library</h2>
            <p className="text-muted-foreground text-sm">{songs.filter(s => ['repertoire', 'polished'].includes(s.status)).length} learned · {songs.filter(s => s.status === 'learning').length} in progress · {songs.length} total</p>
          </div>
        </div>
        <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Song</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Song</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Song Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1" placeholder="e.g. Blackbird" /></div>
                <div><Label className="text-xs">Artist</Label><Input value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))} className="mt-1" placeholder="e.g. The Beatles" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Genre</Label><Input value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))} className="mt-1" placeholder="Rock / Pop / Folk..." /></div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as SongStatus }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_LIST.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Difficulty (1-5)</Label>
                  <Select value={String(form.difficulty)} onValueChange={v => setForm(p => ({ ...p, difficulty: Number(v) as 1 | 2 | 3 | 4 | 5 }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Tempo (BPM)</Label><Input type="number" value={form.tempo} onChange={e => setForm(p => ({ ...p, tempo: Number(e.target.value) }))} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Chords (comma-separated)</Label><Input value={chordsInput} onChange={e => setChordsInput(e.target.value)} className="mt-1" placeholder="Am, G, C, D..." /></div>
              <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="mt-1" rows={2} /></div>
              <Button onClick={saveSong} className="w-full gap-2"><Save className="w-4 h-4" /> Save Song</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="library">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="library">Library ({songs.length})</TabsTrigger>
          <TabsTrigger value="chords">Chords ({chords.filter(c => c.mastered).length}/{chords.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-4 space-y-4">
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {(['all', ...STATUS_LIST] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)} className={cn('px-3 py-1 rounded-full text-xs font-medium transition-colors', filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50')}>
                {s === 'all' ? 'All' : STATUS_LABELS[s]} {s === 'all' ? `(${songs.length})` : `(${songs.filter(sg => sg.status === s).length})`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((s, i) => (
              <motion.div key={s.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.04 }}>
                <Card className="p-4 border-border/50 bg-card/60">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{s.title}</h3>
                        <button onClick={() => cycleStatus(s)} className={cn('text-[10px] font-bold px-2 py-0.5 rounded uppercase cursor-pointer hover:opacity-80', SONG_STATUS_COLORS[s.status])}>
                          {STATUS_LABELS[s.status]}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.artist} · {s.genre} · {s.tempo} BPM</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => <div key={n} className={cn('w-1.5 h-1.5 rounded-full', n <= s.difficulty ? 'bg-amber-400' : 'bg-muted/40')} />)}
                      </div>
                      <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-red-400" onClick={() => removeSong(s.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {s.chords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.chords.map(c => <span key={c} className="text-[10px] font-mono bg-muted/30 px-1.5 py-0.5 rounded">{c}</span>)}
                    </div>
                  )}
                  {s.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.notes}</p>}
                  <p className="text-[10px] text-muted-foreground mt-2">Started {s.startDate}{s.masteredDate ? ` · Polished ${s.masteredDate}` : ''}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chords" className="mt-4 space-y-6">
          {CHORD_CATS.map(cat => {
            const catChords = chords.filter(c => c.category === cat);
            if (catChords.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 capitalize">{cat} Chords</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {catChords.map(c => (
                    <motion.button key={c.id} variants={fadeUp} initial="initial" animate="animate" onClick={() => toggleChord(c)}
                      className={cn('relative p-3 rounded-xl border-2 transition-all text-center group', c.mastered ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border/50 bg-muted/20 hover:border-border')}>
                      <p className={cn('text-base font-bold font-mono', c.mastered ? 'text-emerald-400' : 'text-muted-foreground')}>{c.name}</p>
                      {c.mastered && <Check className="w-3 h-3 text-emerald-400 absolute top-1.5 right-1.5" />}
                      {c.dateMastered && <p className="text-[9px] text-emerald-400/70 mt-0.5">{c.dateMastered.slice(5)}</p>}
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
