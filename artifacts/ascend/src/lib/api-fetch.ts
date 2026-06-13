import { getAuthToken } from "./auth-token";

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const existing = options.headers as Record<string, string> | undefined;
  if (existing) {
    for (const [k, v] of Object.entries(existing)) {
      headers[k] = v;
    }
  }
  if (!headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, { ...options, headers });
}
