import type { CoachRole, UserContext, Recommendation, WeaknessReport, GoalAnalysis } from '@/stores/ai.store';

const BASE = '/api/ai';

async function apiFetch(path: string, body: unknown): Promise<Response> {
  return fetch(`${BASE}${path}`, {
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
  const res = await fetch(`${BASE}/status`);
  if (!res.ok) throw new Error('Failed to check AI status');
  return res.json();
}

export async function sendChatMessage(
  messages: AIMessage[],
  role: CoachRole,
  userId: string
): Promise<string> {
  const res = await apiFetch('/chat', { messages, role, userId, stream: false });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json() as { content: string };
  return data.content;
}

export async function sendChatMessageStream(
  messages: AIMessage[],
  role: CoachRole,
  userId: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const res = await apiFetch('/chat', { messages, role, userId, stream: true });
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
        const parsed = JSON.parse(payload) as { chunk?: string; error?: string };
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.chunk) onChunk(parsed.chunk);
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
  const res = await apiFetch('/recommendations/daily', { userId });
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
  const res = await apiFetch('/recommendations/weekly', { userId });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function detectWeaknesses(userId: string): Promise<{
  weaknesses: WeaknessReport[];
}> {
  const res = await apiFetch('/recommendations/weaknesses', { userId });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function analyzeGoals(userId: string): Promise<{
  analyses: GoalAnalysis[];
}> {
  const res = await apiFetch('/analyze/goals', { userId });
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
