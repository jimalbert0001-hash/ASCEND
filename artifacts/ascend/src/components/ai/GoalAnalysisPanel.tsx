import { Target, RefreshCw, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { GoalAnalysis } from '@/stores/ai.store';
import { analyzeGoals } from '@/lib/ai-api';

const RISK_CONFIG = {
  'on-track': {
    label: 'On Track',
    color: 'text-green-500',
    bg: 'bg-green-500/10 border-green-500/30',
    badge: 'bg-green-500/15 text-green-500 border-green-500/30',
    icon: TrendingUp,
  },
  'at-risk': {
    label: 'At Risk',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    badge: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
    icon: Minus,
  },
  'off-track': {
    label: 'Off Track',
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/30',
    badge: 'bg-red-500/15 text-red-500 border-red-500/30',
    icon: TrendingDown,
  },
};

function GoalCard({ analysis }: { analysis: GoalAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RISK_CONFIG[analysis.riskLevel];
  const StatusIcon = cfg.icon;

  return (
    <div className={cn('rounded-xl border', cfg.bg)}>
      <div
        className="p-3.5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-2.5">
          <StatusIcon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', cfg.color)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium', cfg.badge)}>
                {cfg.label}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{analysis.domain}</span>
              <span className="ml-auto text-xs font-medium">{analysis.progress}%</span>
            </div>

            <p className="text-sm font-semibold leading-tight mb-1">{analysis.goalTitle}</p>

            <div className="w-full bg-current/10 rounded-full h-1 mb-1">
              <div
                className={cn('h-1 rounded-full transition-all', cfg.color, 'bg-current')}
                style={{ width: `${Math.min(analysis.progress, 100)}%` }}
              />
            </div>

            {analysis.projectedCompletion && (
              <p className="text-xs opacity-60 mt-1">{analysis.projectedCompletion}</p>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 flex-shrink-0 opacity-50" />
          ) : (
            <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-current/10 pt-3">
          <p className="text-xs leading-relaxed opacity-80">{analysis.assessment}</p>

          {analysis.blockers.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1.5 opacity-70">Blockers</p>
              <ul className="space-y-1">
                {analysis.blockers.map((b, i) => (
                  <li key={i} className="text-xs flex gap-2 items-start opacity-75">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.nextSteps.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1.5 opacity-70">Next Steps</p>
              <ul className="space-y-1">
                {analysis.nextSteps.map((s, i) => (
                  <li key={i} className="text-xs flex gap-2 items-start">
                    <span className="text-xs font-bold opacity-50 flex-shrink-0">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface GoalAnalysisPanelProps {
  analyses: GoalAnalysis[] | null;
  userId: string;
  onUpdate: (analyses: GoalAnalysis[]) => void;
}

export function GoalAnalysisPanel({ analyses, userId, onUpdate }: GoalAnalysisPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeGoals(userId);
      onUpdate(data.analyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze goals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Goal Analysis</h3>
        <Button size="sm" variant="ghost" onClick={analyze} disabled={loading} className="h-7 px-2">
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </Button>
      </div>

      {error && (
        <Card className="p-3 bg-destructive/5 border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </Card>
      )}

      {!analyses && !error && (
        <div className="text-center py-6">
          <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground mb-3">Analyze your goal trajectory</p>
          <Button size="sm" onClick={analyze} disabled={loading} variant="outline">
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : <Target className="w-3.5 h-3.5 mr-2" />}
            {loading ? 'Analyzing...' : 'Analyze Goals'}
          </Button>
        </div>
      )}

      {analyses && analyses.length > 0 && (
        <div className="space-y-2">
          {analyses.map((a, idx) => (
            <GoalCard key={a.goalId ?? idx} analysis={a} />
          ))}
        </div>
      )}
    </div>
  );
}
