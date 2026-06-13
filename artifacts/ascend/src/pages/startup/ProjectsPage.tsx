import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, Lightbulb, Plus, Pencil, Trash2, Star, ChevronDown, ExternalLink, Users, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  projectsData, ideasData, getProjectStats,
  StartupProject, IdeaVaultItem, ProjectStage, ProjectStatus, IdeaStatus,
  STAGE_LABELS, STAGE_COLOR,
} from "@/lib/startup-data";
import { createProject, updateProject, deleteProject, createIdea, updateIdea, deleteIdea, getProjects, getIdeas } from "@/lib/startup-supabase";
import { useAuth } from "@/providers/AuthProvider";

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const COLORS = ['violet', 'emerald', 'cyan', 'blue', 'rose', 'amber', 'orange', 'pink'] as const;
const COLOR_HEX: Record<string, string> = {
  violet: '#8b5cf6', emerald: '#10b981', cyan: '#06b6d4', blue: '#3b82f6',
  rose: '#f43f5e', amber: '#f59e0b', orange: '#f97316', pink: '#ec4899',
};
const ACCENT: Record<string, string> = {
  violet: 'text-violet-400 bg-violet-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
  cyan: 'text-cyan-400 bg-cyan-500/10',
  blue: 'text-blue-400 bg-blue-500/10',
  rose: 'text-rose-400 bg-rose-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  orange: 'text-orange-400 bg-orange-500/10',
  pink: 'text-pink-400 bg-pink-500/10',
};
const IDEA_STATUS_COLORS: Record<IdeaStatus, string> = {
  raw: 'text-muted-foreground bg-muted/30',
  refined: 'text-amber-400 bg-amber-500/10',
  validated: 'text-emerald-400 bg-emerald-500/10',
  dropped: 'text-red-400 bg-red-500/10',
};

