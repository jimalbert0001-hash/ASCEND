import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Bug, Plus, Pencil, Trash2, ThumbsUp, AlertTriangle, CheckCircle2, Circle, ArrowUpCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  projectsData, featuresData, bugsData,
  Feature, BugReport, FeatureStatus, Effort, Priority, BugSeverity, BugStatus,
  PRIORITY_COLORS, SEVERITY_COLORS,
} from "@/lib/startup-data";
import { createFeature, updateFeature, deleteFeature, createBug, updateBug, deleteBug, getFeatures, getBugs } from "@/lib/startup-supabase";
import { useAuth } from "@/providers/AuthProvider";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const FEATURE_STATUS_COLORS: Record<FeatureStatus, string> = {
  idea: 'text-muted-foreground bg-muted/30',
  planned: 'text-sky-400 bg-sky-500/10',
  in_progress: 'text-amber-400 bg-amber-500/10',
  done: 'text-emerald-400 bg-emerald-500/10',
};
const EFFORT_COLORS: Record<Effort, string> = {
  xs: 'text-emerald-400 bg-emerald-500/10',
  s: 'text-sky-400 bg-sky-500/10',
  m: 'text-blue-400 bg-blue-500/10',
  l: 'text-amber-400 bg-amber-500/10',
  xl: 'text-red-400 bg-red-500/10',
};
const BUG_STATUS_ICONS: Record<BugStatus, any> = {
  open: Circle,
  in_progress: ArrowUpCircle,
  resolved: CheckCircle2,
  wontfix: XCircle,
};

