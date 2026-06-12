import { useUiStore } from "@/stores/ui.store";
import { useAuth } from "@/providers/AuthProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SettingsPage() {
  const { theme, setTheme } = useUiStore();
  const { signOut } = useAuth();

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">System configuration.</p>
      </header>

      <div className="space-y-6">
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
