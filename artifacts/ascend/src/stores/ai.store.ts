import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CoachRole = 'academic' | 'startup' | 'chess' | 'guitar' | 'achievement';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  role: CoachRole;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface Recommendation {
  id: string;
  domain: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
  type: 'action' | 'insight' | 'warning' | 'celebration';
}

export interface WeaknessReport {
  domain: string;
  weakness: string;
  evidence: string;
  suggestion: string;
  severity: 'critical' | 'moderate' | 'minor';
}

export interface GoalAnalysis {
  goalId: string;
  goalTitle: string;
  domain: string;
  progress: number;
  assessment: string;
  blockers: string[];
  nextSteps: string[];
  projectedCompletion?: string;
  riskLevel: 'on-track' | 'at-risk' | 'off-track';
}

export interface UserContext {
  user: {
    name: string;
    stats: { studyHours: number; chessRating: number; habitStreak: number };
    activeDomains: string[];
  };
  goals: Array<{ id: string; title: string; domain: string; progress: number; status: string }>;
  tasks: Array<{ id: string; title: string; domain: string; due?: string; priority: string; completed: boolean }>;
  achievements?: Array<{ title: string; description: string; earned: boolean; type: string }>;
  studyData?: { totalHours: number; subjectBreakdown?: Array<{ name: string; hours: number }>; recentTests?: Array<{ name: string; score: number; date: string }>; weakChapters?: string[] };
  startupData?: { projects?: Array<{ name: string; stage: string; mrr?: number; users?: number }>; topMetrics?: Array<{ name: string; value: number; unit: string }>; pendingFeatures?: number };
  chessData?: { currentRating: number; ratingGoal: number; winRate: number; tacticsAccuracy?: number; recentSessions?: Array<{ type: string; date: string; result?: string }> };
  guitarData?: { totalPracticeHours: number; songsLearning: number; songsMastered: number; recentFocusAreas?: string[]; currentBpm?: number };
  reviews?: { lastDailyScore?: number; weeklyAvgScore?: number; streak?: number; recentMood?: string };
}

interface AIState {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeRole: CoachRole;
  isStreaming: boolean;
  streamingContent: string;

  dailyRecommendations: Recommendation[] | null;
  morningBriefing: string | null;
  weeklyRecommendations: Recommendation[] | null;
  weeklyDigest: string | null;
  weaknesses: WeaknessReport[] | null;
  goalAnalyses: GoalAnalysis[] | null;

  setActiveRole: (role: CoachRole) => void;
  setActiveConversation: (id: string | null) => void;
  newConversation: (role: CoachRole) => string;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  appendStreamChunk: (conversationId: string, chunk: string) => void;
  finalizeStream: (conversationId: string) => void;
  setIsStreaming: (v: boolean) => void;
  setStreamingContent: (v: string) => void;
  deleteConversation: (id: string) => void;
  setDailyRecommendations: (recs: Recommendation[], briefing: string) => void;
  setWeeklyRecommendations: (recs: Recommendation[], digest: string) => void;
  setWeaknesses: (w: WeaknessReport[]) => void;
  setGoalAnalyses: (a: GoalAnalysis[]) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      activeRole: 'achievement',
      isStreaming: false,
      streamingContent: '',
      dailyRecommendations: null,
      morningBriefing: null,
      weeklyRecommendations: null,
      weeklyDigest: null,
      weaknesses: null,
      goalAnalyses: null,

      setActiveRole: (role) => set({ activeRole: role }),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      newConversation: (role) => {
        const id = generateId();
        const conv: Conversation = {
          id,
          role,
          title: 'New conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ conversations: [conv, ...s.conversations], activeConversationId: id }));
        return id;
      },

      addMessage: (conversationId, msg) => {
        const id = generateId();
        const message: ChatMessage = { ...msg, id, timestamp: Date.now() };
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const msgs = [...c.messages, message];
            const title =
              c.messages.length === 0 && msg.role === 'user'
                ? msg.content.slice(0, 50) + (msg.content.length > 50 ? '…' : '')
                : c.title;
            return { ...c, messages: msgs, title, updatedAt: Date.now() };
          }),
        }));
        return id;
      },

      appendStreamChunk: (conversationId, chunk) => {
        set((s) => ({
          streamingContent: s.streamingContent + chunk,
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.role === 'assistant' && last.id === 'streaming') {
              msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
            } else {
              msgs.push({
                id: 'streaming',
                role: 'assistant',
                content: chunk,
                timestamp: Date.now(),
              });
            }
            return { ...c, messages: msgs, updatedAt: Date.now() };
          }),
        }));
      },

      finalizeStream: (conversationId) => {
        const finalContent = get().streamingContent;
        set((s) => ({
          isStreaming: false,
          streamingContent: '',
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const msgs = c.messages.map((m) =>
              m.id === 'streaming'
                ? { ...m, id: generateId(), content: finalContent || m.content }
                : m
            );
            return { ...c, messages: msgs, updatedAt: Date.now() };
          }),
        }));
      },

      setIsStreaming: (v) => set({ isStreaming: v }),
      setStreamingContent: (v) => set({ streamingContent: v }),

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
        })),

      setDailyRecommendations: (recs, briefing) =>
        set({ dailyRecommendations: recs, morningBriefing: briefing }),

      setWeeklyRecommendations: (recs, digest) =>
        set({ weeklyRecommendations: recs, weeklyDigest: digest }),

      setWeaknesses: (w) => set({ weaknesses: w }),
      setGoalAnalyses: (a) => set({ goalAnalyses: a }),
    }),
    {
      name: 'ascend-ai-storage',
      partialize: (s) => ({
        conversations: s.conversations.slice(0, 50),
        activeRole: s.activeRole,
        dailyRecommendations: s.dailyRecommendations,
        morningBriefing: s.morningBriefing,
        weeklyRecommendations: s.weeklyRecommendations,
        weeklyDigest: s.weeklyDigest,
        weaknesses: s.weaknesses,
        goalAnalyses: s.goalAnalyses,
      }),
    }
  )
);