// ─── Feature Modal ─────────────────────────────────────────────────────────────
function FeatureModal({ open, onClose, onSaved, projectId, initial }: {
  open: boolean; onClose: () => void; onSaved: (f: Feature) => void; projectId: string; initial?: Feature;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<FeatureStatus>(initial?.status ?? 'idea');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [effort, setEffort] = useState<Effort>(initial?.effort ?? 'm');
  const [impact, setImpact] = useState<'low' | 'medium' | 'high'>(initial?.impact ?? 'medium');
  const [requestedBy, setRequestedBy] = useState(initial?.requestedBy ?? '');
  const [saving, setSaving] = useState(false);
  const { user: featUser } = useAuth();
  const featUserId = featUser?.id ?? 'mock-user-1';

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const payload = {
      projectId, title: title.trim(), description: description.trim(),
      status, priority, effort, impact,
      requestedBy: requestedBy.trim() || undefined,
      votes: initial?.votes ?? 0,
      createdAt: initial?.createdAt ?? new Date().toISOString().split('T')[0],
    };
    let result: Feature;
    if (initial) {
      await updateFeature(initial.id, payload);
      result = { ...initial, ...payload };
    } else {
      result = await createFeature(featUserId, payload);
    }
    setSaving(false);
    onSaved(result);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader><DialogTitle>{initial ? 'Edit Feature' : 'Add Feature'}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs mb-1.5 block">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. AI flashcard generator" className="bg-background/50" />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What should this feature do?" className="bg-background/50 resize-none text-sm" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as FeatureStatus)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Priority</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Effort</Label>
              <Select value={effort} onValueChange={v => setEffort(v as Effort)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="xs">XS — Tiny</SelectItem>
                  <SelectItem value="s">S — Small</SelectItem>
                  <SelectItem value="m">M — Medium</SelectItem>
                  <SelectItem value="l">L — Large</SelectItem>
                  <SelectItem value="xl">XL — Epic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Impact</Label>
              <Select value={impact} onValueChange={v => setImpact(v as any)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Requested By (optional)</Label>
            <Input value={requestedBy} onChange={e => setRequestedBy(e.target.value)} placeholder="e.g. User survey, Power users" className="bg-background/50" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1">{saving ? 'Saving…' : initial ? 'Save' : 'Add Feature'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bug Modal ────────────────────────────────────────────────────────────────
function BugModal({ open, onClose, onSaved, projectId, initial }: {
  open: boolean; onClose: () => void; onSaved: (b: BugReport) => void; projectId: string; initial?: BugReport;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [severity, setSeverity] = useState<BugSeverity>(initial?.severity ?? 'medium');
  const [status, setStatus] = useState<BugStatus>(initial?.status ?? 'open');
  const [saving, setSaving] = useState(false);
  const { user: bugUser } = useAuth();
  const bugUserId = bugUser?.id ?? 'mock-user-1';

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const payload = {
      projectId, title: title.trim(), description: description.trim(),
      severity, status,
      reportedAt: initial?.reportedAt ?? new Date().toISOString().split('T')[0],
      resolvedAt: status === 'resolved' ? (initial?.resolvedAt ?? new Date().toISOString().split('T')[0]) : undefined,
    };
    let result: BugReport;
    if (initial) {
      await updateBug(initial.id, payload);
      result = { ...initial, ...payload };
    } else {
      result = await createBug(bugUserId, payload);
    }
    setSaving(false);
    onSaved(result);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader><DialogTitle>{initial ? 'Edit Bug' : 'Report Bug'}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs mb-1.5 block">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Login fails on iOS Safari" className="bg-background/50" />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Steps to reproduce, expected vs actual behaviour" className="bg-background/50 resize-none text-sm" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Severity</Label>
              <Select value={severity} onValueChange={v => setSeverity(v as BugSeverity)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as BugStatus)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="wontfix">Won't Fix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1">{saving ? 'Saving…' : initial ? 'Save' : 'Report Bug'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function FeaturesPage() {
  const [selectedProject, setSelectedProject] = useState(projectsData[0].id);
  const [features, setFeatures] = useState<Feature[]>(featuresData);
  const [bugs, setBugs] = useState<BugReport[]>(bugsData);
  const [featureModal, setFeatureModal] = useState(false);
  const [editFeature, setEditFeature] = useState<Feature | undefined>();
  const [bugModal, setBugModal] = useState(false);
  const [editBug, setEditBug] = useState<BugReport | undefined>();
  const [featureStatusFilter, setFeatureStatusFilter] = useState<FeatureStatus | '__all__'>('__all__');
  const [bugStatusFilter, setBugStatusFilter] = useState<BugStatus | '__all__'>('__all__');
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    getFeatures(selectedProject).then(data => setFeatures(prev => {
      const other = prev.filter(f => f.projectId !== selectedProject);
      return [...other, ...data];
    }));
    getBugs(selectedProject).then(data => setBugs(prev => {
      const other = prev.filter(b => b.projectId !== selectedProject);
      return [...other, ...data];
    }));
  }, [selectedProject]);

  const projectFeatures = features.filter(f => f.projectId === selectedProject);
  const projectBugs = bugs.filter(b => b.projectId === selectedProject);

  const filteredFeatures = featureStatusFilter === '__all__' ? projectFeatures : projectFeatures.filter(f => f.status === featureStatusFilter);
  const filteredBugs = bugStatusFilter === '__all__' ? projectBugs : projectBugs.filter(b => b.status === bugStatusFilter);

  function handleFeatureSaved(f: Feature) {
    setFeatures(prev => { const idx = prev.findIndex(x => x.id === f.id); return idx >= 0 ? prev.map(x => x.id === f.id ? f : x) : [f, ...prev]; });
  }
  function handleBugSaved(b: BugReport) {
    setBugs(prev => { const idx = prev.findIndex(x => x.id === b.id); return idx >= 0 ? prev.map(x => x.id === b.id ? b : x) : [b, ...prev]; });
  }
  async function handleDeleteFeature(id: string) { await deleteFeature(id); setFeatures(prev => prev.filter(f => f.id !== id)); }
  async function handleDeleteBug(id: string) { await deleteBug(id); setBugs(prev => prev.filter(b => b.id !== id)); }

  async function resolveBug(bug: BugReport) {
    const updated = { ...bug, status: 'resolved' as BugStatus, resolvedAt: new Date().toISOString().split('T')[0] };
    await updateBug(bug.id, updated);
    setBugs(prev => prev.map(b => b.id === bug.id ? updated : b));
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Layers className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Features & Bugs</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Track backlog, bugs, and delivery</p>
          </div>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-44 bg-background/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            {projectsData.filter(p => p.status !== 'archived').map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <Tabs defaultValue="features">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="features">Features ({projectFeatures.length})</TabsTrigger>
          <TabsTrigger value="bugs">
            Bugs ({projectBugs.filter(b => b.status === 'open' || b.status === 'in_progress').length} open)
          </TabsTrigger>
        </TabsList>

        {/* ─── Features Tab ─── */}
        <TabsContent value="features" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5 flex-wrap">
              {(['__all__', 'idea', 'planned', 'in_progress', 'done'] as const).map(f => (
                <button key={f} onClick={() => setFeatureStatusFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${featureStatusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>
                  {f === '__all__' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <Button onClick={() => { setEditFeature(undefined); setFeatureModal(true); }} className="gap-2">
              <Plus className="w-4 h-4" />Add Feature
            </Button>
          </div>

          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2.5">
            {filteredFeatures.sort((a, b) => b.votes - a.votes).map(f => (
              <motion.div key={f.id} variants={fadeUp}>
                <Card className="p-4 border-border/50 bg-card/60 backdrop-blur group">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
                      <button className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setFeatures(prev => prev.map(x => x.id === f.id ? { ...x, votes: x.votes + 1 } : x))}>
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-[10px] font-bold">{f.votes}</span>
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${FEATURE_STATUS_COLORS[f.status]}`}>{f.status.replace('_', ' ')}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${PRIORITY_COLORS[f.priority]}`}>{f.priority}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${EFFORT_COLORS[f.effort]}`}>{f.effort}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase text-${f.impact === 'high' ? 'emerald' : f.impact === 'medium' ? 'amber' : 'sky'}-400 bg-${f.impact === 'high' ? 'emerald' : f.impact === 'medium' ? 'amber' : 'sky'}-500/10`}>
                          {f.impact} impact
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mt-1.5">{f.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{f.description}</p>
                      {f.requestedBy && (
                        <p className="text-[10px] text-muted-foreground mt-1">Requested by: {f.requestedBy}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditFeature(f); setFeatureModal(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteFeature(f.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {filteredFeatures.length === 0 && (
              <Card className="p-8 text-center border-dashed border-border/40 bg-muted/5">
                <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No features here yet</p>
                <Button size="sm" className="mt-3 gap-2" onClick={() => setFeatureModal(true)}>
                  <Plus className="w-3.5 h-3.5" />Add Feature
                </Button>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        {/* ─── Bugs Tab ─── */}
        <TabsContent value="bugs" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5 flex-wrap">
              {(['__all__', 'open', 'in_progress', 'resolved', 'wontfix'] as const).map(f => (
                <button key={f} onClick={() => setBugStatusFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${bugStatusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>
                  {f === '__all__' ? 'All' : f === 'in_progress' ? 'In Progress' : f === 'wontfix' ? "Won't Fix" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <Button onClick={() => { setEditBug(undefined); setBugModal(true); }} variant="destructive" className="gap-2">
              <Plus className="w-4 h-4" />Report Bug
            </Button>
          </div>

          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2.5">
            {filteredBugs.sort((a, b) => {
              const ord: BugSeverity[] = ['critical', 'high', 'medium', 'low'];
              return ord.indexOf(a.severity) - ord.indexOf(b.severity);
            }).map(bug => {
              const StatusIcon = BUG_STATUS_ICONS[bug.status];
              const isActive = bug.status === 'open' || bug.status === 'in_progress';
              return (
                <motion.div key={bug.id} variants={fadeUp}>
                  <Card className={`p-4 border-border/50 bg-card/60 backdrop-blur group ${!isActive ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${SEVERITY_COLORS[bug.severity]}`}>
                        <Bug className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${SEVERITY_COLORS[bug.severity]}`}>{bug.severity}</span>
                          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />{bug.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className={`font-semibold text-sm mt-1.5 ${!isActive ? 'line-through' : ''}`}>{bug.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{bug.description}</p>
                        <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span>Reported {new Date(bug.reportedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          {bug.resolvedAt && <span className="text-emerald-400">Resolved {new Date(bug.resolvedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {isActive && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-400 hover:text-emerald-300" onClick={() => resolveBug(bug)}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Resolve
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditBug(bug); setBugModal(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteBug(bug.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
            {filteredBugs.length === 0 && (
              <Card className="p-8 text-center border-dashed border-border/40 bg-muted/5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm text-muted-foreground">No bugs here — nice!</p>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      <FeatureModal open={featureModal} onClose={() => setFeatureModal(false)} onSaved={handleFeatureSaved} projectId={selectedProject} initial={editFeature} />
      <BugModal open={bugModal} onClose={() => setBugModal(false)} onSaved={handleBugSaved} projectId={selectedProject} initial={editBug} />
    </div>
  );
}
