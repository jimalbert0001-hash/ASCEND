import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Trash2, Edit3, Save, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChessOpening, EndgameStudy, openingsData as initOpenings, endgameStudies as initEndgames,
  OpeningStatus, OPENING_STATUS_COLORS, ENDGAME_STATUS_COLORS, EndgameStatus, EndgameCategory,
} from "@/lib/chess-data";
import { createOpening, deleteOpening, updateOpening, createEndgameStudy, deleteEndgameStudy, updateEndgameStudy, getOpenings, getEndgameStudies } from "@/lib/chess-supabase";
import { useAuth } from "@/providers/AuthProvider";
import { isDataCleared } from "@/lib/data-cleared";

const STATUS_CYCLE: OpeningStatus[] = ['learning', 'mastered', 'dropped'];
const ENDGAME_CYCLE: EndgameStatus[] = ['not_started', 'in_progress', 'mastered'];
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const defaultOp = { name: '', eco: '', color: 'white' as 'white' | 'black', moves: '', winRate: 50, gamesPlayed: 0, status: 'learning' as OpeningStatus, notes: '', tags: [] as string[] };

const STARTER_OPENINGS: Omit<ChessOpening, 'id'>[] = [
  { name: "King's Pawn Opening", eco: 'B00', color: 'white', moves: '1.e4', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'The most popular first move. Controls the centre and opens lines for bishop and queen.', tags: ['e4', 'beginner', 'centre-control'] },
  { name: 'Italian Game', eco: 'C50', color: 'white', moves: '1.e4 e5 2.Nf3 Nc6 3.Bc4', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'Develops bishop to active square targeting f7. One of the oldest openings.', tags: ['e4', 'classical', 'beginner'] },
  { name: 'Ruy Lopez (Spanish Game)', eco: 'C60', color: 'white', moves: '1.e4 e5 2.Nf3 Nc6 3.Bb5', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'Pins the knight defending e5. One of the most played openings at all levels.', tags: ['e4', 'classical', 'aggressive'] },
  { name: "Queen's Gambit", eco: 'D06', color: 'white', moves: '1.d4 d5 2.c4', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'Offers a pawn to gain centre control. Not a true gambit as the pawn can be easily recovered.', tags: ['d4', 'positional', 'classical'] },
  { name: 'London System', eco: 'D02', color: 'white', moves: '1.d4 2.Nf3 3.Bf4', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'A solid, easy-to-learn system. Bishop developed outside the pawn chain early.', tags: ['d4', 'solid', 'positional'] },
  { name: "Scholar's Mate Attempt", eco: 'C20', color: 'white', moves: '1.e4 e5 2.Bc4 Nc6 3.Qh5', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'Attempts quick checkmate on f7. Easily refuted by experienced players but good to know.', tags: ['e4', 'trap', 'beginner'] },
  { name: 'Sicilian Defense', eco: 'B20', color: 'black', moves: '1.e4 c5', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'Most popular reply to 1.e4. Creates imbalanced positions with winning chances for both sides.', tags: ['e4', 'aggressive', 'popular'] },
  { name: 'French Defense', eco: 'C00', color: 'black', moves: '1.e4 e6', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'Solid but slightly passive. Leads to closed positions with counterplay on the queenside.', tags: ['e4', 'solid', 'positional'] },
  { name: 'Caro-Kann Defense', eco: 'B10', color: 'black', moves: '1.e4 c6', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'Very solid reply to 1.e4. Similar to French but avoids blocking the dark-squared bishop.', tags: ['e4', 'solid', 'classical'] },
  { name: "King's Indian Defense", eco: 'E60', color: 'black', moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'Allows White to build a big centre then attacks it. Used by Kasparov and Fischer.', tags: ['d4', 'aggressive', 'hypermodern'] },
  { name: "Defense against Scholar's Mate", eco: 'C20', color: 'black', moves: '1.e4 e5 2.Qh5 Nc6 3.Bc4 g6 4.Qf3 Nf6', winRate: 0, gamesPlayed: 0, status: 'learning', notes: 'Correct way to defend against Scholar\'s Mate attempt. Develop and block the queen.', tags: ['defensive', 'trap-busting', 'beginner'] },
];

