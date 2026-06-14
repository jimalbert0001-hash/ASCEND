import { GraduationCap, Rocket, Crown, Music, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoachRole } from '@/stores/ai.store';

interface Coach {
  role: CoachRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

const COACHES: Coach[] = [
  {
    role: 'achievement',
    label: 'Achievement',
    description: 'Cross-domain optimization',
    icon: Trophy,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
  },
  {
    role: 'academic',
    label: 'Academic',
    description: 'Board exam & study strategy',
    icon: GraduationCap,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
  {
    role: 'startup',
    label: 'Startup',
    description: 'Product & growth coaching',
    icon: Rocket,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/30',
  },
  {
    role: 'chess',
    label: 'Chess',
    description: 'Rating & tactics improvement',
    icon: Crown,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10 border-purple-500/30',
  },
  {
    role: 'guitar',
    label: 'Guitar',
    description: 'Practice & skill mastery',
    icon: Music,
    color: 'text-green-500',
    bg: 'bg-green-500/10 border-green-500/30',
  },
];

interface CoachSelectorProps {
  value: CoachRole;
  onChange: (role: CoachRole) => void;
  compact?: boolean;
}

export function CoachSelector({ value, onChange, compact = false }: CoachSelectorProps) {
  if (compact) {
    return (
      <div className="flex gap-1.5 flex-wrap">
        {COACHES.map((c) => {
          const Icon = c.icon;
          const active = value === c.role;
          return (
            <button
              key={c.role}
              onClick={() => onChange(c.role)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                active
                  ? `${c.bg} ${c.color} border-current`
                  : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {COACHES.map((c) => {
        const Icon = c.icon;
        const active = value === c.role;
        return (
          <button
            key={c.role}
            onClick={() => onChange(c.role)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center',
              active
                ? `${c.bg} ${c.color}`
                : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground bg-card'
            )}
          >
            <Icon className={cn('w-5 h-5', active ? c.color : '')} />
            <span className="text-xs font-medium leading-tight">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { COACHES };
export type { Coach };
