import { useState, useEffect } from "react";
import { useUiStore } from "@/stores/ui.store";
import { useAuth } from "@/providers/AuthProvider";
import { useAIStore, type CoachRole } from "@/stores/ai.store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GraduationCap, Rocket, Crown, Music, Trophy, RotateCcw, BarChart3, Swords, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchChessAccounts, saveChessAccounts } from "@/lib/chess-api";

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
  const { theme, setTheme } = useUiStore();
  const { signOut, user } = useAuth();
  const {
    personalityOverrides,
    setPersonalityOverride,
    resetPersonalityOverrides,
    tokenUsage,
    resetTokenUsage,
  } = useAIStore();

  const [activeRole, setActiveRole] = useState<CoachRole>('achievement');

  // Chess account settings
  const [chesscomUsername, setChesscomUsername] = useState('princeplaysch');
  const [lichessUsername, setLichessUsername] = useState('princeplaysch');
  const [chessSaving, setChessSaving] = useState(false);
  const [chessSaved, setChessSaved] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchChessAccounts(user.id).then(acc => {
      setChesscomUsername(acc.chesscomUsername || 'princeplaysch');
      setLichessUsername(acc.lichessUsername || 'princeplaysch');
    }).catch(() => {
      // defaults already set
    });
  }, [user?.id]);

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
          <div className="space-y-4">
            <Button variant="destructive" className="w-full sm:w-auto" onClick={signOut} data-testid="button-signout">
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