const STARTER_ENDGAMES: Omit<EndgameStudy, 'id'>[] = [
  { title: 'King and Queen vs King', category: 'queen', status: 'not_started', difficulty: 1, notes: 'Basic checkmate. Use queen to restrict king to edge, bring your king close to help.' },
  { title: 'King and Rook vs King', category: 'rook', status: 'not_started', difficulty: 2, notes: 'Slightly harder than K+Q. Use rook to cut off files, drive enemy king to edge.' },
  { title: 'King and Pawn Endgames', category: 'king_pawn', status: 'not_started', difficulty: 2, notes: 'Most important endgame. Understand opposition and the square of the pawn.' },
];

const INIT_FLAG = 'openings-initialized';

export function OpeningsPage() {
  const [openings, setOpenings] = useState<ChessOpening[]>(() => isDataCleared() ? [] : initOpenings);
  const [endgames, setEndgames] = useState<EndgameStudy[]>(() => isDataCleared() ? [] : initEndgames);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [form, setForm] = useState(defaultOp);
  const [tagsInput, setTagsInput] = useState('');
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    async function loadAndSeed() {
      const [ops, egs] = await Promise.all([getOpenings(userId), getEndgameStudies(userId)]);
      if (ops.length === 0 && egs.length === 0 && !localStorage.getItem(INIT_FLAG)) {
        localStorage.setItem(INIT_FLAG, '1');
        const createdOps = await Promise.all(STARTER_OPENINGS.map(op => createOpening(userId, op)));
        const createdEgs = await Promise.all(STARTER_ENDGAMES.map(eg => createEndgameStudy(userId, eg)));
        setOpenings(createdOps);
        setEndgames(createdEgs);
      } else {
        setOpenings(ops);
        setEndgames(egs);
      }
    }
    loadAndSeed();
  }, [userId]);

  async function saveOpening() {
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : form.tags;
    const op = await createOpening(userId, { ...form, tags, winRate: Number(form.winRate), gamesPlayed: Number(form.gamesPlayed) });
    setOpenings(prev => [op, ...prev]);
    setDlgOpen(false);
    setForm(defaultOp);
    setTagsInput('');
  }

  async function removeOpening(id: string) {
    await deleteOpening(id);
    setOpenings(prev => prev.filter(o => o.id !== id));
  }

  async function cycleStatus(op: ChessOpening) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(op.status) + 1) % STATUS_CYCLE.length];
    await updateOpening(op.id, { status: next });
    setOpenings(prev => prev.map(o => o.id === op.id ? { ...o, status: next } : o));
  }

  async function cycleEndgame(eg: EndgameStudy) {
    const next = ENDGAME_CYCLE[(ENDGAME_CYCLE.indexOf(eg.status) + 1) % ENDGAME_CYCLE.length];
    await updateEndgameStudy(eg.id, { status: next, completedAt: next === 'mastered' ? new Date().toISOString().slice(0, 10) : undefined });
    setEndgames(prev => prev.map(e => e.id === eg.id ? { ...e, status: next } : e));
  }

  async function removeEndgame(id: string) {
    await deleteEndgameStudy(id);
    setEndgames(prev => prev.filter(e => e.id !== id));
  }

  const whiteOpenings = openings.filter(o => o.color === 'white');
  const blackOpenings = openings.filter(o => o.color === 'black');
  const masteredEndgames = endgames.filter(e => e.status === 'mastered').length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Openings Library</h2>
            <p className="text-muted-foreground text-sm">{openings.filter(o => o.status === 'mastered').length} openings mastered · {masteredEndgames}/{endgames.length} endgames done</p>
          </div>
        </div>
        <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Opening</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Opening</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Opening Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" placeholder="e.g. Sicilian Defense" /></div>
                <div><Label className="text-xs">ECO Code</Label><Input value={form.eco} onChange={e => setForm(p => ({ ...p, eco: e.target.value }))} className="mt-1" placeholder="e.g. B20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Color</Label>
                  <Select value={form.color} onValueChange={v => setForm(p => ({ ...p, color: v as 'white' | 'black' }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as OpeningStatus }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="mastered">Mastered</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Move Order</Label><Input value={form.moves} onChange={e => setForm(p => ({ ...p, moves: e.target.value }))} className="mt-1" placeholder="1.e4 c5 2.Nf3..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Win Rate (%)</Label><Input type="number" value={form.winRate} onChange={e => setForm(p => ({ ...p, winRate: Number(e.target.value) }))} className="mt-1" /></div>
                <div><Label className="text-xs">Games Played</Label><Input type="number" value={form.gamesPlayed} onChange={e => setForm(p => ({ ...p, gamesPlayed: Number(e.target.value) }))} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Tags (comma-separated)</Label><Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="mt-1" placeholder="e4, sharp, aggressive" /></div>
              <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="mt-1" rows={2} /></div>
              <Button onClick={saveOpening} className="w-full gap-2"><Save className="w-4 h-4" /> Save Opening</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="white">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="white">White ({whiteOpenings.length})</TabsTrigger>
          <TabsTrigger value="black">Black ({blackOpenings.length})</TabsTrigger>
          <TabsTrigger value="endgames">Endgames ({endgames.length})</TabsTrigger>
        </TabsList>

        {(['white', 'black'] as const).map(color => (
          <TabsContent key={color} value={color} className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(color === 'white' ? whiteOpenings : blackOpenings).map((op, i) => (
              <motion.div key={op.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.05 }}>
                <Card className="p-4 border-border/50 bg-card/60">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">{op.eco}</span>
                        <h3 className="font-semibold text-sm">{op.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{op.moves}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => cycleStatus(op)} className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer hover:opacity-80', OPENING_STATUS_COLORS[op.status])}>
                        {op.status}
                      </button>
                      <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-red-400" onClick={() => removeOpening(op.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>Win Rate</span><span className="text-emerald-400 font-semibold">{op.winRate}%</span>
                      </div>
                      <Progress value={op.winRate} className="h-1" />
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{op.gamesPlayed} games</span>
                  </div>
                  {op.notes && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{op.notes}</p>}
                  {op.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {op.tags.map(t => <span key={t} className="text-[10px] bg-muted/30 px-1.5 py-0.5 rounded text-muted-foreground">{t}</span>)}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        ))}

        <TabsContent value="endgames" className="mt-4 space-y-3">
          {endgames.map((eg, i) => (
            <motion.div key={eg.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.04 }}>
              <Card className="p-4 border-border/50 bg-card/60 flex items-center gap-3">
                <button onClick={() => cycleEndgame(eg)} className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors', eg.status === 'mastered' ? 'bg-emerald-500 border-emerald-500' : eg.status === 'in_progress' ? 'border-amber-400' : 'border-muted')}>
                  {eg.status === 'mastered' && <Check className="w-4 h-4 text-white" />}
                  {eg.status === 'in_progress' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{eg.title}</p>
                    <span className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded capitalize">{eg.category.replace('_', ' ')}</span>
                  </div>
                  {eg.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{eg.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => <div key={n} className={cn('w-1.5 h-1.5 rounded-full', n <= eg.difficulty ? 'bg-amber-400' : 'bg-muted/40')} />)}
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded capitalize', ENDGAME_STATUS_COLORS[eg.status])}>
                    {eg.status.replace('_', ' ')}
                  </span>
                  <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-red-400" onClick={() => removeEndgame(eg.id)}>
                    <Trash2 className="w-3 h-3" />
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
