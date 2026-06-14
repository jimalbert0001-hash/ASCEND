export type AIRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResult {
  content: string;
  usage?: TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  chat(messages: AIMessage[], options?: ChatOptions): Promise<ChatResult>;
  streamChat(
    messages: AIMessage[],
    options?: ChatOptions,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResult>;
}

export type CoachRole =
  | 'academic'
  | 'startup'
  | 'chess'
  | 'guitar'
  | 'achievement';

export interface UserContext {
  user: {
    name: string;
    stats: {
      studyHours: number;
      chessRating: number;
      habitStreak: number;
    };
    activeDomains: string[];
  };
  goals: Array<{
    id: string;
    title: string;
    domain: string;
    progress: number;
    status?: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    domain: string;
    due?: string;
    priority: string;
    completed: boolean;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    earned: boolean;
    type?: string;
  }>;
  studyData?: {
    totalHours: number;
    subjectBreakdown?: Array<{ name: string; hours: number; score?: number }>;
    recentTests?: Array<{ name: string; score: number; date: string }>;
    weakChapters?: string[];
  };
  startupData?: {
    projects?: Array<{ name: string; stage: string; mrr?: number; users?: number }>;
    topMetrics?: Array<{ name: string; value: number; unit: string }>;
    pendingFeatures?: number;
  };
  chessData?: {
    currentRating: number;
    ratingGoal: number;
    winRate?: number;
    tacticsAccuracy?: number;
    recentSessions?: Array<{ type: string; date: string; result?: string }>;
  };
  guitarData?: {
    totalPracticeHours: number;
    songsLearning?: number;
    songsMastered?: number;
    recentFocusAreas?: string[];
    currentBpm?: number;
  };
  reviews?: {
    lastDailyScore?: number;
    weeklyAvgScore?: number;
    streak?: number;
    recentMood?: string;
  };
}

export interface ChatRequest {
  messages: AIMessage[];
  role: CoachRole;
  context: UserContext;
  stream?: boolean;
  personalityOverride?: string;
}

export interface RecommendationRequest {
  context: UserContext;
  type: 'daily' | 'weekly';
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
