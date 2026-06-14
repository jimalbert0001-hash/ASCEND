const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  return fetch(fullUrl, { ...options, headers, credentials: 'include' });
}
