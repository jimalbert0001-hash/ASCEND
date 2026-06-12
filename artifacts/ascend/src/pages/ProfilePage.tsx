import { useAuth } from "@/providers/AuthProvider";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { sampleData } from "@/lib/sample-data";

export function ProfilePage() {
  const { user } = useAuth();
  
  // Use mock data if not fully loaded from real auth
  const displayName = user?.user_metadata?.name || sampleData.user.name;
  const displayEmail = user?.email || sampleData.user.email;
  const initials = displayName.split(' ').map((n:string) => n[0]).join('').substring(0, 2).toUpperCase() || sampleData.user.initials;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Operator Profile</h2>
        <p className="text-muted-foreground mt-1">Identity and global metrics.</p>
      </header>

      <Card className="p-8 border-border">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <Avatar className="w-32 h-32 ring-4 ring-primary/20 shadow-xl">
            <AvatarFallback className="bg-primary/10 text-primary font-black text-4xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">{displayName}</h3>
              <p className="text-muted-foreground">{displayEmail}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {sampleData.user.activeDomains.map(domain => (
                <span key={domain} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-md">
                  {domain}
                </span>
              ))}
            </div>
            
            <div className="pt-4 flex gap-4 justify-center md:justify-start">
              <Button variant="outline" data-testid="button-edit-profile">Edit Profile</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Study Hours</p>
          <p className="text-3xl font-bold">{sampleData.user.stats.studyHours}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Chess Rating</p>
          <p className="text-3xl font-bold tabular-nums">{sampleData.user.stats.chessRating}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Habit Streak</p>
          <p className="text-3xl font-bold tabular-nums">{sampleData.user.stats.habitStreak}</p>
        </Card>
      </div>
      
      <div className="text-center text-sm text-muted-foreground mt-12">
        Operator since {sampleData.user.joinedDate}
      </div>
    </div>
  );
}
