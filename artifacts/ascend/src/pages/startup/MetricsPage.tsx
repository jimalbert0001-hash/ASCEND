import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart as LineChartIcon, Users, DollarSign, TrendingUp, Target, RefreshCw, ArrowUpRight, CheckCircle2, Clock, Circle, XCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  projectsData, revenueData, userMetricsData, milestonesData,
  LaunchMilestone, MilestoneCat, MilestoneStatus,
  getProjectStats, MILESTONE_CAT_COLORS,
} from "@/lib/startup-data";
import { createMilestone, updateMilestone, getMilestones } from "@/lib/startup-supabase";
import { useAuth } from "@/providers/AuthProvider";
import { isDataCleared } from "@/lib/data-cleared";

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const MONTH_SHORT: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

const MILESTONE_STATUS_ICONS: Record<MilestoneStatus, any> = {
  pending: Circle, in_progress: Clock, done: CheckCircle2, skipped: XCircle,
};
const MILESTONE_STATUS_COLORS: Record<MilestoneStatus, string> = {
  pending: 'text-muted-foreground',
  in_progress: 'text-amber-400',
  done: 'text-emerald-400',
  skipped: 'text-muted-foreground/50',
};

function MetricCard({ icon: Icon, label, value, change, sub, colorClass }: {
  icon: any; label: string; value: string; change?: string; sub?: string; colorClass: string;
}) {
  const [textCol, bgCol] = colorClass.split(' ');
  return (
    <motion.div variants={fadeUp}>
      <Card className="p-5 border-border/50 bg-card/60 backdrop-blur">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${bgCol} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${textCol}`} />
          </div>
          {change && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              <ArrowUpRight className="w-3 h-3" />{change}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </Card>
    </motion.div>
  );
}

// ─── Milestone Modal ──────────────────────────────────────────────────────────
function MilestoneModal({ open, onClose, onSaved, projectId, initial }: {
  open: boolean; onClose: () => void; onSaved: (m: LaunchMilestone) => void; projectId: string; initial?: LaunchMilestone;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState<MilestoneCat>(initial?.category ?? 'product');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [status, setStatus] = useState<MilestoneStatus>(initial?.status ?? 'pending');
  const [saving, setSaving] = useState(false);
  const { user: msUser } = useAuth();
  const msUserId = msUser?.id ?? 'mock-user-1';

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const payload = { projectId, title: title.trim(), description: description.trim(), category, dueDate, status };
    let result: LaunchMilestone;
    if (initial) {
      await updateMilestone(initial.id, payload);
      result = { ...initial, ...payload };
    } else {
      result = await createMilestone(msUserId, payload);
    }
    setSaving(false);
    onSaved(result);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader><DialogTitle>{initial ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs mb-1.5 block">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Product Hunt launch" className="bg-background/50" />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this milestone entail?" className="bg-background/50 resize-none text-sm" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Category</Label>
              <Select value={category} onValueChange={v => setCategory(v as MilestoneCat)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as MilestoneStatus)}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Due Date</Label>
            <Input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="bg-background/50" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1">{saving ? 'Saving…' : initial ? 'Save' : 'Add Milestone'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const CustomTooltipRevenue = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltipUsers = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export function MetricsPage() {
  const [selectedProject, setSelectedProject] = useState(projectsData[0].id);
  const [milestones, setMilestones] = useState<LaunchMilestone[]>(() => isDataCleared() ? [] : milestonesData);
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [editMilestone, setEditMilestone] = useState<LaunchMilestone | undefined>();
  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  useEffect(() => {
    getMilestones(selectedProject).then(data => setMilestones(prev => {
      const other = prev.filter(m => m.projectId !== selectedProject);
      return [...other, ...data];
    }));
  }, [selectedProject]);

  const stats = getProjectStats(selectedProject);
  const rev = isDataCleared() ? [] : revenueData.filter(r => r.projectId === selectedProject);
  const users = isDataCleared() ? [] : userMetricsData.filter(u => u.projectId === selectedProject);
  const projectMilestones = milestones.filter(m => m.projectId === selectedProject);
  const doneCount = projectMilestones.filter(m => m.status === 'done').length;
  const milestonePct = projectMilestones.length > 0 ? Math.round((doneCount / projectMilestones.length) * 100) : 0;

  const revenueChartData = rev.map(r => ({
    month: MONTH_SHORT[r.month.split('-')[1]],
    MRR: r.mrr, 'New Revenue': r.newRevenue, Churn: r.churn,
  }));

  const usersChartData = users.map(u => ({
    month: MONTH_SHORT[u.month.split('-')[1]],
    'Total Users': u.totalUsers, 'Active Users': u.activeUsers, 'New Users': u.newUsers,
  }));

  function handleMilestoneSaved(m: LaunchMilestone) {
    setMilestones(prev => { const idx = prev.findIndex(x => x.id === m.id); return idx >= 0 ? prev.map(x => x.id === m.id ? m : x) : [m, ...prev]; });
  }

  async function toggleMilestone(m: LaunchMilestone) {
    const next = m.status === 'done' ? 'pending' : 'done';
    await updateMilestone(m.id, { status: next });
    setMilestones(prev => prev.map(x => x.id === m.id ? { ...x, status: next as MilestoneStatus } : x));
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <LineChartIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Metrics</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Revenue, users, and growth tracking</p>
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

      {/* ─── Key Metrics ─── */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString()} change={`+${stats.userGrowth}%`} sub="MoM growth" colorClass="text-sky-400 bg-sky-500/10" />
        <MetricCard icon={RefreshCw} label="Active Users" value={stats.activeUsers.toLocaleString()} sub="This month" colorClass="text-blue-400 bg-blue-500/10" />
        <MetricCard icon={DollarSign} label="MRR" value={`$${stats.mrr.toLocaleString()}`} change={`+${stats.mrrGrowth}%`} sub="Monthly recurring" colorClass="text-emerald-400 bg-emerald-500/10" />
        <MetricCard icon={TrendingUp} label="Growth Rate" value={`${stats.userGrowth}%`} sub="Users MoM" colorClass="text-violet-400 bg-violet-500/10" />
        <MetricCard icon={Target} label="Retention" value={`${stats.retention}%`} sub="Monthly retention" colorClass="text-amber-400 bg-amber-500/10" />
        <MetricCard icon={ArrowUpRight} label="Conversion" value={`${stats.conversion}%`} sub="Users → Paid" colorClass="text-pink-400 bg-pink-500/10" />
      </motion.div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth Chart */}
        <motion.div variants={fadeUp} initial="initial" animate="animate">
          <Card className="p-5 border-border/50 bg-card/60 backdrop-blur">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />User Growth
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={usersChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltipUsers />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <Area type="monotone" dataKey="Total Users" stroke="#38bdf8" fill="url(#totalGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Active Users" stroke="#818cf8" fill="url(#activeGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div variants={fadeUp} initial="initial" animate="animate">
          <Card className="p-5 border-border/50 bg-card/60 backdrop-blur">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />Revenue
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltipRevenue />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <Bar dataKey="MRR" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="New Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Churn" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* ─── New Users vs Churn ─── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <Card className="p-5 border-border/50 bg-card/60 backdrop-blur">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />New Users vs Churned
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={usersChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltipUsers />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              <Line type="monotone" dataKey="New Users" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* ─── Launch Milestones ─── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Launch Milestones</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{doneCount}/{projectMilestones.length} complete</p>
          </div>
          <Button onClick={() => { setEditMilestone(undefined); setMilestoneModal(true); }} className="gap-2" size="sm">
            <Plus className="w-3.5 h-3.5" />Add Milestone
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden mb-5">
          <motion.div className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }} animate={{ width: `${milestonePct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
        </div>

        <div className="space-y-2.5">
          {projectMilestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(m => {
            const StatusIcon = MILESTONE_STATUS_ICONS[m.status];
            const catColor = MILESTONE_CAT_COLORS[m.category];
            const isDone = m.status === 'done';
            return (
              <Card key={m.id} className={`p-4 border-border/50 bg-card/60 backdrop-blur group transition-opacity ${isDone ? 'opacity-70' : ''}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleMilestone(m)} className="shrink-0 hover:scale-110 transition-transform">
                    <StatusIcon className={`w-5 h-5 ${MILESTONE_STATUS_COLORS[m.status]}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${catColor}`}>{m.category}</span>
                      <h4 className={`font-semibold text-sm ${isDone ? 'line-through text-muted-foreground' : ''}`}>{m.title}</h4>
                    </div>
                    {m.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{m.description}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Due {new Date(m.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => { setEditMilestone(m); setMilestoneModal(true); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <MilestoneModal open={milestoneModal} onClose={() => setMilestoneModal(false)} onSaved={handleMilestoneSaved} projectId={selectedProject} initial={editMilestone} />
    </div>
  );
}