// ─── Project Modal ────────────────────────────────────────────────────────────
function ProjectModal({ open, onClose, onSaved, initial }: {
  open: boolean; onClose: () => void; onSaved: (p: StartupProject) => void; initial?: StartupProject;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [stage, setStage] = useState<ProjectStage>(initial?.stage ?? 'idea');
  const [color, setColor] = useState(initial?.color ?? 'violet');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [teamSize, setTeamSize] = useState(String(initial?.teamSize ?? '1'));
  const [saving, setSaving] = useState(false);

  const { user: modalUser } = useAuth();
  const modalUserId = modalUser?.id ?? 'mock-user-1';

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(), tagline: tagline.trim(), description: description.trim(),
      stage, status: (initial?.status ?? 'active') as ProjectStatus,
      color, colorHex: COLOR_HEX[color] ?? '#8b5cf6',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      teamSize: parseInt(teamSize) || 1,
      createdAt: initial?.createdAt ?? new Date().toISOString().split('T')[0],
    };
    let result: StartupProject;
    if (initial) {
      await updateProject(initial.id, payload);
      result = { ...initial, ...payload };
    } else {
      result = await createProject(modalUserId, payload);
    }
    setSaving(false);
    onSaved(result);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-lg">
        <DialogHeader><DialogTitle>{initial ? 'Edit Project' : 'New Project'}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs mb-1.5 block">Project Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. EduFlow" className="bg-background/50" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1.5 block">Tagline</Label>
              <Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="One-liner pitch" className="bg-background/50" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Stage</Label>
              <Select value={stage} onValueChange={v => setStage(v as ProjectStage)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STAGE_LABELS) as ProjectStage[]).map(s => (
                    <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Team Size</Label>
              <Input value={teamSize} onChange={e => setTeamSize(e.target.value)} type="number" min="1" className="bg-background/50" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1.5 block">Colour</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all border-2 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: COLOR_HEX[c] }} />
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1.5 block">Tags (comma separated)</Label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="EdTech, SaaS, AI" className="bg-background/50" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1.5 block">Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this startup do?" className="bg-background/50 resize-none text-sm" rows={3} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()} className="flex-1">{saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Project'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Idea Modal ───────────────────────────────────────────────────────────────
function IdeaModal({ open, onClose, onSaved, initial }: {
  open: boolean; onClose: () => void; onSaved: (i: IdeaVaultItem) => void; initial?: IdeaVaultItem;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [problem, setProblem] = useState(initial?.problem ?? '');
  const [solution, setSolution] = useState(initial?.solution ?? '');
  const [targetMarket, setTargetMarket] = useState(initial?.targetMarket ?? '');
  const [status, setStatus] = useState<IdeaStatus>(initial?.status ?? 'raw');
  const [rating, setRating] = useState(String(initial?.rating ?? '3'));
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [saving, setSaving] = useState(false);

  const { user: ideaUser } = useAuth();
  const ideaUserId = ideaUser?.id ?? 'mock-user-1';

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const payload = {
      title: title.trim(), description: description.trim(), problem: problem.trim(),
      solution: solution.trim(), targetMarket: targetMarket.trim(),
      status, rating: parseInt(rating) as 1 | 2 | 3 | 4 | 5,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: initial?.createdAt ?? new Date().toISOString().split('T')[0],
    };
    let result: IdeaVaultItem;
    if (initial) {
      await updateIdea(initial.id, payload);
      result = { ...initial, ...payload };
    } else {
      result = await createIdea(ideaUserId, payload);
    }
    setSaving(false);
    onSaved(result);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-lg">
        <DialogHeader><DialogTitle>{initial ? 'Edit Idea' : 'Add Idea'}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs mb-1.5 block">Idea Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Campus Gig Marketplace" className="bg-background/50" />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Quick summary" className="bg-background/50 resize-none text-sm" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Problem</Label>
              <Textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder="What pain does it solve?" className="bg-background/50 resize-none text-sm" rows={2} />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Solution</Label>
              <Textarea value={solution} onChange={e => setSolution(e.target.value)} placeholder="How does it solve it?" className="bg-background/50 resize-none text-sm" rows={2} />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Target Market</Label>
            <Input value={targetMarket} onChange={e => setTargetMarket(e.target.value)} placeholder="Who are the users?" className="bg-background/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as IdeaStatus)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw">Raw</SelectItem>
                  <SelectItem value="refined">Refined</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Rating (1–5)</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n} {'★'.repeat(n)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Tags (comma separated)</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="EdTech, AI, B2C" className="bg-background/50" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1">{saving ? 'Saving…' : initial ? 'Save' : 'Add Idea'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ProjectsPage() {
  const [projects, setProjects] = useState<StartupProject[]>(projectsData);
  const [ideas, setIdeas] = useState<IdeaVaultItem[]>(ideasData);
  const [projectModal, setProjectModal] = useState(false);
  const [editProject, setEditProject] = useState<StartupProject | undefined>();
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    getProjects(userId).then(data => setProjects(data));
    getIdeas(userId).then(data => setIdeas(data));
  }, [userId]);
  const [ideaModal, setIdeaModal] = useState(false);
  const [editIdea, setEditIdea] = useState<IdeaVaultItem | undefined>();
  const [ideaFilter, setIdeaFilter] = useState<IdeaStatus | '__all__'>('__all__');

  function handleProjectSaved(p: StartupProject) {
    setProjects(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      return idx >= 0 ? prev.map(x => x.id === p.id ? p : x) : [p, ...prev];
    });
  }

  function handleIdeaSaved(i: IdeaVaultItem) {
    setIdeas(prev => {
      const idx = prev.findIndex(x => x.id === i.id);
      return idx >= 0 ? prev.map(x => x.id === i.id ? i : x) : [i, ...prev];
    });
  }

  async function handleDeleteProject(id: string) {
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  async function handleDeleteIdea(id: string) {
    await deleteIdea(id);
    setIdeas(prev => prev.filter(i => i.id !== id));
  }

  const filteredIdeas = ideaFilter === '__all__' ? ideas : ideas.filter(i => i.status === ideaFilter);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <motion.header variants={fadeUp} initial="initial" animate="animate" className="flex items-center gap-4">
        <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
          <Rocket className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects & Ideas</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your ventures and idea vault</p>
        </div>
      </motion.header>

      <Tabs defaultValue="projects">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="ideas">Idea Vault ({ideas.length})</TabsTrigger>
        </TabsList>

        {/* ─── Projects Tab ─── */}
        <TabsContent value="projects" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditProject(undefined); setProjectModal(true); }} className="gap-2">
              <Plus className="w-4 h-4" />New Project
            </Button>
          </div>
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => {
              const [textCol, bgCol] = (ACCENT[p.color] ?? ACCENT.violet).split(' ');
              const stats = getProjectStats(p.id);
              return (
                <motion.div key={p.id} variants={fadeUp}>
                  <Card className="p-5 border-border/50 bg-card/60 backdrop-blur">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${bgCol} flex items-center justify-center shrink-0`}>
                          <Rocket className={`w-5 h-5 ${textCol}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{p.name}</h3>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${STAGE_COLOR[p.stage]}`}>{STAGE_LABELS[p.stage]}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditProject(p); setProjectModal(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteProject(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="bg-muted/20 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Users className="w-3 h-3" />Users</div>
                        <p className="font-bold">{stats.totalUsers.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><DollarSign className="w-3 h-3" />MRR</div>
                        <p className="font-bold">${stats.mrr.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-2 text-muted-foreground">
                        <p className="mb-0.5">Team</p>
                        <p className="font-bold text-foreground">{p.teamSize}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">{t}</span>)}
                    </div>
                    {p.website && (
                      <a href={`https://${p.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                        <ExternalLink className="w-3 h-3" />{p.website}
                      </a>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        {/* ─── Idea Vault Tab ─── */}
        <TabsContent value="ideas" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {(['__all__', 'raw', 'refined', 'validated', 'dropped'] as const).map(f => (
                <button key={f} onClick={() => setIdeaFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${ideaFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>
                  {f === '__all__' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <Button onClick={() => { setEditIdea(undefined); setIdeaModal(true); }} className="gap-2">
              <Plus className="w-4 h-4" />Add Idea
            </Button>
          </div>
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-3">
            {filteredIdeas.map(idea => (
              <motion.div key={idea.id} variants={fadeUp}>
                <Card className="p-4 border-border/50 bg-card/60 backdrop-blur">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm">{idea.title}</h4>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${IDEA_STATUS_COLORS[idea.status]}`}>{idea.status}</span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star key={n} className={`w-3 h-3 ${n <= idea.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditIdea(idea); setIdeaModal(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteIdea(idea.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{idea.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                        <div>
                          <span className="text-muted-foreground font-medium">Problem: </span>
                          <span className="text-foreground/80 line-clamp-1">{idea.problem}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Market: </span>
                          <span className="text-foreground/80 line-clamp-1">{idea.targetMarket}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {idea.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">{t}</span>)}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>

      <ProjectModal open={projectModal} onClose={() => setProjectModal(false)} onSaved={handleProjectSaved} initial={editProject} />
      <IdeaModal open={ideaModal} onClose={() => setIdeaModal(false)} onSaved={handleIdeaSaved} initial={editIdea} />
    </div>
  );
}
