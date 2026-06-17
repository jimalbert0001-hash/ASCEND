import { Bot, MessageSquare, BarChart3, Calendar, Target, Shield, PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ChatInterface } from '@/components/ai/ChatInterface';
import { ConversationHistory } from '@/components/ai/ConversationHistory';
import { RecommendationPanel } from '@/components/ai/RecommendationPanel';
import { WeaknessPanel } from '@/components/ai/WeaknessPanel';
import { GoalAnalysisPanel } from '@/components/ai/GoalAnalysisPanel';
import { CoachSelector } from '@/components/ai/CoachSelector';

import { useAIStore, type CoachRole, type Recommendation, type WeaknessReport, type GoalAnalysis, type UserContext } from '@/stores/ai.store';
import { useAuth } from '@/providers/AuthProvider';
import { apiFetch } from '@/lib/api-fetch';

const BASE = '/api/ai';

async function fetchContext(userId: string): Promise<UserContext | null> {
  try {
    const res = await apiFetch(`${BASE}/context?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    return res.json() as Promise<UserContext>;
  } catch {
    return null;
  }
}

export function AIMentorPage() {
  const {
    conversations,
    activeConversationId,
    activeRole,
    dailyRecommendations,
    morningBriefing,
    weeklyRecommendations,
    weeklyDigest,
    weaknesses,
    goalAnalyses,
    setActiveRole,
    setActiveConversation,
    newConversation,
    deleteConversation,
    setDailyRecommendations,
    setWeeklyRecommendations,
    setWeaknesses,
    setGoalAnalyses,
  } = useAIStore();

  const { user } = useAuth();
  const userId = user?.id ?? 'mock-user-1';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights'>('chat');
  const [context, setContext] = useState<UserContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);

  useEffect(() => {
    setContextLoading(true);
    fetchContext(userId)
      .then(setContext)
      .finally(() => setContextLoading(false));
  }, [userId]);

  const handleNewConversation = () => {
    newConversation(activeRole);
    setActiveTab('chat');
  };

  const handleRoleChange = (role: CoachRole) => {
    setActiveRole(role);
    newConversation(role);
    setActiveTab('chat');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {sidebarOpen && (
        <aside className="w-64 flex-shrink-0 border-r border-border flex flex-col bg-background/50">
          <div className="flex items-center justify-between px-3 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">AI Mentor</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>

          <div className="px-3 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Coach Mode</p>
            <CoachSelector value={activeRole} onChange={handleRoleChange} compact />
          </div>

          <div className="flex-1 overflow-hidden">
            <ConversationHistory
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={setActiveConversation}
              onDelete={deleteConversation}
              onNew={handleNewConversation}
            />
          </div>

          <div className="px-3 py-3 border-t border-border">
            {contextLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading your data…
              </div>
            ) : context ? (
              <StatsCard context={context} />
            ) : null}
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 border-b border-border px-4 py-2.5 flex items-center gap-2">
          {!sidebarOpen && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeftOpen className="w-4 h-4" />
            </Button>
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'insights')} className="flex-1">
            <TabsList className="h-8 bg-muted/50">
              <TabsTrigger value="chat" className="text-xs h-7 gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs h-7 gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Insights
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatInterface userId={userId} />
          ) : (
            <InsightsView
              userId={userId}
              dailyRecommendations={dailyRecommendations}
              morningBriefing={morningBriefing}
              weeklyRecommendations={weeklyRecommendations}
              weeklyDigest={weeklyDigest}
              weaknesses={weaknesses}
              goalAnalyses={goalAnalyses}
              onSetDailyRecs={setDailyRecommendations}
              onSetWeeklyRecs={setWeeklyRecommendations}
              onSetWeaknesses={setWeaknesses}
              onSetGoalAnalyses={setGoalAnalyses}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface InsightsViewProps {
  userId: string;
  dailyRecommendations: Recommendation[] | null;
  morningBriefing: string | null;
  weeklyRecommendations: Recommendation[] | null;
  weeklyDigest: string | null;
  weaknesses: WeaknessReport[] | null;
  goalAnalyses: GoalAnalysis[] | null;
  onSetDailyRecs: (recs: Recommendation[], text: string) => void;
  onSetWeeklyRecs: (recs: Recommendation[], text: string) => void;
  onSetWeaknesses: (w: WeaknessReport[]) => void;
  onSetGoalAnalyses: (a: GoalAnalysis[]) => void;
}

type InsightTab = 'daily' | 'weekly' | 'weaknesses' | 'goals';

const INSIGHT_TABS: { id: InsightTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'daily', label: 'Daily', icon: Calendar },
  { id: 'weekly', label: 'Weekly', icon: BarChart3 },
  { id: 'weaknesses', label: 'Weaknesses', icon: Shield },
  { id: 'goals', label: 'Goals', icon: Target },
];

function InsightsView({
  userId,
  dailyRecommendations,
  morningBriefing,
  weeklyRecommendations,
  weeklyDigest,
  weaknesses,
  goalAnalyses,
  onSetDailyRecs,
  onSetWeeklyRecs,
  onSetWeaknesses,
  onSetGoalAnalyses,
}: InsightsViewProps) {
  const [activeInsight, setActiveInsight] = useState<InsightTab>('daily');

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-44 flex-shrink-0 border-r border-border p-2 space-y-1">
        {INSIGHT_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveInsight(tab.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                activeInsight === tab.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </aside>

      <div className="flex-1 overflow-y-auto p-4">
        {activeInsight === 'daily' && (
          <RecommendationPanel
            recommendations={dailyRecommendations}
            morningBriefing={morningBriefing}
            userId={userId}
            type="daily"
            onUpdate={onSetDailyRecs}
          />
        )}
        {activeInsight === 'weekly' && (
          <RecommendationPanel
            recommendations={weeklyRecommendations}
            weeklyDigest={weeklyDigest}
            userId={userId}
            type="weekly"
            onUpdate={onSetWeeklyRecs}
          />
        )}
        {activeInsight === 'weaknesses' && (
          <WeaknessPanel
            weaknesses={weaknesses}
            userId={userId}
            onUpdate={onSetWeaknesses}
          />
        )}
        {activeInsight === 'goals' && (
          <GoalAnalysisPanel
            analyses={goalAnalyses}
            userId={userId}
            onUpdate={onSetGoalAnalyses}
          />
        )}
      </div>
    </div>
  );
}

function StatsCard({ context }: { context: UserContext }) {
  const items = [
    { label: 'Streak', value: `${context.reviews?.streak ?? 0}d` },
    { label: 'Study', value: `${context.user?.stats?.studyHours ?? 0}h` },
    { label: 'Chess', value: `${context.user?.stats?.chessRating ?? 0}` },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium">Your Stats</p>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{item.label}</span>
          <span className="text-xs font-semibold">{item.value}</span>
        </div>
      ))}
      {(context.goals ?? []).length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-1">Goals</p>
          {(context.goals ?? []).slice(0, 3).map((g: { id: string; title: string; progress: number }) => (
            <div key={g.id} className="mb-1.5">
              <div className="flex justify-between mb-0.5">
                <span className="text-xs truncate text-muted-foreground" style={{ maxWidth: '80%' }}>{g.title.split(' ').slice(0, 3).join(' ')}</span>
                <span className="text-xs font-medium">{g.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1">
                <div
                  className="h-1 rounded-full bg-primary/60 transition-all"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
