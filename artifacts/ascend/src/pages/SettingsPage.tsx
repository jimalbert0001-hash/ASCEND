import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUiStore } from "@/stores/ui.store";
import { useAuth } from "@/providers/AuthProvider";
import { useAIStore, type CoachRole } from "@/stores/ai.store";
import { useTimerStore } from "@/stores/timer.store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GraduationCap, Rocket, Crown, Music, Trophy, RotateCcw, BarChart3, Swords, CheckCircle2, Target, Trash2, AlertTriangle, Loader2, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchChessAccounts, saveChessAccounts } from "@/lib/chess-api";
import { useStatsStore } from "@/stores/stats.store";
import { useStreakStore } from "@/stores/streak.store";
import { useGoalsStore, SUBCATEGORIES, UNITS, GoalCategory } from "@/stores/goals.store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setDataCleared } from "@/lib/data-cleared";
import { fetchGoals, saveGoals } from "@/lib/goals-api";
import { apiFetch } from "@/lib/api-fetch";
import { EditableField } from "@/components/ui/EditableField";

const getDomainColor = (domain: string) => {
  switch (domain) {
    case 'academics': return 'bg-chart-1';
    case 'startup': return 'bg-chart-2';
    case 'chess': return 'bg-chart-3';
    case 'guitar': return 'bg-chart-4';
    default: return 'bg-primary';
  }
};

const COACH_META: Record<CoachRole, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; placeholder: string }> = {
  achievement: {
    label: "Achievement Coach",
    icon: Trophy,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    placeholder: "e.g., 'Be extremely direct and give me the hard truth about where I\'m slacking.'",
  },
  academic: {
    label: "Academic Coach",
    icon: GraduationCap,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    placeholder: "e.g., 'Focus on board exam strategy and time management over general study tips.'",
  },
  startup: {
    label: "Startup Coach",
    icon: Rocket,
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/30",
    placeholder: "e.g., 'Push me on metrics and customer feedback. Be brutally honest about weak ideas.'",
  },
  chess: {
    label: "Chess Coach",
    icon: Crown,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/30",
    placeholder: "e.g., 'Emphasize tactics and endgames over openings. Be specific about training plans.'",
  },
  guitar: {
    label: "Guitar Coach",
    icon: Music,
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/30",
    placeholder: "e.g., 'Keep practice sessions under 30 minutes. Focus on clean technique over speed.'",
  },
};

const ROLES: CoachRole[] = ['achievement', 'academic', 'startup', 'chess', 'guitar'];

