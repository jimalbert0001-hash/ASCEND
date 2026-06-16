import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Plus, Trash2, Save, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  ScaleProgress, SkillArea, ScaleStatus,
  scalesData as initScales, skillAreas as initSkillAreas, practiceSessions,
  SCALE_STATUS_COLORS,
} from "@/lib/guitar-data";
import { updateScale, createScale, deleteScale, updateSkillArea, getScales, getSkillAreas } from "@/lib/guitar-supabase";
import { useAuth } from "@/providers/AuthProvider";
import { isDataCleared } from "@/lib/data-cleared";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const SCALE_CYCLE: ScaleStatus[] = ['not_started', 'learning', 'comfortable', 'mastered'];
const tooltipStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' };
const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#06b6d4'];

const practiceByWeek = (() => {
  const weeks: Record<string, number> = {};
  practiceSessions.forEach(s => {
    const d = new Date(s.date);
    const week = `W${Math.ceil(d.getDate() / 7)}`;
    weeks[week] = (weeks[week] || 0) + s.durationMins;
  });
  return Object.entries(weeks).map(([week, mins]) => ({ week, hours: +(mins / 60).toFixed(1) }));
})();

export function ProgressPage() {
  const [scales, setScales] = useState<ScaleProgress[]>(() => isDataCleared() ? [] : initScales);
  const [skills, setSkills] = useState<SkillArea[]>(() => isDataCleared() ? [] : initSkillAreas);
  const [scaleOpen, setScaleOpen] = useState(false);
  const [sf, setSf] = useState({ name: '', positions: 5, positionsMastered: 0, status: 'not_started' as ScaleStatus, notes: '' });
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    getScales(userId).then(data => setScales(data));
    getSkillAreas(userId).then(data => setSkills(data));
  }, [userId]);

  const weekData = isDataCleared() ? [] : practiceByWeek;
  const radarData = skills.map(s => ({ skill: s.name.split(' ')[0], value: s.level, fullMark: 10 }));

  async function cycleScale(scale: ScaleProgress) {
    const next = SCALE_CYCLE[(SCALE_CYCLE.indexOf(scale.status) + 1) % SCALE_CYCLE.length];
    await updateScale(scale.id, { status: next });
    setScales(prev => prev.map(s => s.id === scale.id ? { ...s, status: next } : s));
  }

  async function saveScale() {
    const s = await createScale(userId, { ...sf, modes: [], positionsMastered: Number(sf.positionsMastered), positions: Number(sf.positions) });
    setScales(prev => [...prev, s]);
    setScaleOpen(false);
    setSf({ name: '', positions: 5, positionsMastered: 0, status: 'not_started', notes: '' });
  }

  async function removeScale(id: string) {
    await deleteScale(id);
    setScales(prev => prev.filter(s => s.id !== id));
  }

  async function adjustSkill(id: string, delta: number) {
    const skill = skills.find(s => s.id === id);
    if (!skill) return;
    const newLevel = Math.max(1, Math.min(10, skill.level + delta));
    await updateSkillArea(id, { level: newLevel });
    setSkills(prev => prev.map(s => s.id === id ? { ...s, level: newLevel } : s));
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Progress Tracker</h2>
          <p className="text-muted-foreground text-sm">Skill levels, scales & milestones</p>
        </div>
      </div>

      <Tabs defaultValue="skills">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="skills">Skill Map</TabsTrigger>
          <TabsTrigger value="scales">Scales ({scales.filter(s => s.status === 'mastered').length}/{scales.length})</TabsTrigger>
          <TabsTrigger value="practice">Practice Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <Card className="p-5 border-border/50 bg-card/60">
              <h3 className="font-semibold text-sm mb-4">Skill Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="Level" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* Skill Sliders */}
            <Card className="p-5 border-border/50 bg-card/60">
              <h3 className="font-semibold text-sm mb-4">Skill Levels</h3>
              <div className="space-y-4">
                {skills.map(skill => (
                  <div key={skill.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">{skill.name}</span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => adjustSkill(skill.id, -1)} className="w-5 h-5 rounded bg-muted/30 text-muted-foreground hover:bg-muted/50 text-xs font-bold flex items-center justify-center">−</button>
                        <span className={cn('text-xs font-bold w-8 text-center', skill.color)}>{skill.level}/10</span>
                        <button onClick={() => adjustSkill(skill.id, 1)} className="w-5 h-5 rounded bg-muted/30 text-muted-foreground hover:bg-muted/50 text-xs font-bold flex items-center justify-center">+</button>
                      </div>
                    </div>
                    <Progress value={skill.level * 10} className="h-2" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Last practiced: {skill.lastPracticed}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scales" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Dialog open={scaleOpen} onOpenChange={setScaleOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Scale</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Add Scale</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div><Label className="text-xs">Scale Name</Label><Input value={sf.name} onChange={e => setSf(p => ({ ...p, name: e.target.value }))} className="mt-1" placeholder="e.g. Pentatonic Minor" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Total Positions</Label><Input type="number" value={sf.positions} onChange={e => setSf(p => ({ ...p, positions: Number(e.target.value) }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Positions Mastered</Label><Input type="number" value={sf.positionsMastered} onChange={e => setSf(p => ({ ...p, positionsMastered: Number(e.target.value) }))} className="mt-1" /></div>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={sf.status} onValueChange={v => setSf(p => ({ ...p, status: v as ScaleStatus }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="mastered">Mastered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Notes</Label><Textarea value={sf.notes} onChange={e => setSf(p => ({ ...p, notes: e.target.value }))} className="mt-1" rows={2} /></div>
                  <Button onClick={saveScale} className="w-full gap-2"><Save className="w-4 h-4" /> Save Scale</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {scales.map((scale, i) => (
            <motion.div key={scale.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.04 }}>
              <Card className="p-4 border-border/50 bg-card/60">
                <div className="flex items-center gap-3">
                  <button onClick={() => cycleScale(scale)} className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors', scale.status === 'mastered' ? 'bg-emerald-500 border-emerald-500' : scale.status === 'comfortable' ? 'bg-sky-500 border-sky-500' : scale.status === 'learning' ? 'border-amber-400' : 'border-muted')}>
                    {scale.status === 'mastered' && <Check className="w-4 h-4 text-white" />}
                    {scale.status === 'comfortable' && <Check className="w-4 h-4 text-white" />}
                    {scale.status === 'learning' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold">{scale.name}</p>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded capitalize', SCALE_STATUS_COLORS[scale.status])}>
                        {scale.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                          <span>Positions</span>
                          <span className="text-sky-400 font-semibold">{scale.positionsMastered}/{scale.positions}</span>
                        </div>
                        <Progress value={(scale.positionsMastered / scale.positions) * 100} className="h-1.5" />
                      </div>
                    </div>
                    {scale.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{scale.notes}</p>}
                    {scale.modes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {scale.modes.map(m => <span key={m} className="text-[10px] bg-muted/30 px-1.5 py-0.5 rounded text-muted-foreground">{m}</span>)}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-red-400 shrink-0" onClick={() => removeScale(scale.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="practice" className="mt-4 space-y-4">
          {/* Practice by Focus Bar Chart */}
          <Card className="p-5 border-border/50 bg-card/60">
            <h3 className="font-semibold text-sm mb-4">Practice by Week (Hours)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}h`, 'Practice']} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {weekData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Focus Breakdown */}
          <Card className="p-5 border-border/50 bg-card/60">
            <h3 className="font-semibold text-sm mb-4">Practice Focus Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(() => {
                const focusMap: Record<string, number> = {};
                practiceSessions.forEach(s => { focusMap[s.focus] = (focusMap[s.focus] || 0) + s.durationMins; });
                const total = Object.values(focusMap).reduce((a, b) => a + b, 0);
                return Object.entries(focusMap).sort((a, b) => b[1] - a[1]).map(([focus, mins]) => (
                  <div key={focus} className="bg-muted/20 rounded-lg p-3 text-center">
                    <p className="text-lg font-black">{Math.round(mins / 60)}h</p>
                    <p className="text-xs capitalize text-muted-foreground mt-0.5">{focus}</p>
                    <p className="text-[10px] text-muted-foreground">{Math.round((mins / total) * 100)}%</p>
                  </div>
                ));
              })()}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
