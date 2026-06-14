import { Crown, Swords, Puzzle, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { sampleData } from "@/lib/sample-data";

export function ChessPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-primary/10 rounded-xl">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chess</h2>
          <p className="text-muted-foreground mt-1">Tactics, strategy, and rating.</p>
        </div>
      </header>

      <Card className="p-8 border-primary/20 bg-primary/5 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
          <Crown className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight mb-2">Coming in Phase 2</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The Chess module is currently offline. Phase 2 initialization will deploy rating analytics and puzzle tracking.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
            <Trophy className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-semibold mb-1">Rating Tracker</h4>
            <p className="text-xs text-muted-foreground text-center">Elo progression charts</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
            <Swords className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-semibold mb-1">Game Analysis</h4>
            <p className="text-xs text-muted-foreground text-center">Opening repertoire stats</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
            <Puzzle className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-semibold mb-1">Tactics Log</h4>
            <p className="text-xs text-muted-foreground text-center">Puzzle rush performance</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Rating</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">{sampleData.user.stats.chessRating}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
        </Card>
      </div>
    </div>
  );
}
