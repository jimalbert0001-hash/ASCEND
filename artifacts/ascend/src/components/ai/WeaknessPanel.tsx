import { AlertTriangle, RefreshCw, Shield, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { WeaknessReport, UserContext } from '@/stores/ai.store';
import { detectWeaknesses } from '@/lib/ai-api';

const SEVERITY_CONFIG = {
  critical: {
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/30',
    badge: 'bg-red-500/15 text-red-500 border-red-500/30',
    icon: AlertTriangle,
  },
  moderate: {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    badge: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
    icon: AlertCircle,
  },
  minor: {
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/30',
    badge: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    icon: Info,
  },
};

interface WeaknessPanelProps {
  weaknesses: WeaknessReport[] | null;
  context: UserContext;
  onUpdate: (weaknesses: WeaknessReport[]) => void;
}

export function WeaknessPanel({ weaknesses, context, onUpdate }: WeaknessPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await detectWeaknesses(context);
      onUpdate(data.weaknesses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect weaknesses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Biggest Weaknesses</h3>
        <Button size="sm" variant="ghost" onClick={detect} disabled={loading} className="h-7 px-2">
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </Button>
      </div>

      {error && (
        <Card className="p-3 bg-destructive/5 border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </Card>
      )}

      {!weaknesses && !error && (
        <div className="text-center py-6">
          <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground mb-3">Identify your top weaknesses</p>
          <Button size="sm" onClick={detect} disabled={loading} variant="outline">
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : <AlertTriangle className="w-3.5 h-3.5 mr-2" />}
            {loading ? 'Analyzing...' : 'Detect Weaknesses'}
          </Button>
        </div>
      )}

      {weaknesses && weaknesses.length > 0 && (
        <div className="space-y-3">
          {weaknesses.map((w, idx) => {
            const cfg = SEVERITY_CONFIG[w.severity];
            const Icon = cfg.icon;
            return (
              <div key={idx} className={cn('rounded-xl border p-3.5', cfg.bg)}>
                <div className="flex items-start gap-2.5">
                  <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', cfg.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-xs px-1.5 py-0.5 rounded border capitalize font-medium', cfg.badge)}>
                        {w.severity}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">{w.domain}</span>
                    </div>
                    <p className="text-sm font-semibold leading-tight mb-1.5">{w.weakness}</p>
                    <p className="text-xs opacity-70 mb-2 leading-relaxed">
                      <span className="font-medium">Evidence: </span>{w.evidence}
                    </p>
                    <div className="border-t border-current/10 pt-2 mt-2">
                      <p className="text-xs leading-relaxed">
                        <span className="font-medium opacity-70">Fix: </span>{w.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
