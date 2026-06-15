const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function getAccessToken(): string | null {
  return localStorage.getItem('sb-access-token');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('sb-access-token', accessToken);
  localStorage.setItem('sb-refresh-token', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('sb-access-token');
  localStorage.removeItem('sb-refresh-token');
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  const existing = options.headers as Record<string, string> | undefined;
  if (existing) {
    for (const [k, v] of Object.entries(existing)) {
      headers[k] = v;
    }
  }
  if (!headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  return fetch(fullUrl, { ...options, headers });
}
