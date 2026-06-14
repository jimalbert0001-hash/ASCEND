import { MessageSquare, Trash2, Plus, GraduationCap, Rocket, Crown, Music, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation, CoachRole } from '@/stores/ai.store';

const ROLE_ICONS: Record<CoachRole, React.ComponentType<{ className?: string }>> = {
  achievement: Trophy,
  academic: GraduationCap,
  startup: Rocket,
  chess: Crown,
  guitar: Music,
};

const ROLE_COLORS: Record<CoachRole, string> = {
  achievement: 'text-yellow-500',
  academic: 'text-blue-500',
  startup: 'text-orange-500',
  chess: 'text-purple-500',
  guitar: 'text-green-500',
};

interface ConversationHistoryProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function ConversationHistory({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: ConversationHistoryProps) {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors border border-primary/20"
        >
          <Plus className="w-4 h-4" />
          New conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const Icon = ROLE_ICONS[conv.role];
            const isActive = conv.id === activeId;

            return (
              <div
                key={conv.id}
                className={cn(
                  'group flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors',
                  isActive
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50 border border-transparent'
                )}
                onClick={() => onSelect(conv.id)}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', ROLE_COLORS[conv.role])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{conv.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTime(conv.updatedAt)} · {conv.messages.length} msgs
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
