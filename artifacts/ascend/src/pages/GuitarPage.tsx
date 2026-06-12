import { Music, Play, ListMusic, Mic2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { sampleData } from "@/lib/sample-data";

export function GuitarPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-primary/10 rounded-xl">
          <Music className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Guitar</h2>
          <p className="text-muted-foreground mt-1">Repertoire, technique, and practice.</p>
        </div>
      </header>

      <Card className="p-8 border-primary/20 bg-primary/5 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight mb-2">Coming in Phase 2</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The Guitar module is currently offline. Phase 2 initialization will deploy repertoire management and practice routines.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
            <ListMusic className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-semibold mb-1">Repertoire</h4>
            <p className="text-xs text-muted-foreground text-center">Song mastery tracking</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
            <Play className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-semibold mb-1">Practice Routine</h4>
            <p className="text-xs text-muted-foreground text-center">Metronome & scale exercises</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
            <Mic2 className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-semibold mb-1">Recordings</h4>
            <p className="text-xs text-muted-foreground text-center">Progress logging audio</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
