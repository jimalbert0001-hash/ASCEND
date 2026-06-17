import { apiFetch } from './api-fetch';

export async function buildContextSnapshot(userId: string): Promise<string> {
  try {
    const res = await apiFetch(`/api/ai/context`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as Record<string, unknown>;
    return JSON.stringify(data, null, 2);
  } catch {
    return `{"userId":"${userId}","error":"Could not load user data"}`;
  }
}
