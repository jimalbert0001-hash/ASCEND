import type { CoachRole, UserContext, Recommendation, WeaknessReport, GoalAnalysis } from '@/stores/ai.store';
import { apiFetch } from './api-fetch';

const BASE = '/api/ai';

async function postApi(path: string, body: unknown): Promise<Response> {
  return apiFetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function checkProviderStatus(): Promise<{
  provider: string;
  configured: boolean;
  envVar: string;
}> {
  const res = await apiFetch(`${BASE}/status`);
  if (!res.ok) throw new Error('Failed to check AI status');
  return res.json();
}

export async function sendChatMessage(
  messages: AIMessage[],
  role: CoachRole,
  userId: string,
  personalityOverride?: string
): Promise<{ content: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const res = await postApi('/chat', { messages, role, userId, stream: false, personalityOverride });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json() as {
    content: string;
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  };
  return { content: data.content, usage: data.usage };
}

export async function sendChatMessageStream(
  messages: AIMessage[],
  role: CoachRole,
  userId: string,
  onChunk: (chunk: string) => void,
  personalityOverride?: string,
  onUsage?: (usage: { promptTokens: number; completionTokens: number; totalTokens: number }) => void
): Promise<void> {
  const res = await postApi('/chat', { messages, role, userId, stream: true, personalityOverride });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n').filter((l) => l.startsWith('data: '));

    for (const line of lines) {
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload) as {
          chunk?: string;
          error?: string;
          usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
        };
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.chunk) onChunk(parsed.chunk);
        if (parsed.usage && onUsage) onUsage(parsed.usage);
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
}

export async function getDailyRecommendations(userId: string): Promise<{
  recommendations: Recommendation[];
  morningBriefing: string;
}> {
  const res = await postApi('/recommendations/daily', { userId });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getWeeklyRecommendations(userId: string): Promise<{
  recommendations: Recommendation[];
  weeklyDigest: string;
}> {
  const res = await postApi('/recommendations/weekly', { userId });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function detectWeaknesses(userId: string): Promise<{
  weaknesses: WeaknessReport[];
}> {
  const res = await postApi('/recommendations/weaknesses', { userId });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function analyzeGoals(userId: string): Promise<{
  analyses: GoalAnalysis[];
}> {
  const res = await postApi('/analyze/goals', { userId });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export function buildUserContext(_sampleData: unknown): UserContext {
  return {
    user: { name: 'User', stats: { studyHours: 0, chessRating: 0, habitStreak: 0 }, activeDomains: [] },
    goals: [],
    tasks: [],
    achievements: [],
  };
}