export function SettingsPage() {
  const [, navigate] = useLocation();
  const { theme, setTheme } = useUiStore();
  const { signOut, user } = useAuth();
  const {
    personalityOverrides,
    setPersonalityOverride,
    resetPersonalityOverrides,
    tokenUsage,
    resetTokenUsage,
    resetAll: resetAIStore,
  } = useAIStore();

  const { resetAll: resetStatsStore } = useStatsStore();
  const { reset: resetStreakStore } = useStreakStore();
  const { resetTimer } = useTimerStore();

  const [activeRole, setActiveRole] = useState<CoachRole>('achievement');
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Chess account settings
  const [chesscomUsername, setChesscomUsername] = useState('princeplaysch');
  const [lichessUsername, setLichessUsername] = useState('princeplaysch');
  const [chessSaving, setChessSaving] = useState(false);
  const [chessSaved, setChessSaved] = useState(false);

  // Goals management
  const { goals, updateGoal, loadGoalsFromServer } = useStatsStore();
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsSaved, setGoalsSaved] = useState(false);

  // New local goals form
  const { goals: localGoals, addGoal, deleteGoal } = useGoalsStore();
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('academics');
  const [goalSubcategory, setGoalSubcategory] = useState('Overall');
  const [goalValue, setGoalValue] = useState('');
  const [goalTimeframe, setGoalTimeframe] = useState('1m');
  const [goalCustomDate, setGoalCustomDate] = useState('');
  const [goalDescription, setGoalDescription] = useState('');

  function getDeadline(): string {
    const now = new Date();
    const add = (days: number) => new Date(now.getTime() + days * 86400000).toISOString().split('T')[0];
    switch (goalTimeframe) {
      case '1w': return add(7);
      case '2w': return add(14);
      case '1m': return add(30);
      case '3m': return add(90);
      case '6m': return add(180);
      case 'custom': return goalCustomDate || add(30);
      default: return add(30);
    }
  }

  function handleAddGoal() {
    if (!goalValue || isNaN(Number(goalValue))) return;
    addGoal({
      category: goalCategory,
      subcategory: goalSubcategory,
      targetValue: Number(goalValue),
      unit: UNITS[goalSubcategory] ?? '%',
      deadline: getDeadline(),
      description: goalDescription,
    });
    setGoalValue('');
    setGoalDescription('');
  }

  useEffect(() => {
    if (!user?.id) return;
    fetchChessAccounts(user.id).then(acc => {
      setChesscomUsername(acc.chesscomUsername || 'princeplaysch');
      setLichessUsername(acc.lichessUsername || 'princeplaysch');
    }).catch(() => {
      // defaults already set
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setGoalsLoading(true);
    fetchGoals(user.id).then((serverGoals) => {
      const mapped = serverGoals.map((g) => ({
        id: g.id,
        title: g.title,
        domain: g.domain,
        progress: g.progress,
        targetValue: g.targetValue ?? undefined,
        description: g.description ?? undefined,
        status: g.status ?? 'in_progress',
      }));
      loadGoalsFromServer(mapped);
    }).catch(() => {
      // use persisted defaults
    }).finally(() => {
      setGoalsLoading(false);
    });
  }, [user?.id]);

  async function handleResetAll() {
    setResetting(true);

    // 1. Reset all Zustand stores in memory
    resetStatsStore();
    resetStreakStore();
    resetAIStore();
    resetTimer();

    // 2. Remove persisted localStorage keys so stale data cannot survive
    const PERSIST_KEYS = [
      'ascend-stats-storage',
      'ascend-streak-storage',
      'ascend-ai-storage',
      'ascend-timer-storage',
    ];
    PERSIST_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch {} });

    // 3. Set the data-cleared flag so mock-mode Supabase fallbacks return []
    setDataCleared();

    // 4. Best-effort: wipe goals and all Supabase rows on the backend
    if (user?.id) {
      try { await saveGoals(user.id, []); } catch {}
      try {
        await apiFetch('/api/data/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      } catch {}
    }

    // 5. Navigate to dashboard
    setResetting(false);
    setResetConfirm(false);
    navigate('/');
  }

  async function handleSaveChessAccounts() {
    if (!user?.id) return;
    setChessSaving(true);
    try {
      await saveChessAccounts(user.id, {
        chesscomUsername: chesscomUsername || 'princeplaysch',
        lichessUsername: lichessUsername || 'princeplaysch',
      });
      setChessSaved(true);
      setTimeout(() => setChessSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save chess accounts', e);
    } finally {
      setChessSaving(false);
    }
  }

  async function handleSaveGoals() {
    if (!user?.id) return;
    setGoalsLoading(true);
    try {
      const payload = goals.map((g) => ({
        id: g.id,
        domain: g.domain,
        title: g.title,
        description: g.description,
        progress: g.progress,
        targetValue: g.targetValue,
        status: g.status ?? 'in_progress',
      }));
      await saveGoals(user.id, payload);
      setGoalsSaved(true);
      setTimeout(() => setGoalsSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save goals', e);
    } finally {
      setGoalsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">System configuration.</p>
      </header>

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Appearance</h3>
          <div className="grid grid-cols-3 gap-4">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                onClick={() => setTheme(t)}
                className="capitalize"
                data-testid={`button-theme-${t}`}
              >
                {t}
              </Button>
            ))}
          </div>
        </Card>

        {/* AI Mentor Personality */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">AI Mentor Personality</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize how each coach responds. Leave empty to use the default personality.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPersonalityOverrides}
              className="text-xs h-8"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset all
            </Button>
          </div>

          {/* Role tabs */}
          <div className="flex gap-1.5 flex-wrap mb-4">
            {ROLES.map((role) => {
              const meta = COACH_META[role];
              const Icon = meta.icon;
              const active = activeRole === role;
              const hasOverride = !!personalityOverrides[role];
              return (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    active
                      ? `${meta.bg} ${meta.color} border-current`
                      : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground',
                    hasOverride && !active && 'ring-1 ring-primary/20'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                  {hasOverride && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Personality textarea for active role */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">
                {COACH_META[activeRole].label} Personality
              </Label>
              {personalityOverrides[activeRole] && (
                <span className="text-xs text-muted-foreground">
                  {personalityOverrides[activeRole].length} chars
                </span>
              )}
            </div>
            <Textarea
              value={personalityOverrides[activeRole]}
              onChange={(e) => setPersonalityOverride(activeRole, e.target.value)}
              placeholder={COACH_META[activeRole].placeholder}
              className="min-h-[120px] text-sm resize-y"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Describe how you want this coach to behave. Be specific about tone, style, and what to prioritize.
            </p>
          </div>
        </Card>

        {/* AI Usage Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-bold">AI Usage</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetTokenUsage}
              className="text-xs h-8"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{tokenUsage.total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total tokens</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">
                {tokenUsage.lastUsage?.totalTokens.toLocaleString() ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Last request</p>
            </div>
          </div>

          <div className="space-y-2">
            {ROLES.map((role) => {
              const meta = COACH_META[role];
              const Icon = meta.icon;
              const count = tokenUsage.byRole[role] ?? 0;
              const pct = tokenUsage.total > 0 ? Math.round((count / tokenUsage.total) * 100) : 0;
              return (
                <div key={role} className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4", meta.color)} />
                  <span className="text-sm w-28">{meta.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    {count.toLocaleString()} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Chess Accounts */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="w-4 h-4 text-amber-400" />
            <h3 className="text-lg font-bold">Chess Accounts</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Connect your Chess.com and Lichess accounts to auto-import games and stats.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-xs mb-1.5 block">Chess.com Username</Label>
              <Input
                value={chesscomUsername}
                onChange={(e) => setChesscomUsername(e.target.value)}
                placeholder="princeplaysch"
                className="bg-background/50"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Lichess Username</Label>
              <Input
                value={lichessUsername}
                onChange={(e) => setLichessUsername(e.target.value)}
                placeholder="princeplaysch"
                className="bg-background/50"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveChessAccounts}
            disabled={chessSaving}
            className="gap-2"
            size="sm"
          >
            {chessSaved ? <CheckCircle2 className="w-4 h-4" /> : chessSaving ? 'Saving...' : 'Save Accounts'}
          </Button>
        </Card>

        {/* Goals */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-bold">Goals</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Set targets across your domains. Goals appear on each section's overview and the dashboard.
          </p>

          {/* Add Goal Form */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/40 mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Goal</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">Category</Label>
                <Select
                  value={goalCategory}
                  onValueChange={(v) => {
                    setGoalCategory(v as GoalCategory);
                    setGoalSubcategory(SUBCATEGORIES[v as GoalCategory][0]);
                  }}
                >
                  <SelectTrigger className="bg-background/50 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academics">Academics</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="chess">Chess</SelectItem>
                    <SelectItem value="guitar">Guitar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Subcategory</Label>
                <Select value={goalSubcategory} onValueChange={setGoalSubcategory}>
                  <SelectTrigger className="bg-background/50 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUBCATEGORIES[goalCategory].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">
                  Target Value
                  <span className="ml-1 text-muted-foreground font-normal">({UNITS[goalSubcategory] ?? '%'})</span>
                </Label>
                <Input
                  type="number"
                  value={goalValue}
                  onChange={e => setGoalValue(e.target.value)}
                  placeholder="e.g. 1500"
                  className="bg-background/50 h-9"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Timeframe</Label>
                <div className="flex flex-wrap gap-1">
                  {(['1w', '2w', '1m', '3m', '6m'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setGoalTimeframe(t)}
                      className={cn(
                        'px-2 py-1 rounded text-xs border transition-all',
                        goalTimeframe === t
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      )}
                    >{t}</button>
                  ))}
                  <button
                    onClick={() => setGoalTimeframe('custom')}
                    className={cn(
                      'px-2 py-1 rounded text-xs border transition-all flex items-center gap-1',
                      goalTimeframe === 'custom'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <Calendar className="w-3 h-3" />date
                  </button>
                </div>
                {goalTimeframe === 'custom' && (
                  <Input
                    type="date"
                    value={goalCustomDate}
                    onChange={e => setGoalCustomDate(e.target.value)}
                    className="bg-background/50 h-9 mt-2"
                  />
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                value={goalDescription}
                onChange={e => setGoalDescription(e.target.value)}
                placeholder="e.g. Reach 1500 blitz on Lichess by end of term"
                className="bg-background/50 h-9"
              />
            </div>

            <Button
              onClick={handleAddGoal}
              disabled={!goalValue || isNaN(Number(goalValue))}
              size="sm"
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />Add Goal
            </Button>
          </div>

          {/* Active goals list */}
          {localGoals.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Goals</p>
              {localGoals.map(goal => (
                <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={cn(
                        'text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border',
                        goal.category === 'academics' ? 'text-blue-400 border-blue-500/30 bg-blue-500/5' :
                        goal.category === 'chess'     ? 'text-purple-400 border-purple-500/30 bg-purple-500/5' :
                        goal.category === 'guitar'    ? 'text-green-400 border-green-500/30 bg-green-500/5' :
                        'text-orange-400 border-orange-500/30 bg-orange-500/5'
                      )}>
                        {goal.category}
                      </span>
                      <span className="text-sm font-semibold">{goal.subcategory}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {goal.targetValue.toLocaleString()} {goal.unit} · due {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{goal.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No goals yet. Add one above.</p>
          )}
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-daily" className="flex-1 cursor-pointer">Daily Briefing</Label>
              <Switch id="notif-daily" defaultChecked data-testid="switch-notif-daily" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-streak" className="flex-1 cursor-pointer">Streak Reminders</Label>
              <Switch id="notif-streak" defaultChecked data-testid="switch-notif-streak" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-mentor" className="flex-1 cursor-pointer">AI Mentor Insights</Label>
              <Switch id="notif-mentor" defaultChecked data-testid="switch-notif-mentor" />
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/20">
          <h3 className="text-lg font-bold text-destructive mb-4">Danger Zone</h3>
          <div className="space-y-6">

            {/* Reset All Data */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold">Reset All App Data</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Wipes all stats, streaks, goals, tasks, AI conversations, and coach settings. Cannot be undone.
                </p>
              </div>

              {resetConfirm ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive flex-1">This will erase everything permanently.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={resetting} onClick={() => setResetConfirm(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 px-3 text-xs gap-1.5" disabled={resetting} onClick={handleResetAll}>
                      {resetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {resetting ? 'Resetting…' : 'Yes, reset everything'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
                  onClick={() => setResetConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Reset All Data
                </Button>
              )}
            </div>

            <div className="border-t border-border/50" />

            <Button variant="destructive" className="w-full sm:w-auto" onClick={signOut} data-testid="button-signout">
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
