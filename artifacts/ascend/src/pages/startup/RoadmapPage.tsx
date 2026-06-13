import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Plus, Pencil, Trash2, Flag, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  projectsData, roadmapData,
  RoadmapItem, RoadmapPhase, RoadmapStatus, Priority,
  PHASE_LABELS, PRIORITY_COLORS, STATUS_COLORS,
} from "@/lib/startup-data";
import { createRoadmapItem, updateRoadmapItem, deleteRoadmapItem, getRoadmapItems } from "@/lib/startup-supabase";
import { useAuth } from "@/providers/AuthProvider";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const STATUS_ICONS: Record<RoadmapStatus, any> = {
  backlog: Circle,
  in_progress: Clock,
  done: CheckCircle2,
  cancelled: XCircle,
};
const STATUS_NEXT: Record<RoadmapStatus, RoadmapStatus> = {
  backlog: 'in_progress',
  in_progress: 'done',
  done: 'backlog',
  cancelled: 'backlog',
};
const PHASE_ORDER: RoadmapPhase[] = ['q1', 'q2', 'q3', 'q4'];
const PHASE_COLORS: Record<RoadmapPhase, string> = {
  q1: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  q2: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  q3: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  q4: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

// ─── Item Modal ───────────────────────────────────────────────────────────────
function ItemModal({ open, onClose, onSaved, projectId, defaultPhase, initial }: {
  open: boolean; onClose: () => void; onSaved: (item: RoadmapItem) => void;
  projectId: string; defaultPhase: RoadmapPhase; initial?: RoadmapItem;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [phase, setPhase] = useState<RoadmapPhase>(initial?.phase ?? defaultPhase);
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [saving, setSaving] = useState(false);
  const { user: rmUser } = useAuth();
  const rmUserId = rmUser?.id ?? 'mock-user-1';

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const payload: Omit<RoadmapItem, 'id'> = {
      projectId, title: title.trim(), description: description.trim(),
      phase, status: initial?.status ?? 'backlog', priority,
      dueDate: dueDate || undefined, tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    let result: RoadmapItem;
    if (initial) {
      await updateRoadmapItem(initial.id, payload);
      result = { ...initial, ...payload };
    } else {
      result = await createRoadmapItem(rmUserId, payload);
    }
    setSaving(false);
    onSaved(result);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader><DialogTitle>{initial ? 'Edit Item' : 'Add Roadmap Item'}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs mb-1.5 block">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mobile app launch" className="bg-background/50" />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What needs to happen?" className="bg-background/50 resize-none text-sm" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Phase</Label>
              <Select value={phase} onValueChange={v => setPhase(v as RoadmapPhase)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PHASE_ORDER.map(p => <SelectItem key={p} value={p}>{PHASE_LABELS[p]}</SelectItem>)}
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Due Date (optional)</Label>
              <Input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="bg-background/50" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Tags</Label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="core, mobile" className="bg-background/50" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1">{saving ? 'Saving…' : initial ? 'Save' : 'Add Item'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function RoadmapPage() {
  const [selectedProject, setSelectedProject] = useState(projectsData[0].id);
  const [items, setItems] = useState<RoadmapItem[]>(roadmapData);
  const [addModal, setAddModal] = useState<{ phase: RoadmapPhase } | null>(null);
  const [editItem, setEditItem] = useState<RoadmapItem | undefined>();
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    getRoadmapItems(selectedProject).then(data => setItems(prev => {
      const other = prev.filter(i => i.projectId !== selectedProject);
      return [...other, ...data];
    }));
  }, [selectedProject]);

  const projectItems = items.filter(i => i.projectId === selectedProject);

  function handleItemSaved(item: RoadmapItem) {
    setItems(prev => {
      const idx = prev.findIndex(x => x.id === item.id);
      return idx >= 0 ? prev.map(x => x.id === item.id ? item : x) : [item, ...prev];
    });
  }

  async function cycleStatus(item: RoadmapItem) {
    const next = STATUS_NEXT[item.status];
    await updateRoadmapItem(item.id, { status: next });
    setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: next } : x));
  }

  async function handleDelete(id: string) {
    await deleteRoadmapItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Map className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Roadmap</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Track milestones across all phases</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-44 bg-background/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {projectsData.filter(p => p.status !== 'archived').map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Phase Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PHASE_ORDER.map(phase => {
          const phaseItems = projectItems.filter(i => i.phase === phase);
          const doneCount = phaseItems.filter(i => i.status === 'done').length;
          const phaseColor = PHASE_COLORS[phase];
          return (
            <div key={phase} className="flex flex-col gap-3">
              {/* Column Header */}
              <div className={`rounded-xl p-3 border flex items-center justify-between ${phaseColor}`}>
                <div>
                  <p className="font-bold text-sm">{PHASE_LABELS[phase]}</p>
                  <p className="text-xs opacity-70 mt-0.5">{doneCount}/{phaseItems.length} done</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-80 hover:opacity-100"
                  onClick={() => setAddModal({ phase })}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress bar */}
              {phaseItems.length > 0 && (
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(doneCount / phaseItems.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              )}

              {/* Items */}
              <AnimatePresence>
                {phaseItems.sort((a, b) => {
                  const order: Priority[] = ['critical', 'high', 'medium', 'low'];
                  return order.indexOf(a.priority) - order.indexOf(b.priority);
                }).map(item => {
                  const StatusIcon = STATUS_ICONS[item.status];
                  const statusColor = STATUS_COLORS[item.status];
                  const priorityColor = PRIORITY_COLORS[item.priority];
                  return (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}>
                      <Card className="p-3.5 border-border/50 bg-card/70 backdrop-blur hover:border-border transition-all group">
                        <div className="flex items-start gap-2.5">
                          <button onClick={() => cycleStatus(item)} className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                            <StatusIcon className={`w-4 h-4 ${statusColor.split(' ')[0]}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-snug ${item.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${priorityColor}`}>{item.priority}</span>
                              {item.dueDate && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Flag className="w-2.5 h-2.5" />
                                  {new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                              {item.tags.slice(0, 2).map(t => (
                                <span key={t} className="text-[10px] px-1 py-0.5 rounded bg-muted/30 text-muted-foreground">{t}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button className="p-1 rounded hover:bg-muted/30" onClick={() => setEditItem(item)}>
                              <Pencil className="w-3 h-3 text-muted-foreground" />
                            </button>
                            <button className="p-1 rounded hover:bg-red-500/10" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {phaseItems.length === 0 && (
                <Card className="p-4 border-dashed border-border/40 bg-muted/5 text-center">
                  <p className="text-xs text-muted-foreground">No items yet</p>
                  <button className="text-xs text-primary hover:underline mt-1" onClick={() => setAddModal({ phase })}>+ Add item</button>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {addModal && (
        <ItemModal
          open={!!addModal} onClose={() => setAddModal(null)} onSaved={handleItemSaved}
          projectId={selectedProject} defaultPhase={addModal.phase}
        />
      )}
      {editItem && (
        <ItemModal
          open={!!editItem} onClose={() => setEditItem(undefined)} onSaved={handleItemSaved}
          projectId={selectedProject} defaultPhase={editItem.phase} initial={editItem}
        />
      )}
    </div>
  );
}
