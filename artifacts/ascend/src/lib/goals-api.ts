// ─── Goals API client ────────────────────────────────────────

export interface GoalDto {
  id: string;
  domain: string;
  title: string;
  description?: string | null;
  progress: number;
  targetValue?: number;
  status: string;
  aiMetadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalUpdate {
  id: string;
  domain?: string;
  title?: string;
  description?: string;
  progress?: number;
  targetValue?: number;
  status?: string;
}

const API_BASE = '/api/data';

export async function fetchGoals(userId: string): Promise<GoalDto[]> {
  const res = await fetch(`${API_BASE}/goals?userId=${encodeURIComponent(userId)}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to fetch goals: ${res.status}`);
  const raw = await res.json() as Array<Record<string, unknown>>;
  return raw.map((g) => ({
    id: String(g.id),
    domain: String(g.domain),
    title: String(g.title),
    description: g.description == null ? undefined : String(g.description),
    progress: parseGoalProgress(g.progress as string | number | null | undefined),
    targetValue: extractTargetValue(g as any) ?? (g.targetValue != null ? Number(g.targetValue) : undefined),
    status: String(g.status ?? 'in_progress'),
    aiMetadata: g.aiMetadata as Record<string, unknown> | undefined,
    createdAt: g.createdAt ? String(g.createdAt) : undefined,
    updatedAt: g.updatedAt ? String(g.updatedAt) : undefined,
  }));
}

export async function saveGoals(userId: string, goals: GoalUpdate[]): Promise<GoalDto[]> {
  const res = await fetch(`${API_BASE}/goals`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, goals }),
  });
  if (!res.ok) throw new Error(`Failed to save goals: ${res.status}`);
  return res.json();
}

export function parseGoalProgress(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  const n = typeof raw === 'string' ? parseFloat(raw) : raw;
  return Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
}

export function extractTargetValue(goal: GoalDto): number | undefined {
  const meta = goal.aiMetadata;
  if (meta && typeof meta === 'object' && 'targetValue' in meta) {
    const tv = meta.targetValue;
    if (typeof tv === 'number') return tv;
  }
  return undefined;
}
