import {
  Zap, Lightbulb, AlertTriangle, PartyPopper,
  RefreshCw, ChevronDown, ChevronUp, GraduationCap,
  Rocket, Crown, Music, Trophy, Activity
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Recommendation, UserContext } from '@/stores/ai.store';
import { getDailyRecommendations, getWeeklyRecommendations } from '@/lib/ai-api';

const TYPE_ICONS = {
  action: Zap,
  insight: Lightbulb,
  warning: AlertTriangle,
  celebration: PartyPopper,
};

const TYPE_COLORS = {
  action: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  insight: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  warning: 'text-red-500 bg-red-500/10 border-red-500/20',
  celebration: 'text-green-500 bg-green-500/10 border-green-500/20',
};

const PRIORITY_COLORS = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-muted text-muted-foreground border-border',
};

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  academics: GraduationCap,
  startup: Rocket,
  chess: Crown,
  guitar: Music,
  life: Activity,
};

interface RecommendationCardProps {
  rec: Recommendation;
}

function RecommendationCard({ rec }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const TypeIcon = TYPE_ICONS[rec.type] ?? Zap;
  const DomainIcon = DOMAIN_ICONS[rec.domain] ?? Activity;

  return (
    <div
      className={cn(
        'rounded-xl border p-3.5 transition-all cursor-pointer',
        TYPE_COLORS[rec.type],
        'hover:opacity-90'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2.5">
        <TypeIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <DomainIcon className="w-3 h-3 opacity-60" />
            <span className="text-xs opacity-60 capitalize">{rec.domain}</span>
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full border ml-auto capitalize', PRIORITY_COLORS[rec.priority])}>
              {rec.priority}
            </span>
          </div>
          <p className="text-sm font-medium leading-tight">{rec.title}</p>
          {expanded && (
            <p className="text-xs mt-2 leading-relaxed opacity-80">{rec.detail}</p>
          )}
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-60" />}
      </div>
    </div>
  );
}

interface RecommendationPanelProps {
  recommendations: Recommendation[] | null;
  morningBriefing?: string | null;
  weeklyDigest?: string | null;
  context: UserContext;
  type: 'daily' | 'weekly';
  onUpdate: (recs: Recommendation[], text: string) => void;
}

export function RecommendationPanel({
  recommendations,
  morningBriefing,
  weeklyDigest,
  context,
  type,
  onUpdate,
}: RecommendationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const briefingText = type === 'daily' ? morningBriefing : weeklyDigest;

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      if (type === 'daily') {
        const data = await getDailyRecommendations(context);
        onUpdate(data.recommendations, data.morningBriefing);
      } else {
        const data = await getWeeklyRecommendations(context);
        onUpdate(data.recommendations, data.weeklyDigest);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize">{type} Recommendations</h3>
        <Button size="sm" variant="ghost" onClick={refresh} disabled={loading} className="h-7 px-2">
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </Button>
      </div>

      {briefingText && (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <p className="text-xs text-muted-foreground leading-relaxed">{briefingText}</p>
        </Card>
      )}

      {error && (
        <Card className="p-3 bg-destructive/5 border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Make sure an AI provider is configured.</p>
        </Card>
      )}

      {!recommendations && !error && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">Generate your {type} recommendations</p>
          <Button size="sm" onClick={refresh} disabled={loading}>
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : <Zap className="w-3.5 h-3.5 mr-2" />}
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="space-y-2">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
