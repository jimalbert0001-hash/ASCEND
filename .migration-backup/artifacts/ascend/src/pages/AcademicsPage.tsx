import { BookOpen, Calendar, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { sampleData } from "@/lib/sample-data";

export function AcademicsPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-primary/10 rounded-xl">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Academics</h2>
          <p className="text-muted-foreground mt-1">Knowledge acquisition and mastery.</p>
        </div>
      </header>

      <Card className="p-8 border-primary/20 bg-primary/5 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight mb-2">Coming in Phase 2</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The Academics module is currently offline. Phase 2 initialization will deploy comprehensive study tracking and grade analytics.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
            <Calendar className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-semibold mb-1">Study Timetable</h4>
            <p className="text-xs text-muted-foreground text-center">Spaced repetition scheduling</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
            <TrendingUp className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-semibold mb-1">Grade Predictor</h4>
            <p className="text-xs text-muted-foreground text-center">Real-time GPA forecasting</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
            <Target className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-semibold mb-1">Syllabus Tracker</h4>
            <p className="text-xs text-muted-foreground text-center">Visual completion metrics</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Study Hours</p>
            <p className="text-3xl font-bold mt-1">{sampleData.user.stats.studyHours}h</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
        </Card>
      </div>
    </div>
  );
}
